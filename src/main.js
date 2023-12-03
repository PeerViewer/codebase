const { app, BrowserWindow, ipcMain } = require('electron');
import { existsSync } from 'node:fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

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

// Depending on how the app is launched, the tigervnc folder might be in different locations.
// Search order:
// - relative tigervnc/tigervnc-1.13.1.x86_64/usr/bin/x0vncserver
function findResourceFile(filename) {
	console.log(__dirname)
	console.log(process.cwd())
	// /tmp/.mount_peervizdlxvC/resources/app.asar/.webpack/main
	// becomes
	// /tmp/.mount_peervizdlxvC/resources
	const magicName = "vnc-software/";
	const parts = __dirname.split('/');
	let appImageMount = parts.slice(0, -3).join('/');
	// placesToCheck are directories that should end with a slash
	let placesToCheck = [magicName, appImageMount + "/" + magicName, "/"];
	for (const str of placesToCheck) {
		let fullName = str + filename;
		console.log("checking exists: " + str);
		if (existsSync(str)) {
			console.log("exists: " + str);
			return fullName;
		} else {
			console.log("no exists: " + str);
		}
	}
}

// Listen for the 'run-node-code' message from the renderer process
ipcMain.on('run-server', (event) => {

  if (process.platform !== 'linux') { // win32/darwin not supported
    console.log('Only Linux platform is supported for now. Please reach out!');
  } else {
    const { exec } = require('child_process');
    let serverBinary = findResourceFile('tigervnc-linux-x86_64/usr/bin/x0vncserver'); // default debian package has x0tigervncserver instead
    let command = serverBinary + " -SecurityTypes None";
    exec(command, (error, stdout, stderr) => {
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
  }
  event.reply('node-code-result', 'run-server result');
});
