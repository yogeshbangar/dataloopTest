const logEl = document.getElementById("log");
const log = (msg) => (logEl.textContent += msg + "\n");
const baseURL = "./workers";
document.getElementById("loadBtn").onclick = async () => {
  log("Creating FFmpeg instance...");

  // FFmpegWASM comes from your big script
  const ffmpeg = new FFmpegWASM.FFmpeg();

  log("Loading FFmpeg Core...");
  const classWorkerURL = new URL(
    `${baseURL}/814.ffmpeg.js`,
    window.location.href
  ).toString();
  const coreURL = await toBlobURL(
    `${baseURL}/ffmpeg-core.js`,
    "text/javascript"
  );
  const wasmURL = await toBlobURL(
    `${baseURL}/ffmpeg-core.wasm`,
    "application/wasm"
  );
  const workerURL = await toBlobURL(
    `${baseURL}/ffmpeg-core.worker.js`,
    "text/javascript"
  );
  console.log("classWorkerURL", classWorkerURL);
  console.log("coreURL", coreURL);
  console.log("wasmURL", wasmURL);
  console.log("workerURL", workerURL);
  await ffmpeg.load({ classWorkerURL, coreURL, wasmURL, workerURL });

  log("✔ FFmpeg fully loaded!");

  // Wire up runtime logs
  ffmpeg.on("log", (data) => {
    try {
      log(`[log] ${typeof data === "string" ? data : JSON.stringify(data)}`);
    } catch {
      log("[log] (unserializable message)");
    }
  });
  ffmpeg.on("progress", (data) => {
    try {
      const pct =
        data && typeof data.ratio === "number"
          ? Math.round(data.ratio * 100)
          : "?";
      log(`[progress] ${pct}%`);
    } catch {
      log("[progress] (unserializable)");
    }
  });

  // Test button to verify onmessage/worker responses
  const execBtn = document.getElementById("execBtn");
  if (execBtn) {
    execBtn.onclick = async () => {
      log("Running: ffmpeg -version");
      try {
        const ret = await ffmpeg.exec(["-version"]);
        log(`exec returned: ${JSON.stringify(ret)}`);
      } catch (err) {
        log(`exec error: ${err}`);
      }
    };
  }
};

async function toBlobURL(url, mimeType) {
  const res = await fetch(url);
  const blob = await res.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}
