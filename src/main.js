// The vnc server listens on port 55900, which is non-standard because another vnc server might be listening on the standard 5900.
// Then hypertele listens on port 45900, so the vnc client also connects to port 45900.

// Future improvements:
// - use random free listening TCP ports instead of hard-coded 45900 and 55900 to allow simultaneous sessions
// - do some kind of "pkill vnc-software/tigervnc-linux-x86_64/usr/bin/x0vncserver -rfbport=55900" to ensure none other is still running
// - do some kind of "pkill vnc-software/tigervnc-linux-x86_64/usr/bin/vncviewer SecurityTypes=None 127.0.0.1::45900" to ensure none other is still running
// - before starting a new client or server process, check if serverChild or clientChild are initialized and if yes, stop them
// - support (a list of) multiple running clientChilds instead of just one

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const nodePath = require('node:path');
import { existsSync } from 'node:fs';

let serverChild;
let publicKeyServer;
let clientChild;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1350,
    height: 780,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false // enable chrome developer tools (when pressing ctrl-shift-i)
    },
  });

  // app.dock.hide(); // Only works/necessary on mac?
  mainWindow.setMenuBarVisibility(false); // Only Windows and Linux

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools at startup instead of requiring CTRL-ALT-i to be pressed:
  // mainWindow.webContents.openDevTools();

  // Allow iframe'ing lnbits
  const { session } = require('electron')
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; frame-src 'self' https://legend.lnbits.com"]
      }
    })
  });

  // Open target="_blank" links in external browser window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  console.log("App window closing, performing close actions...");
  if (serverChild) stopChild(serverChild);
  if (clientChild) stopChild(clientChild);
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

function stopChild(child) {
  console.log("Stopping child process:");
  //console.log(child);
  console.log("Destroying stdout and stderr...");
  if (serverChild.stdout) serverChild.stdout.destroy();
  if (serverChild.stderr) serverChild.stderr.destroy();
  console.log("Sending SIGINT and SIGKILL...");
  serverChild.kill('SIGINT');
  serverChild.kill('SIGKILL');
  console.log("child terminated");
}

