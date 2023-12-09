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
  document.getElementById("pubkey").innerHTML = result;
});
ipcRenderer.on('run-server-log', (event, result) => {
  console.log("run-server-log: " + result);
  document.getElementById("serverstatus").innerHTML = result;
});
ipcRenderer.on('run-client-log', (event, result) => {
  console.log("run-client-log: " + result);
  document.getElementById("clientstatus").innerHTML = result;
});

window.menuChange = function menuChange(event,itemnr) {
  console.log("changing menu " + itemnr);
  // Show the right content
  for (let i=0;i<6;i++) {
    let tohide = document.getElementById("content" + i)
    if (tohide) tohide.style.display = "none";
  }
  let toshow = document.getElementById("content" + itemnr)
  if (toshow) toshow.style.display = "flex";
  // Color the right menu buttons
  Array.from(document.getElementsByClassName("menubutton")).forEach(button => {
  button.classList.remove("menubuttonselected");
  });
  event.target.classList.add("menubuttonselected");
}

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

// Don't run server here because then it might get started multiple times, once for every page load, including externals:
//runServer(); // run server automatically at startup
