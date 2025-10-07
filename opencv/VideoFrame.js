class VideoFrame {
    constructor(options) {
      this.FrameRates = {
        film: 24,
        NTSC: 29.97,
        NTSC_Film: 23.98,
        NTSC_HD: 59.94,
        PAL: 25,
        PAL_HD: 50,
        web: 30,
        high: 60,
      };
  
      this.obj = options || {};
      this.frameRate = this.obj.frameRate || 24;
      this.video = document.getElementById(this.obj.id);
    }
  
    toTime(frames) {
      const time = typeof frames !== 'number' ? this.video.currentTime : frames;
      const frameRate = this.frameRate;
      const dt = new Date();
      const format = 'hh:mm:ss' + (typeof frames === 'number' ? ':ff' : '');
      dt.setHours(0);
      dt.setMinutes(0);
      dt.setSeconds(0);
      dt.setMilliseconds(time * 1000);
  
      function wrap(n) {
        return n < 10 ? '0' + n : n;
      }
  
      return format.replace(/hh|mm|ss|ff/g, function (token) {
        switch (token) {
          case 'hh':
            return wrap(dt.getHours() < 13 ? dt.getHours() : dt.getHours() - 12);
          case 'mm':
            return wrap(dt.getMinutes());
          case 'ss':
            return wrap(dt.getSeconds());
          case 'ff':
            return wrap(Math.floor((time % 1) * frameRate));
        }
      });
    }
  
    toSMPTE(frame) {
      if (!frame) return this.toTime(this.video.currentTime);
      const frameNumber = Number(frame);
      const fps = this.frameRate;
  
      function wrap(n) {
        return n < 10 ? '0' + n : n;
      }
  
      const _hour = fps * 60 * 60;
      const _minute = fps * 60;
      const _hours = Math.floor(frameNumber / _hour);
      const _minutes = Math.floor(frameNumber / _minute) % 60;
      const _seconds = Math.floor(frameNumber / fps) % 60;
  
      return (
        wrap(_hours) +
        ':' +
        wrap(_minutes) +
        ':' +
        wrap(_seconds) +
        ':' +
        wrap(frameNumber % fps)
      );
    }
  
    toSeconds(SMPTE) {
      if (!SMPTE) return Math.floor(this.video.currentTime);
      const time = SMPTE.split(':');
      return (
        Number(time[0]) * 60 * 60 +
        Number(time[1]) * 60 +
        Number(time[2])
      );
    }
  
    toMilliseconds(SMPTE) {
      const frames = !SMPTE
        ? Number(this.toSMPTE().split(':')[3])
        : Number(SMPTE.split(':')[3]);
      const milliseconds =
        (1000 / this.frameRate) * (isNaN(frames) ? 0 : frames);
      return Math.floor(this.toSeconds(SMPTE) * 1000 + milliseconds);
    }
  
    toFrames(SMPTE) {
      const time = !SMPTE ? this.toSMPTE().split(':') : SMPTE.split(':');
      const frameRate = this.frameRate;
      const hh = Number(time[0]) * 60 * 60 * frameRate;
      const mm = Number(time[1]) * 60 * frameRate;
      const ss = Number(time[2]) * frameRate;
      const ff = Number(time[3]);
      return Math.floor(hh + mm + ss + ff);
    }
  
    __seek(direction, frames) {
      if (!this.video.paused) {
        this.video.pause();
      }
      const frame = Number(this.get());
      this.video.currentTime =
        (direction === 'backward' ? frame - frames : frame + frames) /
          this.frameRate +
        0.00001;
    }
  
    seekForward(frames, callback) {
      if (!frames) frames = 1;
      this.__seek('forward', Number(frames));
      return callback ? callback() : true;
    }
  
    seekBackward(frames, callback) {
      if (!frames) frames = 1;
      this.__seek('backward', Number(frames));
      return callback ? callback() : true;
    }
  
    seekTo(config) {
      const obj = config || {};
      let seekTime;
      let SMPTE;
      const option = Object.keys(obj)[0];
      const frameTime = 1 / this.frameRate;
      let timeOffset = frameTime / 2;
      if (config.startTime) timeOffset += config.startTime;
  
      if (option === 'SMPTE' || option === 'time') {
        SMPTE = obj[option];
        seekTime = this.toMilliseconds(SMPTE) / 1000 + timeOffset;
        this.video.currentTime = seekTime;
        return;
      }
  
      switch (option) {
        case 'frame':
          SMPTE = this.toSMPTE(obj[option]);
          seekTime = this.toMilliseconds(SMPTE) / 1000 + timeOffset;
          break;
        case 'seconds':
          seekTime = Number(obj[option]);
          break;
        case 'milliseconds':
          seekTime = Number(obj[option]) / 1000 + timeOffset;
          break;
      }
  
      if (!isNaN(seekTime)) {
        seekTime = Math.round(seekTime * 1000) / 1000;
        this.video.currentTime = seekTime;
      }
    }
  
    get() {
      return Math.floor(this.video.currentTime * this.frameRate);
    }
  }