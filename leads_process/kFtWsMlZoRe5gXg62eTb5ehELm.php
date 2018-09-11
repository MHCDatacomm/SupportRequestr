<?php

// https://YOURDOMAIN.repairshopr.com/
define('API_URL', 'https://YOURDOMAIN.repairshopr.com/api/v1');
define('API_KEY', 'YOUR_API_KEY_HERE');
define('BASE_URL', 'YOUR_HOSTED_LOCATION/leads_process');

define('HASH_SECRET', 'HJcF4WFQnUJN8Uj9erzF6XBky74aLjSiGd0+kFnvGNg');

$input = $_POST;
$files = $_FILES;

file_put_contents('debug.txt', json_encode($input).PHP_EOL, FILE_APPEND);
file_put_contents('files.txt', json_encode($files).PHP_EOL, FILE_APPEND);

$uploadFolder = __DIR__.DIRECTORY_SEPARATOR.'uploads'.DIRECTORY_SEPARATOR;

/**
 * Generate a random series of string of any length
 * @param  integer $length the length of the string to be generated
 * @return string
 */
function generate_code( $length = 10 ){
    if ($length <= 0){
        return false;
    }
    $code = "";
    $chars = "abcdefghijklmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    srand( ( double ) microtime() * 1000000 );

    for ($i = 0; $i < $length; $i++)
    {
        $code = $code . substr( $chars, rand() % strlen( $chars ), 1);
    }
    return $code;
}

if (! empty($_POST)) {
	// run some validation 
	$validForm = true;
	if (empty($_POST['subject'])) $validForm = false;
	if (empty($_POST['description'])) $validForm = false;
	if (empty($_POST['name'])) $validForm = false;
	if (empty($_POST['email']) || ! filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
		$validForm = false;
	}
	// if (empty($_POST['phone'])) $validForm = false;
	if (empty($_POST['ticket_type'])) $validForm = false;

	if ($validForm === false) {
		echo json_encode(['success' => false, 'details' => "Form validation failed"]);
		exit;
	}

	// verify the hash the client sent to us so we can know if the data is 
	// coming from a trusted source or not
	// verify the has we got from the client side using the secret key
	$client_hashed = ! empty($input['hashed']) ? $input['hashed'] : null;
	$client_hash_string = ! empty($input['hash_string']) ? $input['hash_string'] : null;

	if (empty($client_hashed) || empty($client_hash_string)) {
		echo json_encode(['success' => false, 'details' => 'Invalid request']);
		exit;
	}

	// generate our own hash
	$our_hashed = hash('sha256', $client_hash_string.HASH_SECRET);

	// check if it matches the one sent by the client
	if ($client_hashed === $our_hashed) {
		// the two hash matches 
		// we can continue safely
	} else {
		// we do not get the same hash 
		// meaning something is wrong with the request data sent to us
		echo json_encode(['success' => false, 'details' => 'Invalid request.']);
		exit;
	}
	
	// the variable that will hold the final url to the file
	$uploaded_file_url = null;

	// First thing we will do is process the uploaded file if one exists 
	// so we can have an absolute url to pass on to Reparishop
	if (! empty($_FILES) AND ! empty($_FILES['file']) AND ! empty($_FILES['file']['tmp_name'])) {
		// a valid file was uploaded...this could be the screenshot or the 
		// selected file chosen from the file input field
		// let's save it 
		$uploaded_name = $_FILES['file']['name'];
		$split = explode('.', $_FILES['file']['name']);
		$ext = $split[(count($split) - 1)];

		$new_name = generate_code(20);
		$new_file_name = "{$new_name}.{$ext}";

		// now store the file
		$moved = move_uploaded_file($_FILES['file']['tmp_name'], $uploadFolder.$new_file_name);

		if ($moved) {
			// the file has been saved 
			// populate the $uploaded_file_url variable 
			$uploaded_file_url = BASE_URL."/uploads/{$new_file_name}";
		} else {
			// the file was not saved 
			echo json_encode(['success' => false, 'details' => 'Failed to process uploaded file!']);
			exit;
		}
	}

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, API_URL."/leads?api_key=".API_KEY);
	curl_setopt($ch, CURLOPT_POST, true);

	$name_split = explode(' ', $_POST['name']);
	$last_name_parts = array_slice($name_split, 1);
	$first_name = $name_split[0];
	$last_name = implode(',', $last_name_parts);

	$postFields = [
		// Uncomment auto_ticket to automatically create tickets
		// 'auto_ticket' => 'true',
		'first_name' => $first_name,
		'last_name' => $last_name,
		'email' => $_POST['email'],
		'phone' => $_POST['phone'],
		'ticket_subject' => $_POST['subject'],
		'ticket_description' => $_POST['description'],
		'asset_ids' => $_POST['hostname'],
		'ticket_problem_type' => $_POST['ticket_type'],
	];

	// curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));

	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($ch);
	file_put_contents('response.txt', $response.PHP_EOL, FILE_APPEND);
	file_put_contents('post.txt', json_encode($postFields).PHP_EOL, FILE_APPEND);

	curl_close($ch);

	$responseJSON = json_decode($response, true);

	if (! empty($responseJSON) AND ! empty($responseJSON['lead'])) {
		// if a file was uploaded...we should post it as well
		if (! empty($uploaded_file_url) AND ! empty($responseJSON['lead']['ticket_id'])) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, API_URL."/tickets/{$responseJSON['lead']['ticket_id']}/attach_file_url?api_key=".API_KEY);
			curl_setopt($ch, CURLOPT_POST, true);

			$postFields = [];
			$postFields['filename'] = $uploaded_name;
			$postFields['url'] = $uploaded_file_url;
			curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));

			curl_setopt($ch, CURLOPT_HEADER, false);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

			$uplResponse = curl_exec($ch);

			curl_close($ch);

			$uplResponseJSON = json_decode($uplResponse, true);

			file_put_contents('attach_response.txt', $uplResponse.PHP_EOL, FILE_APPEND);
			if (! empty($uplResponseJSON)) {
				// the upload seems okay
				echo json_encode(['success' => true, 'lead' => $responseJSON['lead']]);
				exit;
			} else {
				// something went wrong with the file attachment part
				echo json_encode(['success' => false, 'details' => 'Failed to complete request.']);
				exit;
			}
		} else {
			// no uploaded file to process, so we will just return the respons straight
			echo json_encode(['success' => true, 'lead' => $responseJSON['lead']]);
			exit;
		}
	} else {
		// There was an error with the post request made to repair shop
		echo json_encode(['success' => false, 'details' => 'Failed to create the request!', $httpcode]);
		exit;
	}
} else {
	// We only accept post requests
	echo json_encode(['success' => false, 'details' => 'Requests should be made over POST']);
	exit;
}
