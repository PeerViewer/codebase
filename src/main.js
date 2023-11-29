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

// Depending on how the app is launched, the tigervnc passwd file might be in different locations.
function findPasswdFile() {
	//console.log(__dirname)
	//console.log(process.cwd())
	let defaultPath = 'tigervnc/passwd';
	let passwdfile = '';
	if (existsSync(defaultPath)) {
		console.log("Found it on first attempt!");
		passwdfile = defaultPath;
	  } else {
		console.log("Can't find file here, trying another option...");
		// /tmp/.mount_peervizdlxvC/resources/app.asar/.webpack/main
		// becomes
		// /tmp/.mount_peervizdlxvC/resources
		const parts = __dirname.split('/');
		let prefix = parts.slice(0, -3).join('/');
		passwdfile = prefix + "/" + defaultPath;
		console.log("trying " + passwdfile);
		if (!existsSync(passwdfile)) {
			console.error("Could not find passwdfile!");
		}
	  }

	console.log("findPasswdFile returns " + passwdfile);
	return passwdfile;
}

// Listen for the 'run-node-code' message from the renderer process
ipcMain.on('run-server', (event) => {
  const { exec } = require('child_process');

  let passwdfile = findPasswdFile();

  exec('x0tigervncserver -PasswordFile ' + passwdfile + ' ', (error, stdout, stderr) => {
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

  event.reply('node-code-result', 'run-server result');
});
