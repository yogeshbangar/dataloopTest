// Minimal constants used by 814.ffmpeg.js
// CORE_URL is only used if not provided from the main thread. We pass it explicitly,
// but we keep a sensible default here for completeness.
export const CORE_URL = "./ffmpeg-core.js";

// Message types must match those used in the main thread bundle (`ffmpeg.min.js`)
export const FFMessageType = {
	LOAD: "LOAD",
	EXEC: "EXEC",
	FFPROBE: "FFPROBE",
	WRITE_FILE: "WRITE_FILE",
	READ_FILE: "READ_FILE",
	DELETE_FILE: "DELETE_FILE",
	RENAME: "RENAME",
	CREATE_DIR: "CREATE_DIR",
	LIST_DIR: "LIST_DIR",
	DELETE_DIR: "DELETE_DIR",
	ERROR: "ERROR",
	DOWNLOAD: "DOWNLOAD",
	PROGRESS: "PROGRESS",
	LOG: "LOG",
	MOUNT: "MOUNT",
	UNMOUNT: "UNMOUNT",
};