// Depending on how the app is launched, the tigervnc folder might be in different locations.
// Search order:
// - vnc-software/ (when launching in development)
// - /tmp/.mount_peervizdlxvC/resources/vnc-software/ (launched from appimage or .deb package installation)
// - on windows: check console.log to know what __dirname and process.cwd() are
function findResourceFile(filename) {
	console.log("findResourceFile __dirname = ");
	console.log(__dirname)
	console.log("findResourceFile process.cwd = ");
	console.log(process.cwd())
	const magicName = "vnc-software" + nodePath.sep;
	const parts = __dirname.split(nodePath.sep);
	let appImageMount = parts.slice(0, -3).join(nodePath.sep); // /tmp/.mount_peervizdlxvC/resources/app.asar/.webpack/main becomes /tmp/.mount_peervizdlxvC/resources
	// placesToCheck are directories that should end with a slash
	let placesToCheck = [magicName, appImageMount + nodePath.sep + magicName, nodePath.sep];
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

ipcMain.on('run-server', (event) => {
  // Make sure this OS is supported
  if (process.platform !== 'linux' && process.platform !== 'win32' && process.platform != 'darwin') {
    let error = 'Unsupported platform ' + process.platform + '. Only Linux, Windows and MacOS are supported, yours not yet. Please reach out!';
    console.log(error);
    event.reply(error);
    return -1;
  }
  if (!serverChild) { // Only run the server if not started already. It keeps running the whole time.
    event.reply('run-server-log', "Initializing network layer...");
    publicKeyServer = startHyperTeleServer();
    // Padding is not needed
    publicKeyServer = publicKeyServer.replace('=','');
    event.reply('run-server-log', "Network layer initialized.");

    event.reply('run-server-log', "Preparing for incoming connections...");
    if (process.platform === 'linux') {
      let binaryName = 'tigervnc-linux-x86_64/usr/bin/x0vncserver';
      let foundBinary = findResourceFile(binaryName);
      if (!foundBinary) {
        console.log("Binary " + binaryName + " not found.");
        return -2;
      }
      let dirname = nodePath.dirname(foundBinary);
      serverChild = runProcess(foundBinary, ['SecurityTypes=VncAuth','localhost=1','interface=127.0.0.1','rfbport=55900','PasswordFile='+dirname+nodePath.sep+'plain.bin']);
    } else if (process.platform === 'win32') {
      serverChild = findAndRunProcess('uvnc-windows\\x64\\winvnc.exe'); // uses the config file next to the binary
    } else if (process.platform === 'darwin') {
      serverChild = findAndRunProcess('macVNC.app/Contents/MacOS/macVNC', ['-rfbport','55900','-passwd','nopassword']);
    }
    if (!serverChild) {
      event.reply('run-server-log', "ERROR: Listening for connections using VNC server failed.");
      return;
    }
  }
  event.reply('run-server-pubkey', publicKeyServer);
  event.reply('run-server-log', "Ready for incoming connections.");
});

ipcMain.on('run-client', (event, data) => {
  // Make sure this OS is supported
  if (process.platform !== 'linux' && process.platform !== 'win32' && process.platform != 'darwin') {
    let error = 'Unsupported platform ' + process.platform + '. Only Linux, Windows and MacOS are supported, yours not yet. Please reach out!';
    console.log(error);
    event.reply(error);
    return -1;
  }

  event.reply('run-client-log', "Initializing network layer...");
  console.log("running client with connectto data: " + data);
  let hyperTeleProxy = startHyperTeleClient(data);
  if (!hyperTeleProxy) {
    event.reply('run-client-log', "Network layer initialization failed. Invalid partner ID provided?");
    return;
  }
  event.reply('run-client-log', "Network layer initialized.");

  event.reply('run-client-log', "Establishing outgoing connection...");
  if (process.platform === 'linux' || process.platform === 'darwin') {
    let binaryName = 'tigervnc-linux-x86_64/usr/bin/vncviewer';
    let foundBinary = '';
    if (process.platform === 'linux') {
      let binaryName = 'tigervnc-linux-x86_64/usr/bin/vncviewer';
      foundBinary = findResourceFile(binaryName);
      if (!foundBinary) {
        console.log("Binary " + binaryName + " not found.");
        return -2;
      }
    } else if (process.platform === 'darwin') {
      let binaryName = 'tigervnc-macos-x86_64/Contents/MacOS/TigerVNC\ Viewer';
      foundBinary = findResourceFile(binaryName);
      if (!foundBinary) {
        console.log("Binary " + binaryName + " not found.");
        return -2;
      }
    }
    // PasswordFile of TigerVNC viewer cannot be passed on commandline, so use the file next to the binary.
    let dirname = nodePath.dirname(foundBinary);
    clientChild = runProcess(foundBinary, ['SecurityTypes=VncAuth','EmulateMiddleButton=1','DotWhenNoCursor=1','PasswordFile='+dirname+nodePath.sep+'plain.bin','127.0.0.1::45900']);
  } else if (process.platform === 'win32') {
    clientChild = findAndRunProcess('uvnc-windows\\x64\\vncviewer.exe', ['/password','nopassword','localhost:45900']);
  }
  if (!clientChild) {
    event.reply('run-client-log', "ERROR: Outgoing connection using vncviewer failed.");
    return;
  }
  // Stop the hyperTeleProxy from listening when the client is closed, because the next run might use a different client
  clientChild.on('close', (code) => {
    console.log(`child process exited with code ${code}, closing hyperTeleProxy...`);
    // the hyperdht is stopped by the proxy.on('close' handler
    hyperTeleProxy.close();
    clientChild = null;
  });
  event.reply('run-client-log', "Outgoing connection established.");
});

function findAndRunProcess(binaryName, args) {
  let foundBinary = findResourceFile(binaryName);
  if (!foundBinary) {
    console.log("Binary " + binaryName + " not found.");
    return -2;
  }
  return runProcess(foundBinary, args);
}

function runProcess(foundBinary, args) {
  const { spawn } = require('child_process');
  const child = spawn(foundBinary, args);
  return child;
}


// hypertele code:
// ===============
// This is an intential copy-paste of hypertele/server.js
// and hypertele/client.sh to facilitate rebasing to
// newer hypertele releases and readable diffs.

const HyperDHT = require('hyperdht')
const net = require('net')
const argv = require('minimist')(process.argv.slice(2))
const libNet = require('@hyper-cmd/lib-net')
const libUtils = require('@hyper-cmd/lib-utils')
const libKeys = require('@hyper-cmd/lib-keys')
const connPiper = libNet.connPiper

function startHyperTeleServer() {

argv.l = "55900";
argv.seed = libKeys.randomBytes(32).toString('hex');

const helpMsg = 'Usage:\nhypertele-server -l service_port -u unix_socket ?--address service_address ?-c conf.json ?--seed seed ?--cert-skip'

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

if (!argv.u && !+argv.l) {
  console.error('Error: proxy port invalid')
  process.exit(-1)
}

if (argv.u && argv.l) {
  console.error('Error: cannot listen to both a port and a Unix domain socket')
  process.exit(-1)
}

const conf = {}

if (argv.seed) {
  conf.seed = argv.seed
}

if (argv.c) {
  libUtils.readConf(conf, argv.c)
}

if (argv.compress) {
  conf.compress = true
}

if (argv['cert-skip']) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
}

if (!conf.seed) {
  console.error('Error: conf.seed invalid')
  process.exit(-1)
}

if (conf.allow) {
  conf.allow = libKeys.prepKeyList(conf.allow)
}

const debug = argv.debug

const seed = Buffer.from(conf.seed, 'hex')

const dht = new HyperDHT()
const keyPair = HyperDHT.keyPair(seed)

const stats = {}

const destIp = argv.address || '127.0.0.1'

const server = dht.createServer({
  firewall: (remotePublicKey, remoteHandshakePayload) => {
    if (conf.allow && !libKeys.checkAllowList(conf.allow, remotePublicKey)) {
      return true
    }

    return false
  },
  reusableSocket: true
}, c => {
  connPiper(c, () => {
    return net.connect(
      argv.u
        ? { path: argv.u }
        : { port: +argv.l, host: destIp, allowHalfOpen: true }
    )
  }, { debug, isServer: true, compress: conf.compress }, stats)
})

server.listen(keyPair).then(() => {
  console.log('hypertele got public key for server (in hex):', keyPair.publicKey.toString('hex'))
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

process.once('SIGINT', function () {
  dht.destroy()
})

//return keyPair.publicKey.toString('hex');
return keyPair.publicKey.toString('base64');

}


function startHyperTeleClient(pubkeybase64) {

console.log("Starting hypertele with pubkeybase64: " + pubkeybase64);

let pubkeyhex = ""
try {
  pubkeyhex = new Buffer(pubkeybase64, 'base64').toString('hex');
  if (pubkeyhex.length != 64) {
    console.log("Pubkey invalid length - it should be 32 bytes. Returning...");
    return;
  }
} catch (e) {
  console.log("caught error during decode of base64 pubkey");
  console.log(e);
  return;
}

console.log("Starting hypertele with pubkeyhex: " + pubkeyhex);

argv.s = pubkeyhex;
argv.p = "45900";

const helpMsg = 'Usage:\nhypertele -p port_listen -u unix_socket ?-c conf.json ?-i identity.json ?-s peer_key'

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

if (!argv.u && !+argv.p) {
  console.error('Error: proxy port invalid')
  process.exit(-1)
}

if (argv.u && argv.p) {
  console.error('Error: cannot listen to both a port and a Unix domain socket')
  process.exit(-1)
}
const conf = {}

const target = argv.u ? argv.u : +argv.p

if (argv.s) {
  conf.peer = libUtils.resolveHostToKey([], argv.s)
}

if (argv.c) {
  libUtils.readConf(conf, argv.c)
}

if (!conf.keepAlive) {
  conf.keepAlive = 5000
}

if (argv.compress) {
  conf.compress = true
}

const peer = conf.peer
if (!peer) {
  console.error('Error: peer is invalid')
  process.exit(-1)
}

const debug = argv.debug

let keyPair = null
if (argv.i) {
  keyPair = libUtils.resolveIdentity([], argv.i)

  if (!keyPair) {
    console.error('Error: identity file invalid')
    process.exit(-1)
  }

  keyPair = libKeys.parseKeyPair(keyPair)
}

const stats = {}

const dht = new HyperDHT({
  keyPair
})

const proxy = net.createServer({ allowHalfOpen: true }, c => {
  return connPiper(c, () => {
    const stream = dht.connect(Buffer.from(peer, 'hex'), { reusableSocket: true })
    stream.setKeepAlive(conf.keepAlive)

    return stream
  }, { compress: conf.compress }, stats)
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

proxy.listen(target, () => {
  console.log(`Server ready @${target}`)
})

process.once('SIGINT', () => {
  dht.destroy().then(() => {
    process.exit()
  })
})

proxy.on('close', () => { // or 'end'
    console.log('proxy.on close triggered, clonnection closed, destroying dht...');
    dht.destroy();
});

return proxy;

}

