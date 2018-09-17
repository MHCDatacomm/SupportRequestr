const electron = require('electron')
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const shell = electron.shell;
const remote = electron.remote
const app = remote.app
const dialog = remote.dialog
const BrowserWindow = remote.BrowserWindow

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const screenshot = document.getElementById('screen-shot');
const screenshotMsg = document.getElementById('screenshot-path');
const screenshotPreview = document.getElementById('screen-shot-preview')

let currentWindow = remote.getCurrentWindow()
let mainWindowID = remote.getCurrentWindow().id

window.screenshotNAME = ''
window.screenshotPATH = null
window.screenshotTAKEN = false

screenshot.addEventListener('click', function(e) {
  e.preventDefault()

  console.log("Getting screens")
  screenshotMsg.innerHTML = "Capturing screenshot..."

  const thumbSize = determineScreenShot();
  let options = {types: ['screen'], thumbnailSize: thumbSize};

  // minimize our application window so that it does not show in the screenshot
  // currentWindow.hide()
  // currentWindow.minimize()

  setTimeout(function() {
      desktopCapturer.getSources(options, function(error, sources) {
        if (error) throw error 

        console.log(sources)

        // make sure we have screens to use
        if (! sources.length) {
          // no screens found
          screenshotMsg.innerHTML = "No screen found."
          return
        }
      
        console.log("found " + sources.length + " screens")

        for (let i = 0; i < sources.length; ++i) {
          // get the first screen by id instead of the name 'Entire Screen'
          if (sources[i].id === 'screen:0:0') {
            console.log("Found the first screen")
            // this is the full screen
            // store it in the tmp folder
            // var file_name = "full_screenshot_"+Date.now()+".png"
            var file_name = "full_screenshot.png"
            var screenshotsFolder = path.join(app.getPath('userData'), 'Screenshots')
            const screenshotPath = path.join(screenshotsFolder, file_name)
            console.log("screenshotPath: "+screenshotPath)

            // console.log(sources[i].thumbnail)
            window.screenshotPATH = screenshotPath
            window.screenshotNAME = file_name
            window.screenshotTAKEN = true

            var error = fs.writeFileSync(screenshotPath, sources[i].thumbnail.toPng())

            if (error) throw error 

            console.log("Screenshot write ok!")

            // shell.openExternal('file://' + screenshotPath);
            // screenshotPreview.src = screenshotPath
            screenshotPreview.src = screenshotPath
            screenshotPreview.style.display = 'inline'

            // screenshotMsg.innerHTML = screenshotsFolder + '<br />' + file_name
            screenshotMsg.innerHTML = ''

            // we have saved the screenshot for the Entire screen which should be on the main 
            // screen let's break the loop here
            break;
          } else {
            // we could not find or identify the primary screen to use
            screenshotMsg.innerHTML = "Could not capture the screenshot. No primary display found"
            return
          }

          // show the window at the last item
          if (i === (sources.length - 1)) {
            console.log("Done")
          }
        }

      })
  }, 1000);
})

function determineScreenShot() {
  const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
  const maxDimension = Math.max(screenSize.width, screenSize.height);
  return {
    width: maxDimension * window.devicePixelRatio,
    height: maxDimension * window.devicePixelRatio
  };
}

/**
 * Show a message to the user
 * @param  {string} message the message to show
 * @param  {String} type    the type of the message
 * @return {void}
 */
window.showMessage = function(message, type, callback) {
  var type = type || "info"
  var callback = callback || null

  dialog.showMessageBox(remote.getCurrentWindow(), {
    type: type,
    buttons: ["Ok"],
    title: "Support Request",
    message: message
  }, callback);
}

/**
 * Ask a yes or no message
 * @param  {string} message the message to display to the user
 * @return {void}
 */
window.askYesOrNo = function(message) {
    let choice = dialog.showMessageBox(remote.getCurrentWindow(), {
      type: "warning",
      buttons: ["No", "Yes"],
      defaultId: 0,
      title: "Support Request",
      message: message,
      cancelId: 0
    });

    return choice;
}


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