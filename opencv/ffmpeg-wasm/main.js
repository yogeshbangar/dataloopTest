const logEl = document.getElementById("log");
const log = (msg) => (logEl.textContent += msg + "\n");
const baseURL = "./workers";
document.getElementById("loadBtn").onclick = async () => {
  log("Creating FFmpeg instance...");

  // FFmpegWASM comes from your big script
  const ffmpeg = new FFmpegWASM.FFmpeg();

  log("Loading FFmpeg Core...");
  const classWorkerURL = await toBlobURL(`${baseURL}/814.ffmpeg.js`,"text/javascript");
  const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`,"text/javascript");
  const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`,"application/wasm");
  const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`,"text/javascript");
  await ffmpeg.load({ classWorkerURL, coreURL, wasmURL,workerURL });

  log("✔ FFmpeg fully loaded!");
};

async function toBlobURL(url, mimeType) {
  const res = await fetch(url);
  const blob = await res.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}
