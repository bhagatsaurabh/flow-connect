/*Copyright (c) 2012 DinahMoe AB & Oskar Eriksson

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
  modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
  is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
  OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export class TunaInitializer {
  static initialize() {
    let userContext: any,
      userInstance: any,
      pipe = function (param: any, val: any) {
        param.value = val;
      },
      Super = Object.create(null, {
        activate: {
          writable: true,
          value: function (doActivate: any) {
            if (doActivate) {
              this.input.disconnect();
              this.input.connect(this.activateNode);
              if (this.activateCallback) {
                this.activateCallback(doActivate);
              }
            } else {
              this.input.disconnect();
              this.input.connect(this.output);
            }
          },
        },
        bypass: {
          get: function () {
            return this._bypass;
          },
          set: function (value) {
            if (this._lastBypassValue === value) {
              return;
            }
            this._bypass = value;
            this.activate(!value);
            this._lastBypassValue = value;
          },
        },
        connect: {
          value: function (target: any) {
            this.output.connect(target);
          },
        },
        disconnect: {
          value: function (target: any) {
            this.output.disconnect(target);
          },
        },
        connectInOrder: {
          value: function (nodeArray: any) {
            let i = nodeArray.length - 1;
            while (i--) {
              if (!nodeArray[i].connect) {
                return console.error("AudioNode.connectInOrder: TypeError: Not an AudioNode.", nodeArray[i]);
              }
              if (nodeArray[i + 1].input) {
                nodeArray[i].connect(nodeArray[i + 1].input);
              } else {
                nodeArray[i].connect(nodeArray[i + 1]);
              }
            }
          },
        },
        getDefaults: {
          value: function () {
            let result = {};
            for (let key in this.defaults) {
              (result as any)[key] = this.defaults[key].value;
            }
            return result;
          },
        },
        automate: {
          value: function (property: any, value: any, duration: any, startTime: any) {
            let start = startTime ? ~~(startTime / 1000) : userContext.currentTime,
              dur = duration ? ~~(duration / 1000) : 0,
              _is = this.defaults[property],
              param = this[property],
              method;

            if (param) {
              if (_is.automatable) {
                if (!duration) {
                  method = "setValueAtTime";
                } else {
                  method = "linearRampToValueAtTime";
                  param.cancelScheduledValues(start);
                  param.setValueAtTime(param.value, start);
                }
                param[method](value, dur + start);
              } else {
                param = value;
              }
            } else {
              console.error("Invalid Property for " + this.name);
            }
          },
        },
      }),
      FLOAT = "float",
      BOOLEAN = "boolean",
      STRING = "string",
      INT = "int";

    function Tuna(context: any) {
      if (!(this instanceof Tuna)) {
        // @ts-ignore
        return new Tuna(context);
      }

      let _window: any = typeof window === "undefined" ? {} : window;

      if (!_window.AudioContext) {
        _window.AudioContext = _window.webkitAudioContext;
      }
      if (!context) {
        console.log("tuna.js: Missing audio context! Creating a new context for you.");
        context = _window.AudioContext && new _window.AudioContext();
      }
      if (!context) {
        throw new Error("Tuna cannot initialize because this environment does not support web audio.");
      }
      connectify(context);
      userContext = context;
      userInstance = this;
    }

    function connectify(context: any) {
      if (context.__connectified__ === true) return;

      let gain = context.createGain(),
        proto = Object.getPrototypeOf(Object.getPrototypeOf(gain)),
        oconnect = proto.connect;

      proto.connect = shimConnect;
      context.__connectified__ = true; // Prevent overriding connect more than once

      function shimConnect() {
        let node = arguments[0];
        arguments[0] = Super.isPrototypeOf ? (Super.isPrototypeOf(node) ? node.input : node) : node.input || node;
        oconnect.apply(this, arguments);
        return node;
      }
    }

    function dbToWAVolume(db: any) {
      return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);
    }

    function fmod(x: any, y: any) {
      // http://kevin.vanzonneveld.net
      // *     example 1: fmod(5.7, 1.3);
      // *     returns 1: 0.5
      let tmp,
        tmp2,
        p = 0,
        pY = 0,
        l = 0.0,
        l2 = 0.0;

      tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
      p = parseInt(tmp[2], 10) - (tmp[1] + "").length;
      tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
      pY = parseInt(tmp[2], 10) - (tmp[1] + "").length;

      if (pY > p) {
        p = pY;
      }

      tmp2 = x % y;

      if (p < -100 || p > 20) {
        // toFixed will give an out of bound error so we fix it like this:
        l = Math.round(Math.log(tmp2) / Math.log(10));
        l2 = Math.pow(10, l);

        // @ts-ignore
        return (tmp2 / l2).toFixed(l - p) * l2;
      } else {
        return parseFloat(tmp2.toFixed(-p));
      }
    }

    function sign(x: any) {
      if (x === 0) {
        return 1;
      } else {
        return Math.abs(x) / x;
      }
    }

    function tanh(n: any) {
      return (Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
    }

    function initValue(userVal: any, defaultVal: any) {
      return userVal === undefined ? defaultVal : userVal;
    }

    Tuna.prototype.Chorus = function (properties: any) {
      if (!properties) {
        properties = this.getDefaults();
      }
      this.input = userContext.createGain();
      this.attenuator = this.activateNode = userContext.createGain();
      this.splitter = userContext.createChannelSplitter(2);
      this.delayL = userContext.createDelay();
      this.delayR = userContext.createDelay();
      this.feedbackGainNodeLR = userContext.createGain();
      this.feedbackGainNodeRL = userContext.createGain();
      this.merger = userContext.createChannelMerger(2);
      this.output = userContext.createGain();
      this.delayL.delayTime.value = 0;
      this.delayR.delayTime.value = 0;

      this.lfoL = new userInstance.LFO({
        target: this.delayL.delayTime,
        callback: pipe,
      });
      this.lfoR = new userInstance.LFO({
        target: this.delayR.delayTime,
        callback: pipe,
      });

      this.input.connect(this.attenuator);
      this.attenuator.connect(this.output);
      this.attenuator.connect(this.splitter);
      this.splitter.connect(this.delayL, 0);
      this.splitter.connect(this.delayR, 1);
      this.delayL.connect(this.feedbackGainNodeLR);
      this.delayR.connect(this.feedbackGainNodeRL);
      this.feedbackGainNodeLR.connect(this.delayR);
      this.feedbackGainNodeRL.connect(this.delayL);
      this.delayL.connect(this.merger, 0, 0);
      this.delayR.connect(this.merger, 0, 1);
      this.merger.connect(this.output);

      this.feedback = initValue(properties.feedback, this.defaults.feedback.value);
      this.rate = initValue(properties.rate, this.defaults.rate.value);
      this.delay = initValue(properties.delay, this.defaults.delay.value);
      this.depth = initValue(properties.depth, this.defaults.depth.value);
      this.lfoR.phase = Math.PI / 2;
      this.attenuator.gain.value = 0.6934; // 1 / (10 ^ (((20 * log10(3)) / 3) / 20))
      this.lfoL.activate(true);
      this.lfoR.activate(true);
      this.bypass = properties.bypass || this.defaults.bypass.value;
    };
    Tuna.prototype.Chorus.prototype = Object.create(Super, {
      name: {
        value: "Chorus",
      },
      defaults: {
        writable: true,
        value: {
          feedback: {
            value: 0.4,
            min: 0,
            max: 0.95,
            automatable: false,
            type: FLOAT,
          },
          delay: {
            value: 0.0045,
            min: 0,
            max: 1,
            automatable: false,
            type: FLOAT,
          },
          depth: {
            value: 0.7,
            min: 0,
            max: 1,
            automatable: false,
            type: FLOAT,
          },
          rate: {
            value: 1.5,
            min: 0,
            max: 8,
            automatable: false,
            type: FLOAT,
          },
          bypass: {
            value: false,
            automatable: false,
            type: BOOLEAN,
          },
        },
      },
      delay: {
        enumerable: true,
        get: function () {
          return this._delay;
        },
        set: function (value) {
          this._delay = 0.0002 * (Math.pow(10, value) * 2);
          this.lfoL.offset = this._delay;
          this.lfoR.offset = this._delay;
          this._depth = this._depth;
        },
      },
      depth: {
        enumerable: true,
        get: function () {
          return this._depth;
        },
        set: function (value) {
          this._depth = value;
          this.lfoL.oscillation = this._depth * this._delay;
          this.lfoR.oscillation = this._depth * this._delay;
        },
      },
      feedback: {
        enumerable: true,
        get: function () {
          return this._feedback;
        },
        set: function (value) {
          this._feedback = value;
          this.feedbackGainNodeLR.gain.setTargetAtTime(this._feedback, userContext.currentTime, 0.01);
          this.feedbackGainNodeRL.gain.setTargetAtTime(this._feedback, userContext.currentTime, 0.01);
        },
      },
      rate: {
        enumerable: true,
        get: function () {
          return this._rate;
        },
        set: function (value) {
          this._rate = value;
          this.lfoL.frequency = this._rate;
          this.lfoR.frequency = this._rate;
        },
      },
    });

    Tuna.prototype.Overdrive = function (properties: any) {
      if (!properties) {
        properties = this.getDefaults();
      }
      this.input = userContext.createGain();
      this.activateNode = userContext.createGain();
      this.inputDrive = userContext.createGain();
      this.waveshaper = userContext.createWaveShaper();
      this.outputDrive = userContext.createGain();
      this.output = userContext.createGain();

      this.activateNode.connect(this.inputDrive);
      this.inputDrive.connect(this.waveshaper);
      this.waveshaper.connect(this.outputDrive);
      this.outputDrive.connect(this.output);

      this.ws_table = new Float32Array(this.k_nSamples);
      this.drive = initValue(properties.drive, this.defaults.drive.value);
      this.outputGain = initValue(properties.outputGain, this.defaults.outputGain.value);
      this.curveAmount = initValue(properties.curveAmount, this.defaults.curveAmount.value);
      this.algorithmIndex = initValue(properties.algorithmIndex, this.defaults.algorithmIndex.value);
      this.bypass = properties.bypass || this.defaults.bypass.value;
    };
    Tuna.prototype.Overdrive.prototype = Object.create(Super, {
      name: {
        value: "Overdrive",
      },
      defaults: {
        writable: true,
        value: {
          drive: {
            value: 0.197,
            min: 0,
            max: 1,
            automatable: true,
            type: FLOAT,
            scaled: true,
          },
          outputGain: {
            value: -9.154,
            min: -46,
            max: 0,
            automatable: true,
            type: FLOAT,
            scaled: true,
          },
          curveAmount: {
            value: 0.979,
            min: 0,
            max: 1,
            automatable: false,
            type: FLOAT,
          },
          algorithmIndex: {
            value: 0,
            min: 0,
            max: 5,
            automatable: false,
            type: INT,
          },
          bypass: {
            value: false,
            automatable: false,
            type: BOOLEAN,
          },
        },
      },
      k_nSamples: {
        value: 8192,
      },
      drive: {
        get: function () {
          return this.inputDrive.gain;
        },
        set: function (value) {
          this.inputDrive.gain.value = value;
        },
      },
      curveAmount: {
        get: function () {
          return this._curveAmount;
        },
        set: function (value) {
          this._curveAmount = value;
          if (this._algorithmIndex === undefined) {
            this._algorithmIndex = 0;
          }
          this.waveshaperAlgorithms[this._algorithmIndex](this._curveAmount, this.k_nSamples, this.ws_table);
          this.waveshaper.curve = this.ws_table;
        },
      },
      outputGain: {
        get: function () {
          return this.outputDrive.gain;
        },
        set: function (value) {
          this._outputGain = dbToWAVolume(value);
          this.outputDrive.gain.setValueAtTime(this._outputGain, userContext.currentTime, 0.01);
        },
      },
      algorithmIndex: {
        get: function () {
          return this._algorithmIndex;
        },
        set: function (value) {
          this._algorithmIndex = value;
          this.curveAmount = this._curveAmount;
        },
      },
      waveshaperAlgorithms: {
        value: [
          function (amount: any, n_samples: any, ws_table: any) {
            amount = Math.min(amount, 0.9999);
            let k = (2 * amount) / (1 - amount),
              i,
              x;
            for (i = 0; i < n_samples; i++) {
              x = (i * 2) / n_samples - 1;
              ws_table[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
            }
          },
          function (amount: any, n_samples: any, ws_table: any) {
            let i, x, y;
            for (i = 0; i < n_samples; i++) {
              x = (i * 2) / n_samples - 1;
              y = (0.5 * Math.pow(x + 1.4, 2) - 1) * ((y as any) >= 0 ? 5.8 : 1.2);
              ws_table[i] = tanh(y);
            }
          },
          function (amount: any, n_samples: any, ws_table: any) {
            let i,
              x,
              y,
              a = 1 - amount;
            for (i = 0; i < n_samples; i++) {
              x = (i * 2) / n_samples - 1;
              y = x < 0 ? -Math.pow(Math.abs(x), a + 0.04) : Math.pow(x, a);
              ws_table[i] = tanh(y * 2);
            }
          },
          function (amount: any, n_samples: any, ws_table: any) {
            let i,
              x,
              y,
              abx,
              a = 1 - amount > 0.99 ? 0.99 : 1 - amount;
            for (i = 0; i < n_samples; i++) {
              x = (i * 2) / n_samples - 1;
              abx = Math.abs(x);
              if (abx < a) {
                y = abx;
              } else if (abx > a) {
                y = a + (abx - a) / (1 + Math.pow((abx - a) / (1 - a), 2));
              } else if (abx > 1) {
                y = abx;
              }
              ws_table[i] = sign(x) * y * (1 / ((a + 1) / 2));
            }
          },
          function (amount: any, n_samples: any, ws_table: any) {
            // fixed curve, amount doesn't do anything, the distortion is just from the drive
            let i, x;
            for (i = 0; i < n_samples; i++) {
              x = (i * 2) / n_samples - 1;
              if (x < -0.08905) {
                ws_table[i] =
                  (-3 / 4) * (1 - Math.pow(1 - (Math.abs(x) - 0.032857), 12) + (1 / 3) * (Math.abs(x) - 0.032847)) +
                  0.01;
              } else if (x >= -0.08905 && x < 0.320018) {
                ws_table[i] = -6.153 * (x * x) + 3.9375 * x;
              } else {
                ws_table[i] = 0.630035;
              }
            }
          },
          function (amount: any, n_samples: any, ws_table: any) {
            let a = 2 + Math.round(amount * 14),
              // we go from 2 to 16 bits, keep in mind for the UI
              bits = Math.round(Math.pow(2, a - 1)),
              // real number of quantization steps divided by 2
              i,
              x;
            for (i = 0; i < n_samples; i++) {
              x = (i * 2) / n_samples - 1;
              ws_table[i] = Math.round(x * bits) / bits;
            }
          },
        ],
      },
    });

    Tuna.prototype.PingPongDelay = function (properties: any) {
      if (!properties) {
        properties = this.getDefaults();
      }
      this.input = userContext.createGain();
      this.wet = userContext.createGain();
      this.stereoToMonoMix = userContext.createGain();
      this.feedbackLevel = userContext.createGain();
      this.output = userContext.createGain();
      this.delayLeft = userContext.createDelay(10);
      this.delayRight = userContext.createDelay(10);

      this.activateNode = userContext.createGain();
      this.splitter = userContext.createChannelSplitter(2);
      this.merger = userContext.createChannelMerger(2);

      this.activateNode.connect(this.splitter);
      this.splitter.connect(this.stereoToMonoMix, 0, 0);
      this.splitter.connect(this.stereoToMonoMix, 1, 0);
      this.stereoToMonoMix.gain.value = 0.5;
      this.stereoToMonoMix.connect(this.wet);
      this.wet.connect(this.delayLeft);
      this.feedbackLevel.connect(this.wet);
      this.delayLeft.connect(this.delayRight);
      this.delayRight.connect(this.feedbackLevel);
      this.delayLeft.connect(this.merger, 0, 0);
      this.delayRight.connect(this.merger, 0, 1);
      this.merger.connect(this.output);
      this.activateNode.connect(this.output);

      this.delayTimeLeft =
        properties.delayTimeLeft !== undefined ? properties.delayTimeLeft : this.defaults.delayTimeLeft.value;
      this.delayTimeRight =
        properties.delayTimeRight !== undefined ? properties.delayTimeRight : this.defaults.delayTimeRight.value;
      this.feedbackLevel.gain.value =
        properties.feedback !== undefined ? properties.feedback : this.defaults.feedback.value;
      this.wet.gain.value = properties.wetLevel !== undefined ? properties.wetLevel : this.defaults.wetLevel.value;
      this.bypass = properties.bypass || this.defaults.bypass.value;
    };
    Tuna.prototype.PingPongDelay.prototype = Object.create(Super, {
      name: {
        value: "PingPongDelay",
      },
      delayTimeLeft: {
        enumerable: true,
        get: function () {
          return this._delayTimeLeft;
        },
        set: function (value) {
          this._delayTimeLeft = value;
          this.delayLeft.delayTime.value = value / 1000;
        },
      },
      delayTimeRight: {
        enumerable: true,
        get: function () {
          return this._delayTimeRight;
        },
        set: function (value) {
          this._delayTimeRight = value;
          this.delayRight.delayTime.value = value / 1000;
        },
      },
      wetLevel: {
        enumerable: true,
        get: function () {
          return this.wet.gain;
        },
        set: function (value) {
          this.wet.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
        },
      },
      feedback: {
        enumerable: true,
        get: function () {
          return this.feedbackLevel.gain;
        },
        set: function (value) {
          this.feedbackLevel.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
        },
      },
      defaults: {
        writable: true,
        value: {
          delayTimeLeft: {
            value: 200,
            min: 1,
            max: 10000,
            automatable: false,
            type: INT,
          },
          delayTimeRight: {
            value: 400,
            min: 1,
            max: 10000,
            automatable: false,
            type: INT,
          },
          feedback: {
            value: 0.3,
            min: 0,
            max: 1,
            automatable: true,
            type: FLOAT,
          },
          wetLevel: {
            value: 0.5,
            min: 0,
            max: 1,
            automatable: true,
            type: FLOAT,
          },
          bypass: {
            value: false,
            automatable: false,
            type: BOOLEAN,
          },
        },
      },
    });

    Tuna.prototype.Tremolo = function (properties: any) {
      if (!properties) {
        properties = this.getDefaults();
      }
      this.input = userContext.createGain();
      this.splitter = this.activateNode = userContext.createChannelSplitter(2);
      this.amplitudeL = userContext.createGain();
      this.amplitudeR = userContext.createGain();
      this.merger = userContext.createChannelMerger(2);
      this.output = userContext.createGain();
      this.lfoL = new userInstance.LFO({
        target: this.amplitudeL.gain,
        callback: pipe,
      });
      this.lfoR = new userInstance.LFO({
        target: this.amplitudeR.gain,
        callback: pipe,
      });

      this.input.connect(this.splitter);
      this.splitter.connect(this.amplitudeL, 0);
      this.splitter.connect(this.amplitudeR, 1);
      this.amplitudeL.connect(this.merger, 0, 0);
      this.amplitudeR.connect(this.merger, 0, 1);
      this.merger.connect(this.output);

      this.rate = properties.rate || this.defaults.rate.value;
      this.intensity = initValue(properties.intensity, this.defaults.intensity.value);
      this.stereoPhase = initValue(properties.stereoPhase, this.defaults.stereoPhase.value);

      this.lfoL.offset = 1 - this.intensity / 2;
      this.lfoR.offset = 1 - this.intensity / 2;
      this.lfoL.phase = (this.stereoPhase * Math.PI) / 180;

      this.lfoL.activate(true);
      this.lfoR.activate(true);
      this.bypass = properties.bypass || this.defaults.bypass.value;
    };
    Tuna.prototype.Tremolo.prototype = Object.create(Super, {
      name: {
        value: "Tremolo",
      },
      defaults: {
        writable: true,
        value: {
          intensity: {
            value: 0.3,
            min: 0,
            max: 1,
            automatable: false,
            type: FLOAT,
          },
          stereoPhase: {
            value: 0,
            min: 0,
            max: 180,
            automatable: false,
            type: FLOAT,
          },
          rate: {
            value: 5,
            min: 0.1,
            max: 11,
            automatable: false,
            type: FLOAT,
          },
          bypass: {
            value: false,
            automatable: false,
            type: BOOLEAN,
          },
        },
      },
      intensity: {
        enumerable: true,
        get: function () {
          return this._intensity;
        },
        set: function (value) {
          this._intensity = value;
          this.lfoL.offset = 1 - this._intensity / 2;
          this.lfoR.offset = 1 - this._intensity / 2;
          this.lfoL.oscillation = this._intensity;
          this.lfoR.oscillation = this._intensity;
        },
      },
      rate: {
        enumerable: true,
        get: function () {
          return this._rate;
        },
        set: function (value) {
          this._rate = value;
          this.lfoL.frequency = this._rate;
          this.lfoR.frequency = this._rate;
        },
      },
      stereoPhase: {
        enumerable: true,
        get: function () {
          return this._stereoPhase;
        },
        set: function (value) {
          this._stereoPhase = value;
          let newPhase = this.lfoL._phase + (this._stereoPhase * Math.PI) / 180;
          newPhase = fmod(newPhase, 2 * Math.PI);
          this.lfoR.phase = newPhase;
        },
      },
    });

    Tuna.prototype.LFO = function (properties: any) {
      if (!properties) {
        properties = this.getDefaults();
      }

      //Instantiate AudioNode
      this.input = userContext.createGain();
      this.output = new AudioWorkletNode(userContext, "lfo", {
        processorOptions: { sampleRate: userContext.sampleRate },
        channelCount: 1,
        channelCountMode: "explicit",
        outputChannelCount: [1],
      });

      this.output.connect(properties.target);
      this.activateNode = userContext.destination;

      //Set Properties
      this.frequency = initValue(properties.frequency, this.defaults.frequency.value);
      this.offset = initValue(properties.offset, this.defaults.offset.value);
      this.oscillation = initValue(properties.oscillation, this.defaults.oscillation.value);
      this.phase = initValue(properties.phase, this.defaults.phase.value);
      // this.target = properties.target || {};
      this.bypass = properties.bypass || this.defaults.bypass.value;

      this.output.port.postMessage({
        type: "set-all",
        value: { oscillation: this.oscillation, offset: this.offset, frequency: this.frequency, phase: this.phase },
      });
    };
    Tuna.prototype.LFO.prototype = Object.create(Super, {
      name: {
        value: "LFO",
      },
      bufferSize: {
        value: 128,
      },
      sampleRate: {
        value: 44100,
      },
      defaults: {
        value: {
          frequency: {
            value: 1,
            min: 0,
            max: 20,
            automatable: false,
            type: FLOAT,
          },
          offset: {
            value: 0.85,
            min: 0,
            max: 22049,
            automatable: false,
            type: FLOAT,
          },
          oscillation: {
            value: 0.3,
            min: -22050,
            max: 22050,
            automatable: false,
            type: FLOAT,
          },
          phase: {
            value: 0,
            min: 0,
            max: 2 * Math.PI,
            automatable: false,
            type: FLOAT,
          },
          bypass: {
            value: false,
            automatable: false,
            type: BOOLEAN,
          },
        },
      },
      frequency: {
        get: function () {
          return this._frequency;
        },
        set: function (value) {
          this._frequency = value;
          this._phaseInc = (2 * Math.PI * this._frequency * this.bufferSize) / this.sampleRate;
          this.output.port.postMessage({
            type: "set-frequency",
            value: this.frequency,
          });
        },
      },
      offset: {
        get: function () {
          return this._offset;
        },
        set: function (value) {
          this._offset = value;
          this.output.port.postMessage({
            type: "set-offset",
            value: this.offset,
          });
        },
      },
      oscillation: {
        get: function () {
          return this._oscillation;
        },
        set: function (value) {
          this._oscillation = value;
          this.output.port.postMessage({
            type: "set-oscillation",
            value: this.oscillation,
          });
        },
      },
      phase: {
        get: function () {
          return this._phase;
        },
        set: function (value) {
          this._phase = value;
          this.output.port.postMessage({
            type: "set-phase",
            value: this.phase,
          });
        },
      },
      activate: {
        value: function (doActivate: any) {
          if (doActivate) {
            // this.output.connect(userContext.destination);
            if (this.activateCallback) {
              this.activateCallback(doActivate);
            }
          } else {
            // this.output.disconnect();
          }
        },
      },
    });

    return Tuna;
  }
}
