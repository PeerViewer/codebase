const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
//const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
/*
if (require('electron-squirrel-startup')) {
  app.quit();
}
*/

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Listen for the 'run-node-code' message from the renderer process
ipcMain.on('run-command', (event) => {
	const { exec } = require('child_process');

	exec('zenity --info --text bla', (error, stdout, stderr) => {
	  if (error) {
	    console.error(`error: ${error.message}`);
	    return;
	  }

	  if (stderr) {
	    console.error(`stderr: ${stderr}`);
	    return;
	  }

	  console.log(`stdout:\n${stdout}`);
	});

	  // Execute your Node.js code here
	  const result = 'Node.js code executed successfully!';
	  
	  // Send a response back to the renderer process
	  event.reply('node-code-result', result);
});
