// The vnc server listens on port 55900, which is non-standard because another vnc server might be listening on the standard 5900.
// Then hypertele listens on port 45900, so the vnc client also connects to port 45900.

const { app, BrowserWindow, ipcMain } = require('electron');
import { existsSync } from 'node:fs';

let serverChild;
let clientChild;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 450,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true // set to true to enable chrome developer tools
    },
  });

  // app.dock.hide(); // Only works/necessary on mac?
  mainWindow.setMenuBarVisibility(false); // Only Windows and Linux

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
  console.log(child);
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
function findResourceFile(filename) {
	console.log(__dirname)
	console.log(process.cwd())
	const magicName = "vnc-software/";
	const parts = __dirname.split('/');
	let appImageMount = parts.slice(0, -3).join('/'); // /tmp/.mount_peervizdlxvC/resources/app.asar/.webpack/main becomes /tmp/.mount_peervizdlxvC/resources
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

ipcMain.on('run-server', (event) => {
  event.reply('run-server-log', "Initializing network layer...");
  let publicKeyHex = startHyperTeleServer();
  event.reply('run-server-log', "Network layer initialized.");
  event.reply('run-server-pubkey', publicKeyHex);

  event.reply('run-server-log', "Preparing for incoming connections...");
  // default debian package has x0tigervncserver instead
  serverChild = runProcess('tigervnc-linux-x86_64/usr/bin/x0vncserver', ['SecurityTypes=None','-localhost=1','-interface=127.0.0.1','-rfbport=55900']);
  event.reply('run-server-log', "Ready for incoming connections.");
});

ipcMain.on('run-client', (event, data) => {
  event.reply('run-client-log', "Initializing network layer...");
  console.log("running client with connectto data: " + data);
  startHyperTeleClient(data);
  event.reply('run-client-log', "Network layer initialized.");

  event.reply('run-client-log', "Establishing outgoing connection...");
  // default debian package has xtigervncviewer instead
  clientChild = runProcess('tigervnc-linux-x86_64/usr/bin/vncviewer', ['SecurityTypes=None','127.0.0.1::45900']);
  event.reply('run-client-log', "Outgoing connection established.");
});

function runProcess(binaryName, args) {
  if (process.platform !== 'linux') { // win32/darwin not supported
    console.log('Unsupported platform ' + process.platform + '. Only linux is supported, win32/darwin not yet. Please reach out!');
    return -1;
  }

  let foundBinary = findResourceFile(binaryName);
  if (!foundBinary) {
    console.log("Binary " + binaryName + " not found.");
    return -2;
  }

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
  console.log('hypertele:', keyPair.publicKey.toString('hex'))
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

process.once('SIGINT', function () {
  dht.destroy()
})

return keyPair.publicKey.toString('hex');

}


function startHyperTeleClient(pubkeyhex) {

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

}

