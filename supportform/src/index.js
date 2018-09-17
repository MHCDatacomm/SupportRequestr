//Grabs Computer name
// console.log(process);
// let hostname = `
//   <input type="text" name="hostname" placeholder=${os.hostname} readonly />
//   `;
//   document.getElementById('hostname').innerHTML = hostname;
document.getElementById('hostname').value = os.hostname

/**
 * Display the selected file
 */
var picPreview = document.getElementById('pic-preview')
var previewPane = $('#selectedPicPreview')
let selectedPicDetails = $('#selectedPicDetails')
function filePreview(files) {
	// console.log(files)
	if (! files.length) {
		previewPane.text("No file selected!")	
		selectedPicDetails.html('')
		picPreview.style.display = 'none'
		return;
	}

	if (! previewPane) return false

	// only one file can be selected
	let file = files[0]

	previewPane.text('')

	picPreview.src = file.path
	picPreview.style.display = 'inline'

	// truncate file name if it is too long
	let split = file.name.split(".")
	if (split.length) {
	 let fileName = split[0].length > 10 ? split[0].substr(0, 10)+'...'+split[1] : file.name
	 selectedPicDetails.html("<strong>Name:</strong> <em title="+file.name+">"+fileName+"</em> &nbsp;&nbsp; <strong>Size:</strong> <em>"+(file.size / 1000).toFixed(1)+"KB</em>")
	}
}