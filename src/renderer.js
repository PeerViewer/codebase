/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

/*
// renderer.js
const { ipcRenderer } = window.require('electron');

document.getElementById('runNodeCodeButton').addEventListener('click', () => {
  // Send a message to the main process to run Node.js code
  //window.ipcRenderer.send('run-node-code');
  ipcRenderer.send('run-node-code');
});
*/

/*

// Listen for the response from the main process
ipcRenderer.on('node-code-result', (event, result) => {
  console.log(result);
  // Handle the result as needed in the renderer process
});

*/
