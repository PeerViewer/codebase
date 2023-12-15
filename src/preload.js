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

window.blowUpFeature = function blowUpFeature(featureId) {
  document.getElementById(featureId).innerHTML = "oo yes";
}

window.populateFeatureGallery = function populateFeatureGallery() {
  const features = [["Windows Support", "If you'd like to remote control Windows machines, or use a Windows machine for control, you need this!", "LNURL1DP68GURN8GHJ7MR9VAJKUEPWD3HXY6T5WVHXXMMD9AKXUATJD3CZ73NXX438JJCDQW26S"],
                    ["MacOS Support", "If you'd like to remote control MacOS machines, or use an Apple for control, you need this!", "LNURL1DP68GURN8GHJ7MR9VAJKUEPWD3HXY6T5WVHXXMMD9AKXUATJD3CZ76R6GYMKVUC3WQLMU"],
                    ["Open-Source the Code", "Should we open up the source code? Show how much you REALLY want it!", "LNURL1DP68GURN8GHJ7MR9VAJKUEPWD3HXY6T5WVHXXMMD9AKXUATJD3CZ7EJXDFFKSAC3TS7PU"],
                    ["Integrated Bitcoin Lightning Wallet", "Allowing you 'stream' satoshis (for example: pay or get paid per minute) to provide remote support or share your computer.", "LNURL1DP68GURN8GHJ7MR9VAJKUEPWD3HXY6T5WVHXXMMD9AKXUATJD3CZ7C6G0P58S3C2C2P4Q"],
                    ["View-Only Mode", "A View-Only mode might be nice to be able to share your desktop, without having the other party control it.", "LNURL1DP68GURN8GHJ7MR9VAJKUEPWD3HXY6T5WVHXXMMD9AKXUATJD3CZ7CFKDFUXXSGUDGTFU"]];
  let featuresHTML = "";
  for (let featurenr=0; featurenr<features.length; featurenr++) {
    featuresHTML += '<div class="feature" id="feature' + featurenr + '"><h3>' + features[featurenr][0] + '</h3><p>' + features[featurenr][1] + '</p><a href="lightning:' + features[featurenr][2] + '"><img src="./images/' + features[featurenr][2] + '.png" alt="yes"/></a></div>';
  }
  document.getElementById("featuregallery").innerHTML = featuresHTML;
}

// Don't run server here because then it might get started multiple times, once for every page load, including externals:
//runServer(); // run server automatically at startup

// cant find document.getElementById("featuregallery") so this needs to be in index.html after everything has loaded: populateFeatureGallery();
