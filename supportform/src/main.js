const {BrowserWindow, app} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs-extra')

/**
 * Append chrome command line switches to enable smooth scrolling
 */
app.commandLine.appendSwitch('--enable-overlay-scrollbar')
app.commandLine.appendSwitch('--enable-smooth-scrolling')

// init win
let win;

function createWindow(){
  // Create browser window
  win = new BrowserWindow({
    center: true,
    // Comment out 'resizable: false' for development.
    resizable: false,
    minimizable: false,
    maximizable: false,
    width: 538,
    height: 530,
    icon: path.join(__dirname, './icon.png'),
    title: app.getName(),
  });

// Hides the Menu bar.  Comment this out for development.
  win.setMenu(null);

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools()
  }

// Load index.html
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('close', () => {
    win = null;
  });
}

// create the screenshots folder if it does not exist
var dir = path.join(app.getPath('userData'), 'Screenshots')
fs.ensureDir(dir, function (err) {
  // console.log(err) // => null
  if (err) throw err
  // dir has now been created, including the directory it is to be placed in
})

// Run create window function
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin'){
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})