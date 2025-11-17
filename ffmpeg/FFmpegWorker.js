class FFmpegWorker {
  constructor() {}
  parseFFmpegLogs(logs) {
    const metadata = {
      avg_frame_rate: "30/1", // fallback
      r_frame_rate: "30/1",
      codec_long_name: "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
      codec_name: "h264",
      codec_tag: "0x31637661",
      codec_tag_string: "avc1",
      codec_type: "video",
      width: null,
      height: null,
      display_aspect_ratio: null,
      sample_aspect_ratio: null,
      pix_fmt: null,
      duration: null,
      start_time: null,
      bit_rate: null,
      nb_frames: null,
      profile: null,
      level: null,
      encoder: null,
      handler_name: null,
    };

    const durationLine = logs.find((l) => l.includes("Duration:"));
    const streamLine = logs.find(
      (l) => l.includes("Stream #0:0") && l.includes("Video:")
    );
    const encoderLine = logs.find(
      (l) => l.includes("encoder") && l.includes("libx264")
    );
    const handlerLine = logs.find((l) => l.includes("handler_name"));

    if (durationLine) {
      const durMatch = durationLine.match(
        /Duration: ([\d:.]+), start: ([\d.]+), bitrate: (\d+) kb\/s/
      );
      if (durMatch) {
        metadata.duration = durMatch[1];
        metadata.start_time = durMatch[2];
        metadata.bit_rate = String(Number(durMatch[3]) * 1000); // convert to bits
      }
    }

    if (streamLine) {
      const resMatch = streamLine.match(
        /, (\d+)x(\d+) \[SAR ([^ ]+) DAR ([^ ]+)\]/
      );
      const fpsMatch = streamLine.match(/, (\d+) fps/);
      const pixFmtMatch = streamLine.match(/Video: [^,]+ \(.*?\), ([^,]+)/);
      const profileMatch = streamLine.match(/Video: [^ ]+ \(([^)]+)\)/);

      metadata.width = resMatch?.[1] && parseInt(resMatch[1]);
      metadata.height = resMatch?.[2] && parseInt(resMatch[2]);
      metadata.sample_aspect_ratio = resMatch?.[3];
      metadata.display_aspect_ratio = resMatch?.[4];
      metadata.r_frame_rate = fpsMatch?.[1]
        ? `${fpsMatch[1]}/1`
        : metadata.r_frame_rate;
      metadata.avg_frame_rate = metadata.r_frame_rate;
      metadata.pix_fmt = pixFmtMatch?.[1];
      metadata.profile = profileMatch?.[1];
      metadata.nb_frames = "150"; // fallback if not directly parsed
    }

    if (encoderLine) {
      const match = encoderLine.match(/encoder\s+: (.+)/);
      if (match) {
        metadata.encoder = match[1].trim();
      }
    }

    if (handlerLine) {
      const match = handlerLine.match(/handler_name\s+: (.+)/);
      if (match) {
        metadata.handler_name = match[1].trim();
      }
    }

    return { ffmpeg: metadata };
  }

  async loadScriptAsBlob(srcPath) {
    const res = await fetch(srcPath);
    const code = await res.text();
    const blob = new Blob([code], { type: "text/javascript" });
    const blobURL = URL.createObjectURL(blob);

    const script = document.createElement("script");
    script.src = blobURL;
    script.type = "text/javascript";
    script.onload = () => {
      console.log("FFmpeg loaded via Blob!");
      // You can now access FFmpegWASM.FFmpeg or similar
    };
    document.head.appendChild(script);
  }
  async init() {

    


    await setTimeout(async () => {
      
    }, 1000);
    console.log("FFmpeg loaded");
    const { createWorker } = FFmpeg;

    const logs = [];

    const worker = createWorker({
      logger: (m) => {
        logs.push(m.message);
        // console.log(m.message);
      },
    });

    await worker.load();
    console.log("✅ FFmpeg loaded");

    const response = await fetch("http://127.0.0.1:8080/video2.mp4");
    const buffer = await response.arrayBuffer();
    await worker.write("input.mp4", new Uint8Array(buffer));
    console.log("📥 Video written to FS");

    // Dummy decode to print metadata
    await worker.run("-i input.mp4 -map 0:v:0 -f null -");
    console.log("🔍 Video processed for metadata");

    // Extract info from logs
    const metadata = {};

    const duration = logs.find((l) => l.includes("Duration:"));
    const stream = logs.find((l) => l.includes("Stream #0:0"));
    const fpsMatch = stream?.match(/(\d+(?:\.\d+)?) fps/);
    const resMatch = stream?.match(/, (\d+)x(\d+)[, ]/);

    if (duration) {
      metadata.duration = duration.match(/Duration: ([^,]+)/)?.[1];
    }
    if (fpsMatch) {
      metadata.fps = fpsMatch[1];
    }
    if (resMatch) {
      metadata.width = resMatch[1];
      metadata.height = resMatch[2];
    }
    const output = document.getElementById("output");
    output.textContent = JSON.stringify(metadata, null, 2);
    const parsedLogs = this.parseFFmpegLogs(logs);
    console.log("🧾 Parsed Logs:", parsedLogs);
  }
}
