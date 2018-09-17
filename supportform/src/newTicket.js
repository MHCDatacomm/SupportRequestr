const request = require('request')
const crypto = require('crypto')

const HASH_SECRET = 'HJcF4WFQnUJN8Uj9erzF6XBky74aLjSiGd0+kFnvGNg';

var SERVER_PATH = 'https://www.mhcdce.com/leads_process/kFtWsMlZoRe5gXg62eTb5ehELm.php';
if (process.env.NODE_ENV == "development") {
	SERVER_PATH = 'http://localhost/leads_process/kFtWsMlZoRe5gXg62eTb5ehELm.php';
}

/**
 * Add an event listener to process the form submission
 */
document.getElementById('submitbutton').addEventListener('click', function(e) {
	e.preventDefault()

	if ( ! $('#submitTicketForm').parsley().isValid()) {
		if (process.env.NODE_ENV != "development") {
			showMessage("Please complete all required * fields.", "warning")
			return
		}
	}

	$('#submitbutton').attr('disabled', 'disabled');

	const r = request.post(SERVER_PATH, function(error, httpResponse, body) {
		if (httpResponse.statusCode != 200) {
			console.log(error, httpResponse, body)
			showMessage("Request failed: Error " + httpResponse.statusCode)

			$('#submitbutton').removeAttr('disabled')

			return
		}

		if (error) {
			console.log(error)
			showMessage('Request failed: ' + error)

			$('#submitbutton').removeAttr('disabled')

			return
		}

		console.log(body)
		var jsonResponse = JSON.parse(body)
		if (jsonResponse.success) {
			// exit the app after a successful submission
			electron.remote.app.quit()
			return
			
			 showMessage("Request Submitted")

			// // we should clear the form
			// document.getElementById('submitTicketForm').reset()
			// document.getElementById('hostname').value = os.hostname

			// // clear the screenshot preview
			// document.getElementById('screenshot-path').innerHTML = "Screenshot thumbnail here"
			// document.getElementById('screen-shot-preview').style.display = 'none'

			// // clear the pic preview
			// $('#selectedPicPreview').text('Image preview will appear here ')
			// $('#selectedPicDetails').html('')
			// document.getElementById('pic-preview').style.display = 'none'

			 $('#submitbutton').removeAttr('disabled')
		} else {
			showMessage(jsonResponse.details, 'error')

			$('#submitbutton').removeAttr('disabled')
		}
	})

	// the string that will form the body of our hash value
	var hash_string = ''

	const jqFormArray = $('#submitTicketForm').serializeArray()
	const formData = r.form()
	
	jqFormArray.forEach(function(field) {
		formData.append(field.name, field.value)

		hash_string += field.name + ':' + field.value + ','
	})

	// create a security hash
	// var hashed = crypto.createHmac('sha256', HASH_SECRET)
	var hashed    = crypto.createHash('sha256')
                   .update(hash_string + HASH_SECRET)
                   .digest('hex');

    // add the hash string to the request
    formData.append('hash_string', hash_string)
    formData.append('hashed', hashed)

	// add the selected file to the form or load the screenshot as the case may be
	const files = document.getElementById('imageUpload').files
	if (files.length) {
		console.log(files)
		const file = files[0]

		formData.append('file', fs.createReadStream(file.path), {
			filename: file.name,
			contentType: file.type
		})
	} else if (! files.length && window.screenshotTAKEN === true) {
		formData.append('file', fs.createReadStream(window.screenshotPATH), {
			filename: window.screenshotNAME
		})
	}
})