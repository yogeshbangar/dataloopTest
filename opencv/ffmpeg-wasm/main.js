const logEl = document.getElementById("log");
const log = (msg) => (logEl.textContent += msg + "\n");
const baseURL = "http://127.0.0.1:8080/workers";
document.getElementById("loadBtn").onclick = async () => {
  log("Creating FFmpeg instance...");

  // FFmpegWASM comes from your big script
  const ffmpeg = new FFmpegWASM.FFmpeg();

  log("Loading FFmpeg Core...");
  const classWorkerURL = new URL(
    `${baseURL}/814.ffmpeg.js`,
    window.location.href
  ).toString();


  const classWorkerURL1 = await toBlobURL(
    `${baseURL}/814.ffmpeg.js`,
    "text/javascript"
  );
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
  console.log("classWorkerURL", classWorkerURL1);
  console.log("coreURL", coreURL);
  console.log("wasmURL", wasmURL);
  console.log("workerURL", workerURL);

  await ffmpeg.load({
    // Use multi-threaded core only when SharedArrayBuffer is available (cross-origin isolated).
    // Fallback to single-threaded core otherwise to avoid "SharedArrayBuffer is not defined".
    // See: https://developer.chrome.com/docs/web-platform/shared-array-buffer
    ...(function () {
      const supportsSAB =
        typeof SharedArrayBuffer === "function" && crossOriginIsolated === true;
      const base = supportsSAB
        ? "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm"
        : "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
      return {
        coreURL: `${base}/ffmpeg-core.js`,
        wasmURL: `${base}/ffmpeg-core.wasm`,
        workerURL: `${base}/ffmpeg-core.worker.js`,
      };
    })(),
  });

  // await ffmpeg.load({ classWorkerURL:classWorkerURL1, wasmURL,coreURL, workerURL });

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
