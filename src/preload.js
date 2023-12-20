// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { ipcRenderer } = require('electron');

console.log("running preload - this happens at every page load, including external websites");
//console.log(window);

// Listen for the response from the main process
ipcRenderer.on('run-client-result', (event, result) => {
  console.log("got result:" + result);
});
ipcRenderer.on('run-server-result', (event, result) => {
  console.log("got result:" + result);
});
ipcRenderer.on('run-server-pubkey', (event, result) => {
  console.log("run-server-pubkey: " + result);
  document.getElementById("pubkey").value = result;
});
ipcRenderer.on('run-server-log', (event, result) => {
  console.log("run-server-log: " + result);
  document.getElementById("serverstatus").innerHTML = result;
});
ipcRenderer.on('run-client-log', (event, result) => {
  console.log("run-client-log: " + result);
  document.getElementById("clientstatus").innerHTML = result;
});

window.runServer = function runServer() {
  ipcRenderer.send('run-server');
  console.log("run-server done");
}

window.runClient = function runClient() {
  let connectto = document.getElementById('connectto').value;
  if (connectto) {
    ipcRenderer.send('run-client', connectto);
  } else {
    document.getElementById("clientstatus").innerHTML = "WARNING: issue with Partner ID, can't connect.";
  }
  console.log("run-client done");
}

// Don't run startup stuff like the server here because then it might get started multiple times, once for every page load, including externals:
//runServer(); // run server automatically at startup

// cant find document.getElementById("featuregallery") so this needs to be in index.html after everything has loaded: populateFeatureGallery();
