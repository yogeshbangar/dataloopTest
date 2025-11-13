// worker.js (classic worker)

// Load any external script
importScripts("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js");

// Confirm script loaded
postMessage({ msg: "Worker loaded successfully!", lodashVersion: _.VERSION });

// Handle messages from main thread
onmessage = function (e) {
  const input = e.data;
  postMessage({ msg: "Received from main:", data: input });
};