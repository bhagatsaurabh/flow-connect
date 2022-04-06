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

var userContext,
  userInstance,
  pipe = function (param, val) {
    param.value = val;
  },
  Super = Object.create(null, {
    activate: {
      writable: true,
      value: function (doActivate) {
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
      }
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
      }
    },
    connect: {
      value: function (target) {
        this.output.connect(target);
      }
    },
    disconnect: {
      value: function (target) {
        this.output.disconnect(target);
      }
    },
    connectInOrder: {
      value: function (nodeArray) {
        var i = nodeArray.length - 1;
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
      }
    },
    getDefaults: {
      value: function () {
        var result = {};
        for (var key in this.defaults) {
          result[key] = this.defaults[key].value;
        }
        return result;
      }
    },
    automate: {
      value: function (property, value, duration, startTime) {
        var start = startTime ? ~~(startTime / 1000) : userContext.currentTime,
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
      }
    }
  }),
  FLOAT = "float",
  BOOLEAN = "boolean",
  STRING = "string",
  INT = "int";

if (typeof module !== "undefined" && module.exports) {
  module.exports = Tuna;
} else if (typeof define === "function") {
  window.define("Tuna", definition);
} else {
  window.Tuna = Tuna;
}

function definition() {
  return Tuna;
}

function Tuna(context) {
  if (!(this instanceof Tuna)) {
    return new Tuna(context);
  }

  var _window = typeof window === "undefined" ? {} : window;

  if (!_window.AudioContext) {
    _window.AudioContext = _window.webkitAudioContext;
  }
  if (!context) {
    console.log("tuna.js: Missing audio context! Creating a new context for you.");
    context = _window.AudioContext && (new _window.AudioContext());
  }
  if (!context) {
    throw new Error("Tuna cannot initialize because this environment does not support web audio.");
  }
  connectify(context);
  userContext = context;
  userInstance = this;
}

function connectify(context) {
  if (context.__connectified__ === true) return;

  var gain = context.createGain(),
    proto = Object.getPrototypeOf(Object.getPrototypeOf(gain)),
    oconnect = proto.connect;

  proto.connect = shimConnect;
  context.__connectified__ = true; // Prevent overriding connect more than once

  function shimConnect() {
    var node = arguments[0];
    arguments[0] = Super.isPrototypeOf ? (Super.isPrototypeOf(node) ? node.input : node) : (node.input || node);
    oconnect.apply(this, arguments);
    return node;
  }
}

function dbToWAVolume(db) {
  return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);
}

function fmod(x, y) {
  // http://kevin.vanzonneveld.net
  // *     example 1: fmod(5.7, 1.3);
  // *     returns 1: 0.5
  var tmp, tmp2, p = 0,
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

  tmp2 = (x % y);

  if (p < -100 || p > 20) {
    // toFixed will give an out of bound error so we fix it like this:
    l = Math.round(Math.log(tmp2) / Math.log(10));
    l2 = Math.pow(10, l);

    return (tmp2 / l2).toFixed(l - p) * l2;
  } else {
    return parseFloat(tmp2.toFixed(-p));
  }
}

function sign(x) {
  if (x === 0) {
    return 1;
  } else {
    return Math.abs(x) / x;
  }
}

function tanh(n) {
  return (Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
}

function initValue(userVal, defaultVal) {
  return userVal === undefined ? defaultVal : userVal;
}

Tuna.prototype.Bitcrusher = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.bufferSize = properties.bufferSize || this.defaults.bufferSize.value;

  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.processor = userContext.createScriptProcessor(this.bufferSize, 1, 1);
  this.output = userContext.createGain();

  this.activateNode.connect(this.processor);
  this.processor.connect(this.output);

  var phaser = 0,
    last = 0,
    input, output, step, i, length;
  this.processor.onaudioprocess = function (e) {
    input = e.inputBuffer.getChannelData(0),
      output = e.outputBuffer.getChannelData(0),
      step = Math.pow(1 / 2, this.bits);
    length = input.length;
    for (i = 0; i < length; i++) {
      phaser += this.normfreq;
      if (phaser >= 1.0) {
        phaser -= 1.0;
        last = step * Math.floor(input[i] / step + 0.5);
      }
      output[i] = last;
    }
  };

  this.bits = properties.bits || this.defaults.bits.value;
  this.normfreq = initValue(properties.normfreq, this.defaults.normfreq.value);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Bitcrusher.prototype = Object.create(Super, {
  name: {
    value: "Bitcrusher"
  },
  defaults: {
    writable: true,
    value: {
      bits: {
        value: 4,
        min: 1,
        max: 16,
        automatable: false,
        type: INT
      },
      bufferSize: {
        value: 4096,
        min: 256,
        max: 16384,
        automatable: false,
        type: INT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      },
      normfreq: {
        value: 0.1,
        min: 0.0001,
        max: 1.0,
        automatable: false,
        type: FLOAT
      }
    }
  },
  bits: {
    enumerable: true,
    get: function () {
      return this.processor.bits;
    },
    set: function (value) {
      this.processor.bits = value;
    }
  },
  normfreq: {
    enumerable: true,
    get: function () {
      return this.processor.normfreq;
    },
    set: function (value) {
      this.processor.normfreq = value;
    }
  }
});

Tuna.prototype.Cabinet = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.convolver = this.newConvolver(properties.impulsePath || "../impulses/impulse_guitar.wav");
  this.makeupNode = userContext.createGain();
  this.output = userContext.createGain();

  this.activateNode.connect(this.convolver.input);
  this.convolver.output.connect(this.makeupNode);
  this.makeupNode.connect(this.output);
  //don't use makeupGain setter at init to avoid smoothing
  this.makeupNode.gain.value = initValue(properties.makeupGain, this.defaults.makeupGain.value);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Cabinet.prototype = Object.create(Super, {
  name: {
    value: "Cabinet"
  },
  defaults: {
    writable: true,
    value: {
      makeupGain: {
        value: 1,
        min: 0,
        max: 20,
        automatable: true,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  makeupGain: {
    enumerable: true,
    get: function () {
      return this.makeupNode.gain;
    },
    set: function (value) {
      this.makeupNode.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  newConvolver: {
    value: function (impulsePath) {
      return new userInstance.Convolver({
        impulse: impulsePath,
        dryLevel: 0,
        wetLevel: 1
      });
    }
  }
});

Tuna.prototype.Chorus = function (properties) {
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
  this.delayL.delayTime = 0;
  this.delayR.delayTime = 0;

  this.lfoL = new userInstance.LFO({
    target: this.delayL.delayTime,
    callback: pipe
  });
  this.lfoR = new userInstance.LFO({
    target: this.delayR.delayTime,
    callback: pipe
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
    value: "Chorus"
  },
  defaults: {
    writable: true,
    value: {
      feedback: {
        value: 0.4,
        min: 0,
        max: 0.95,
        automatable: false,
        type: FLOAT
      },
      delay: {
        value: 0.0045,
        min: 0,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      depth: {
        value: 0.7,
        min: 0,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      rate: {
        value: 1.5,
        min: 0,
        max: 8,
        automatable: false,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
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
    }
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
    }
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
    }
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
    }
  }
});

Tuna.prototype.Compressor = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.input = userContext.createGain();
  this.compNode = this.activateNode = userContext.createDynamicsCompressor();
  this.makeupNode = userContext.createGain();
  this.output = userContext.createGain();

  this.compNode.connect(this.makeupNode);
  this.makeupNode.connect(this.output);

  this.automakeup = initValue(properties.automakeup, this.defaults.automakeup.value);

  //don't use makeupGain setter at initialization to avoid smoothing
  if (this.automakeup) {
    this.makeupNode.gain.value = dbToWAVolume(this.computeMakeup());
  } else {
    this.makeupNode.gain.value = dbToWAVolume(initValue(properties.makeupGain, this.defaults.makeupGain.value));
  }
  this.threshold = initValue(properties.threshold, this.defaults.threshold.value);
  this.release = initValue(properties.release, this.defaults.release.value);
  this.attack = initValue(properties.attack, this.defaults.attack.value);
  this.ratio = properties.ratio || this.defaults.ratio.value;
  this.knee = initValue(properties.knee, this.defaults.knee.value);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Compressor.prototype = Object.create(Super, {
  name: {
    value: "Compressor"
  },
  defaults: {
    writable: true,
    value: {
      threshold: {
        value: -20,
        min: -60,
        max: 0,
        automatable: true,
        type: FLOAT
      },
      release: {
        value: 250,
        min: 10,
        max: 2000,
        automatable: true,
        type: FLOAT
      },
      makeupGain: {
        value: 1,
        min: 1,
        max: 100,
        automatable: true,
        type: FLOAT
      },
      attack: {
        value: 1,
        min: 0,
        max: 1000,
        automatable: true,
        type: FLOAT
      },
      ratio: {
        value: 4,
        min: 1,
        max: 50,
        automatable: true,
        type: FLOAT
      },
      knee: {
        value: 5,
        min: 0,
        max: 40,
        automatable: true,
        type: FLOAT
      },
      automakeup: {
        value: false,
        automatable: false,
        type: BOOLEAN
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  computeMakeup: {
    value: function () {
      var magicCoefficient = 4, // raise me if the output is too hot
        c = this.compNode;
      return -(c.threshold.value - c.threshold.value / c.ratio.value) / magicCoefficient;
    }
  },
  automakeup: {
    enumerable: true,
    get: function () {
      return this._automakeup;
    },
    set: function (value) {
      this._automakeup = value;
      if (this._automakeup) this.makeupGain = this.computeMakeup();
    }
  },
  threshold: {
    enumerable: true,
    get: function () {
      return this.compNode.threshold;
    },
    set: function (value) {
      this.compNode.threshold.value = value;
      if (this._automakeup) this.makeupGain = this.computeMakeup();
    }
  },
  ratio: {
    enumerable: true,
    get: function () {
      return this.compNode.ratio;
    },
    set: function (value) {
      this.compNode.ratio.value = value;
      if (this._automakeup) this.makeupGain = this.computeMakeup();
    }
  },
  knee: {
    enumerable: true,
    get: function () {
      return this.compNode.knee;
    },
    set: function (value) {
      this.compNode.knee.value = value;
      if (this._automakeup) this.makeupGain = this.computeMakeup();
    }
  },
  attack: {
    enumerable: true,
    get: function () {
      return this.compNode.attack;
    },
    set: function (value) {
      this.compNode.attack.value = value / 1000;
    }
  },
  release: {
    enumerable: true,
    get: function () {
      return this.compNode.release;
    },
    set: function (value) {
      this.compNode.release.value = value / 1000;
    }
  },
  makeupGain: {
    enumerable: true,
    get: function () {
      return this.makeupNode.gain;
    },
    set: function (value) {
      this.makeupNode.gain.setTargetAtTime(dbToWAVolume(value), userContext.currentTime, 0.01);
    }
  }
});

Tuna.prototype.Convolver = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.convolver = userContext.createConvolver();
  this.dry = userContext.createGain();
  this.filterLow = userContext.createBiquadFilter();
  this.filterHigh = userContext.createBiquadFilter();
  this.wet = userContext.createGain();
  this.output = userContext.createGain();

  this.activateNode.connect(this.filterLow);
  this.activateNode.connect(this.dry);
  this.filterLow.connect(this.filterHigh);
  this.filterHigh.connect(this.convolver);
  this.convolver.connect(this.wet);
  this.wet.connect(this.output);
  this.dry.connect(this.output);

  //don't use setters at init to avoid smoothing
  this.dry.gain.value = initValue(properties.dryLevel, this.defaults.dryLevel.value);
  this.wet.gain.value = initValue(properties.wetLevel, this.defaults.wetLevel.value);
  this.filterHigh.frequency.value = properties.highCut || this.defaults.highCut.value;
  this.filterLow.frequency.value = properties.lowCut || this.defaults.lowCut.value;
  this.output.gain.value = initValue(properties.level, this.defaults.level.value);
  this.filterHigh.type = "lowpass";
  this.filterLow.type = "highpass";
  this.buffer = properties.impulse || "../impulses/ir_rev_short.wav";
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Convolver.prototype = Object.create(Super, {
  name: {
    value: "Convolver"
  },
  defaults: {
    writable: true,
    value: {
      highCut: {
        value: 22050,
        min: 20,
        max: 22050,
        automatable: true,
        type: FLOAT
      },
      lowCut: {
        value: 20,
        min: 20,
        max: 22050,
        automatable: true,
        type: FLOAT
      },
      dryLevel: {
        value: 1,
        min: 0,
        max: 1,
        automatable: true,
        type: FLOAT
      },
      wetLevel: {
        value: 1,
        min: 0,
        max: 1,
        automatable: true,
        type: FLOAT
      },
      level: {
        value: 1,
        min: 0,
        max: 1,
        automatable: true,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  lowCut: {
    get: function () {
      return this.filterLow.frequency;
    },
    set: function (value) {
      this.filterLow.frequency.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  highCut: {
    get: function () {
      return this.filterHigh.frequency;
    },
    set: function (value) {
      this.filterHigh.frequency.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  level: {
    get: function () {
      return this.output.gain;
    },
    set: function (value) {
      this.output.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  dryLevel: {
    get: function () {
      return this.dry.gain;
    },
    set: function (value) {
      this.dry.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  wetLevel: {
    get: function () {
      return this.wet.gain;
    },
    set: function (value) {
      this.wet.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  buffer: {
    enumerable: false,
    get: function () {
      return this.convolver.buffer;
    },
    set: function (impulse) {
      var convolver = this.convolver,
        xhr = new XMLHttpRequest();
      if (!impulse) {
        console.log("Tuna.Convolver.setBuffer: Missing impulse path!");
        return;
      }
      xhr.open("GET", impulse, true);
      xhr.responseType = "arraybuffer";
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status < 300 && xhr.status > 199 || xhr.status === 302) {
            userContext.decodeAudioData(xhr.response, function (buffer) {
              convolver.buffer = buffer;
            }, function (e) {
              if (e) console.log("Tuna.Convolver.setBuffer: Error decoding data" + e);
            });
          }
        }
      };
      xhr.send(null);
    }
  }
});

Tuna.prototype.Delay = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.dry = userContext.createGain();
  this.wet = userContext.createGain();
  this.filter = userContext.createBiquadFilter();
  this.delay = userContext.createDelay(10);
  this.feedbackNode = userContext.createGain();
  this.output = userContext.createGain();

  this.activateNode.connect(this.delay);
  this.activateNode.connect(this.dry);
  this.delay.connect(this.filter);
  this.filter.connect(this.feedbackNode);
  this.feedbackNode.connect(this.delay);
  this.feedbackNode.connect(this.wet);
  this.wet.connect(this.output);
  this.dry.connect(this.output);

  this.delayTime = properties.delayTime || this.defaults.delayTime.value;
  //don't use setters at init to avoid smoothing
  this.feedbackNode.gain.value = initValue(properties.feedback, this.defaults.feedback.value);
  this.wet.gain.value = initValue(properties.wetLevel, this.defaults.wetLevel.value);
  this.dry.gain.value = initValue(properties.dryLevel, this.defaults.dryLevel.value);
  this.filter.frequency.value = properties.cutoff || this.defaults.cutoff.value;
  this.filter.type = "lowpass";
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Delay.prototype = Object.create(Super, {
  name: {
    value: "Delay"
  },
  defaults: {
    writable: true,
    value: {
      delayTime: {
        value: 100,
        min: 20,
        max: 1000,
        automatable: false,
        type: FLOAT
      },
      feedback: {
        value: 0.45,
        min: 0,
        max: 0.9,
        automatable: true,
        type: FLOAT
      },
      cutoff: {
        value: 20000,
        min: 20,
        max: 20000,
        automatable: true,
        type: FLOAT
      },
      wetLevel: {
        value: 0.5,
        min: 0,
        max: 1,
        automatable: true,
        type: FLOAT
      },
      dryLevel: {
        value: 1,
        min: 0,
        max: 1,
        automatable: true,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  delayTime: {
    enumerable: true,
    get: function () {
      return this.delay.delayTime;
    },
    set: function (value) {
      this.delay.delayTime.value = value / 1000;
    }
  },
  wetLevel: {
    enumerable: true,
    get: function () {
      return this.wet.gain;
    },
    set: function (value) {
      this.wet.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  dryLevel: {
    enumerable: true,
    get: function () {
      return this.dry.gain;
    },
    set: function (value) {
      this.dry.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  feedback: {
    enumerable: true,
    get: function () {
      return this.feedbackNode.gain;
    },
    set: function (value) {
      this.feedbackNode.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  cutoff: {
    enumerable: true,
    get: function () {
      return this.filter.frequency;
    },
    set: function (value) {
      this.filter.frequency.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  }
});

Tuna.prototype.Filter = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.filter = userContext.createBiquadFilter();
  this.output = userContext.createGain();

  this.activateNode.connect(this.filter);
  this.filter.connect(this.output);

  //don't use setters for freq and gain at init to avoid smoothing
  this.filter.frequency.value = properties.frequency || this.defaults.frequency.value;
  this.Q = properties.resonance || this.defaults.Q.value;
  this.filterType = initValue(properties.filterType, this.defaults.filterType.value);
  this.filter.gain.value = initValue(properties.gain, this.defaults.gain.value);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Filter.prototype = Object.create(Super, {
  name: {
    value: "Filter"
  },
  defaults: {
    writable: true,
    value: {
      frequency: {
        value: 800,
        min: 20,
        max: 22050,
        automatable: true,
        type: FLOAT
      },
      Q: {
        value: 1,
        min: 0.001,
        max: 100,
        automatable: true,
        type: FLOAT
      },
      gain: {
        value: 0,
        min: -40,
        max: 40,
        automatable: true,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      },
      filterType: {
        value: "lowpass",
        automatable: false,
        type: STRING
      }
    }
  },
  filterType: {
    enumerable: true,
    get: function () {
      return this.filter.type;
    },
    set: function (value) {
      this.filter.type = value;
    }
  },
  Q: {
    enumerable: true,
    get: function () {
      return this.filter.Q;
    },
    set: function (value) {
      this.filter.Q.value = value;
    }
  },
  gain: {
    enumerable: true,
    get: function () {
      return this.filter.gain;
    },
    set: function (value) {
      this.filter.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  frequency: {
    enumerable: true,
    get: function () {
      return this.filter.frequency;
    },
    set: function (value) {
      this.filter.frequency.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  }
});

Tuna.prototype.Gain = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }

  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.gainNode = userContext.createGain();
  this.output = userContext.createGain();

  this.activateNode.connect(this.gainNode);
  this.gainNode.connect(this.output);

  //don't use setter at init to avoid smoothing
  this.gainNode.gain.value = initValue(properties.gain, this.defaults.gain.value);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Gain.prototype = Object.create(Super, {
  name: {
    value: "Gain"
  },
  defaults: {
    writable: true,
    value: {
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      },
      gain: {
        value: 1.0,
        automatable: true,
        type: FLOAT
      }
    }
  },
  gain: {
    enumerable: true,
    get: function () {
      return this.gainNode.gain;
    },
    set: function (value) {
      this.gainNode.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  }
});

Tuna.prototype.MoogFilter = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.bufferSize = properties.bufferSize || this.defaults.bufferSize.value;

  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.processor = userContext.createScriptProcessor(this.bufferSize, 1, 1);
  this.output = userContext.createGain();

  this.activateNode.connect(this.processor);
  this.processor.connect(this.output);

  var in1, in2, in3, in4, out1, out2, out3, out4;
  in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
  var input, output, f, fb, i, length, inputFactor;
  this.processor.onaudioprocess = function (e) {
    input = e.inputBuffer.getChannelData(0);
    output = e.outputBuffer.getChannelData(0);
    f = this.cutoff * 1.16;
    inputFactor = 0.35013 * (f * f) * (f * f);
    fb = this.resonance * (1.0 - 0.15 * f * f);
    length = input.length;
    for (i = 0; i < length; i++) {
      input[i] -= out4 * fb;
      input[i] *= inputFactor;
      out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
      in1 = input[i];
      out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
      in2 = out1;
      out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
      in3 = out2;
      out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
      in4 = out3;
      output[i] = out4;
    }
  };

  this.cutoff = initValue(properties.cutoff, this.defaults.cutoff.value);
  this.resonance = initValue(properties.resonance, this.defaults.resonance.value);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.MoogFilter.prototype = Object.create(Super, {
  name: {
    value: "MoogFilter"
  },
  defaults: {
    writable: true,
    value: {
      bufferSize: {
        value: 4096,
        min: 256,
        max: 16384,
        automatable: false,
        type: INT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      },
      cutoff: {
        value: 0.065,
        min: 0.0001,
        max: 1.0,
        automatable: false,
        type: FLOAT
      },
      resonance: {
        value: 3.5,
        min: 0.0,
        max: 4.0,
        automatable: false,
        type: FLOAT
      }
    }
  },
  cutoff: {
    enumerable: true,
    get: function () {
      return this.processor.cutoff;
    },
    set: function (value) {
      this.processor.cutoff = value;
    }
  },
  resonance: {
    enumerable: true,
    get: function () {
      return this.processor.resonance;
    },
    set: function (value) {
      this.processor.resonance = value;
    }
  }
});

Tuna.prototype.Overdrive = function (properties) {
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
    value: "Overdrive"
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
        scaled: true
      },
      outputGain: {
        value: -9.154,
        min: -46,
        max: 0,
        automatable: true,
        type: FLOAT,
        scaled: true
      },
      curveAmount: {
        value: 0.979,
        min: 0,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      algorithmIndex: {
        value: 0,
        min: 0,
        max: 5,
        automatable: false,
        type: INT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  k_nSamples: {
    value: 8192
  },
  drive: {
    get: function () {
      return this.inputDrive.gain;
    },
    set: function (value) {
      this.inputDrive.gain.value = value;
    }
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
    }
  },
  outputGain: {
    get: function () {
      return this.outputDrive.gain;
    },
    set: function (value) {
      this._outputGain = dbToWAVolume(value);
      this.outputDrive.gain.setValueAtTime(this._outputGain, userContext.currentTime, 0.01);
    }
  },
  algorithmIndex: {
    get: function () {
      return this._algorithmIndex;
    },
    set: function (value) {
      this._algorithmIndex = value;
      this.curveAmount = this._curveAmount;
    }
  },
  waveshaperAlgorithms: {
    value: [
      function (amount, n_samples, ws_table) {
        amount = Math.min(amount, 0.9999);
        var k = 2 * amount / (1 - amount),
          i, x;
        for (i = 0; i < n_samples; i++) {
          x = i * 2 / n_samples - 1;
          ws_table[i] = (1 + k) * x / (1 + k * Math.abs(x));
        }
      },
      function (amount, n_samples, ws_table) {
        var i, x, y;
        for (i = 0; i < n_samples; i++) {
          x = i * 2 / n_samples - 1;
          y = ((0.5 * Math.pow((x + 1.4), 2)) - 1) * (y >= 0 ? 5.8 : 1.2);
          ws_table[i] = tanh(y);
        }
      },
      function (amount, n_samples, ws_table) {
        var i, x, y, a = 1 - amount;
        for (i = 0; i < n_samples; i++) {
          x = i * 2 / n_samples - 1;
          y = x < 0 ? -Math.pow(Math.abs(x), a + 0.04) : Math.pow(x, a);
          ws_table[i] = tanh(y * 2);
        }
      },
      function (amount, n_samples, ws_table) {
        var i, x, y, abx, a = 1 - amount > 0.99 ? 0.99 : 1 - amount;
        for (i = 0; i < n_samples; i++) {
          x = i * 2 / n_samples - 1;
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
      function (amount, n_samples, ws_table) { // fixed curve, amount doesn't do anything, the distortion is just from the drive
        var i, x;
        for (i = 0; i < n_samples; i++) {
          x = i * 2 / n_samples - 1;
          if (x < -0.08905) {
            ws_table[i] = (-3 / 4) * (1 - (Math.pow((1 - (Math.abs(x) - 0.032857)), 12)) + (1 / 3) * (Math.abs(x) - 0.032847)) + 0.01;
          } else if (x >= -0.08905 && x < 0.320018) {
            ws_table[i] = (-6.153 * (x * x)) + 3.9375 * x;
          } else {
            ws_table[i] = 0.630035;
          }
        }
      },
      function (amount, n_samples, ws_table) {
        var a = 2 + Math.round(amount * 14),
          // we go from 2 to 16 bits, keep in mind for the UI
          bits = Math.round(Math.pow(2, a - 1)),
          // real number of quantization steps divided by 2
          i, x;
        for (i = 0; i < n_samples; i++) {
          x = i * 2 / n_samples - 1;
          ws_table[i] = Math.round(x * bits) / bits;
        }
      }
    ]
  }
});

Tuna.prototype.Panner = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }

  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.panner = userContext.createStereoPanner();
  this.output = userContext.createGain();

  this.activateNode.connect(this.panner);
  this.panner.connect(this.output);

  this.pan = initValue(properties.pan, this.defaults.pan.value);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Panner.prototype = Object.create(Super, {
  name: {
    value: "Panner"
  },
  defaults: {
    writable: true,
    value: {
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      },
      pan: {
        value: 0.0,
        min: -1.0,
        max: 1.0,
        automatable: true,
        type: FLOAT
      }
    }
  },
  pan: {
    enumerable: true,
    get: function () {
      return this.panner.pan;
    },
    set: function (value) {
      this.panner.pan.value = value;
    }
  }
});

Tuna.prototype.Phaser = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.input = userContext.createGain();
  this.splitter = this.activateNode = userContext.createChannelSplitter(2);
  this.filtersL = [];
  this.filtersR = [];
  this.feedbackGainNodeL = userContext.createGain();
  this.feedbackGainNodeR = userContext.createGain();
  this.merger = userContext.createChannelMerger(2);
  this.filteredSignal = userContext.createGain();
  this.output = userContext.createGain();
  this.lfoL = new userInstance.LFO({
    target: this.filtersL,
    callback: this.callback
  });
  this.lfoR = new userInstance.LFO({
    target: this.filtersR,
    callback: this.callback
  });

  var i = this.stage;
  while (i--) {
    this.filtersL[i] = userContext.createBiquadFilter();
    this.filtersR[i] = userContext.createBiquadFilter();
    this.filtersL[i].type = "allpass";
    this.filtersR[i].type = "allpass";
  }
  this.input.connect(this.splitter);
  this.input.connect(this.output);
  this.splitter.connect(this.filtersL[0], 0, 0);
  this.splitter.connect(this.filtersR[0], 1, 0);
  this.connectInOrder(this.filtersL);
  this.connectInOrder(this.filtersR);
  this.filtersL[this.stage - 1].connect(this.feedbackGainNodeL);
  this.filtersL[this.stage - 1].connect(this.merger, 0, 0);
  this.filtersR[this.stage - 1].connect(this.feedbackGainNodeR);
  this.filtersR[this.stage - 1].connect(this.merger, 0, 1);
  this.feedbackGainNodeL.connect(this.filtersL[0]);
  this.feedbackGainNodeR.connect(this.filtersR[0]);
  this.merger.connect(this.output);

  this.rate = initValue(properties.rate, this.defaults.rate.value);
  this.baseModulationFrequency = properties.baseModulationFrequency || this.defaults.baseModulationFrequency.value;
  this.depth = initValue(properties.depth, this.defaults.depth.value);
  this.feedback = initValue(properties.feedback, this.defaults.feedback.value);
  this.stereoPhase = initValue(properties.stereoPhase, this.defaults.stereoPhase.value);

  this.lfoL.activate(true);
  this.lfoR.activate(true);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Phaser.prototype = Object.create(Super, {
  name: {
    value: "Phaser"
  },
  stage: {
    value: 4
  },
  defaults: {
    writable: true,
    value: {
      rate: {
        value: 0.1,
        min: 0,
        max: 8,
        automatable: false,
        type: FLOAT
      },
      depth: {
        value: 0.6,
        min: 0,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      feedback: {
        value: 0.7,
        min: 0,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      stereoPhase: {
        value: 40,
        min: 0,
        max: 180,
        automatable: false,
        type: FLOAT
      },
      baseModulationFrequency: {
        value: 700,
        min: 500,
        max: 1500,
        automatable: false,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  callback: {
    value: function (filters, value) {
      for (var stage = 0; stage < 4; stage++) {
        filters[stage].frequency.value = value;
      }
    }
  },
  depth: {
    get: function () {
      return this._depth;
    },
    set: function (value) {
      this._depth = value;
      this.lfoL.oscillation = this._baseModulationFrequency * this._depth;
      this.lfoR.oscillation = this._baseModulationFrequency * this._depth;
    }
  },
  rate: {
    get: function () {
      return this._rate;
    },
    set: function (value) {
      this._rate = value;
      this.lfoL.frequency = this._rate;
      this.lfoR.frequency = this._rate;
    }
  },
  baseModulationFrequency: {
    enumerable: true,
    get: function () {
      return this._baseModulationFrequency;
    },
    set: function (value) {
      this._baseModulationFrequency = value;
      this.lfoL.offset = this._baseModulationFrequency;
      this.lfoR.offset = this._baseModulationFrequency;
      this.depth = this._depth;
    }
  },
  feedback: {
    get: function () {
      return this._feedback;
    },
    set: function (value) {
      this._feedback = value;
      this.feedbackGainNodeL.gain.setTargetAtTime(this._feedback, userContext.currentTime, 0.01);
      this.feedbackGainNodeR.gain.setTargetAtTime(this._feedback, userContext.currentTime, 0.01);
    }
  },
  stereoPhase: {
    get: function () {
      return this._stereoPhase;
    },
    set: function (value) {
      this._stereoPhase = value;
      var newPhase = this.lfoL._phase + this._stereoPhase * Math.PI / 180;
      newPhase = fmod(newPhase, 2 * Math.PI);
      this.lfoR._phase = newPhase;
    }
  }
});

Tuna.prototype.PingPongDelay = function (properties) {
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
  this.stereoToMonoMix.gain.value = .5;
  this.stereoToMonoMix.connect(this.wet);
  this.wet.connect(this.delayLeft);
  this.feedbackLevel.connect(this.wet);
  this.delayLeft.connect(this.delayRight);
  this.delayRight.connect(this.feedbackLevel);
  this.delayLeft.connect(this.merger, 0, 0);
  this.delayRight.connect(this.merger, 0, 1);
  this.merger.connect(this.output);
  this.activateNode.connect(this.output);

  this.delayTimeLeft = properties.delayTimeLeft !== undefined ? properties.delayTimeLeft : this.defaults.delayTimeLeft.value;
  this.delayTimeRight = properties.delayTimeRight !== undefined ? properties.delayTimeRight : this.defaults.delayTimeRight.value;
  this.feedbackLevel.gain.value = properties.feedback !== undefined ? properties.feedback : this.defaults.feedback.value;
  this.wet.gain.value = properties.wetLevel !== undefined ? properties.wetLevel : this.defaults.wetLevel.value;
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.PingPongDelay.prototype = Object.create(Super, {
  name: {
    value: "PingPongDelay"
  },
  delayTimeLeft: {
    enumerable: true,
    get: function () {
      return this._delayTimeLeft;
    },
    set: function (value) {
      this._delayTimeLeft = value;
      this.delayLeft.delayTime.value = value / 1000;
    }
  },
  delayTimeRight: {
    enumerable: true,
    get: function () {
      return this._delayTimeRight;
    },
    set: function (value) {
      this._delayTimeRight = value;
      this.delayRight.delayTime.value = value / 1000;
    }
  },
  wetLevel: {
    enumerable: true,
    get: function () {
      return this.wet.gain;
    },
    set: function (value) {
      this.wet.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  feedback: {
    enumerable: true,
    get: function () {
      return this.feedbackLevel.gain;
    },
    set: function (value) {
      this.feedbackLevel.gain.setTargetAtTime(value, userContext.currentTime, 0.01);
    }
  },
  defaults: {
    writable: true,
    value: {
      delayTimeLeft: {
        value: 200,
        min: 1,
        max: 10000,
        automatable: false,
        type: INT
      },
      delayTimeRight: {
        value: 400,
        min: 1,
        max: 10000,
        automatable: false,
        type: INT
      },
      feedback: {
        value: 0.3,
        min: 0,
        max: 1,
        automatable: true,
        type: FLOAT
      },
      wetLevel: {
        value: 0.5,
        min: 0,
        max: 1,
        automatable: true,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  }
});

Tuna.prototype.Tremolo = function (properties) {
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
    callback: pipe
  });
  this.lfoR = new userInstance.LFO({
    target: this.amplitudeR.gain,
    callback: pipe
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

  this.lfoL.offset = 1 - (this.intensity / 2);
  this.lfoR.offset = 1 - (this.intensity / 2);
  this.lfoL.phase = this.stereoPhase * Math.PI / 180;

  this.lfoL.activate(true);
  this.lfoR.activate(true);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.Tremolo.prototype = Object.create(Super, {
  name: {
    value: "Tremolo"
  },
  defaults: {
    writable: true,
    value: {
      intensity: {
        value: 0.3,
        min: 0,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      stereoPhase: {
        value: 0,
        min: 0,
        max: 180,
        automatable: false,
        type: FLOAT
      },
      rate: {
        value: 5,
        min: 0.1,
        max: 11,
        automatable: false,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
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
    }
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
    }
  },
  stereoPhase: {
    enumerable: true,
    get: function () {
      return this._stereoPhase;
    },
    set: function (value) {
      this._stereoPhase = value;
      var newPhase = this.lfoL._phase + this._stereoPhase * Math.PI / 180;
      newPhase = fmod(newPhase, 2 * Math.PI);
      this.lfoR.phase = newPhase;
    }
  }
});

Tuna.prototype.WahWah = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.input = userContext.createGain();
  this.activateNode = userContext.createGain();
  this.envelopeFollower = new userInstance.EnvelopeFollower({
    target: this,
    callback: function (context, value) {
      context.sweep = value;
    }
  });
  this.filterBp = userContext.createBiquadFilter();
  this.filterPeaking = userContext.createBiquadFilter();
  this.output = userContext.createGain();

  //Connect AudioNodes
  this.activateNode.connect(this.filterBp);
  this.filterBp.connect(this.filterPeaking);
  this.filterPeaking.connect(this.output);

  //Set Properties
  this.init();
  this.automode = initValue(properties.automode, this.defaults.automode.value);
  this.resonance = properties.resonance || this.defaults.resonance.value;
  this.sensitivity = initValue(properties.sensitivity, this.defaults.sensitivity.value);
  this.baseFrequency = initValue(properties.baseFrequency, this.defaults.baseFrequency.value);
  this.excursionOctaves = properties.excursionOctaves || this.defaults.excursionOctaves.value;
  this.sweep = initValue(properties.sweep, this.defaults.sweep.value);

  this.activateNode.gain.value = 2;
  this.envelopeFollower.activate(true);
  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.WahWah.prototype = Object.create(Super, {
  name: {
    value: "WahWah"
  },
  defaults: {
    writable: true,
    value: {
      automode: {
        value: true,
        automatable: false,
        type: BOOLEAN
      },
      baseFrequency: {
        value: 0.153,
        min: 0,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      excursionOctaves: {
        value: 3.3,
        min: 1,
        max: 6,
        automatable: false,
        type: FLOAT
      },
      sweep: {
        value: 0.35,
        min: 0,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      resonance: {
        value: 19,
        min: 1,
        max: 100,
        automatable: false,
        type: FLOAT
      },
      sensitivity: {
        value: -0.5,
        min: -1,
        max: 1,
        automatable: false,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  automode: {
    get: function () {
      return this._automode;
    },
    set: function (value) {
      this._automode = value;
      if (value) {
        this.activateNode.connect(this.envelopeFollower.input);
        this.envelopeFollower.activate(true);
      } else {
        this.envelopeFollower.activate(false);
        this.activateNode.disconnect();
        this.activateNode.connect(this.filterBp);
      }
    }
  },
  filterFreqTimeout: {
    writable: true,
    value: 0
  },
  setFilterFreq: {
    value: function () {
      try {
        this.filterBp.frequency.value = Math.min(22050, this._baseFrequency + this._excursionFrequency * this._sweep);
        this.filterPeaking.frequency.value = Math.min(22050, this._baseFrequency + this._excursionFrequency * this._sweep);
      } catch (e) {
        clearTimeout(this.filterFreqTimeout);
        //put on the next cycle to let all init properties be set
        this.filterFreqTimeout = setTimeout(function () {
          this.setFilterFreq();
        }.bind(this), 0);
      }
    }
  },
  sweep: {
    enumerable: true,
    get: function () {
      return this._sweep;
    },
    set: function (value) {
      this._sweep = Math.pow(value > 1 ? 1 : value < 0 ? 0 : value, this._sensitivity);
      this.setFilterFreq();
    }
  },
  baseFrequency: {
    enumerable: true,
    get: function () {
      return this._baseFrequency;
    },
    set: function (value) {
      this._baseFrequency = 50 * Math.pow(10, value * 2);
      this._excursionFrequency = Math.min(userContext.sampleRate / 2, this.baseFrequency * Math.pow(2, this._excursionOctaves));
      this.setFilterFreq();
    }
  },
  excursionOctaves: {
    enumerable: true,
    get: function () {
      return this._excursionOctaves;
    },
    set: function (value) {
      this._excursionOctaves = value;
      this._excursionFrequency = Math.min(userContext.sampleRate / 2, this.baseFrequency * Math.pow(2, this._excursionOctaves));
      this.setFilterFreq();
    }
  },
  sensitivity: {
    enumerable: true,
    get: function () {
      return this._sensitivity;
    },
    set: function (value) {
      this._sensitivity = Math.pow(10, value);
    }
  },
  resonance: {
    enumerable: true,
    get: function () {
      return this._resonance;
    },
    set: function (value) {
      this._resonance = value;
      this.filterPeaking.Q.value = this._resonance;
    }
  },
  init: {
    value: function () {
      this.output.gain.value = 1;
      this.filterPeaking.type = "peaking";
      this.filterBp.type = "bandpass";
      this.filterPeaking.frequency.value = 100;
      this.filterPeaking.gain.value = 20;
      this.filterPeaking.Q.value = 5;
      this.filterBp.frequency.value = 100;
      this.filterBp.Q.value = 1;
    }
  }
});

Tuna.prototype.EnvelopeFollower = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }
  this.input = userContext.createGain();
  this.jsNode = this.output = userContext.createScriptProcessor(this.buffersize, 1, 1);

  this.input.connect(this.output);

  this.attackTime = initValue(properties.attackTime, this.defaults.attackTime.value);
  this.releaseTime = initValue(properties.releaseTime, this.defaults.releaseTime.value);
  this._envelope = 0;
  this.target = properties.target || {};
  this.callback = properties.callback || function () { };

  this.bypass = properties.bypass || this.defaults.bypass.value;
};
Tuna.prototype.EnvelopeFollower.prototype = Object.create(Super, {
  name: {
    value: "EnvelopeFollower"
  },
  defaults: {
    value: {
      attackTime: {
        value: 0.003,
        min: 0,
        max: 0.5,
        automatable: false,
        type: FLOAT
      },
      releaseTime: {
        value: 0.5,
        min: 0,
        max: 0.5,
        automatable: false,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  buffersize: {
    value: 256
  },
  envelope: {
    value: 0
  },
  sampleRate: {
    value: 44100
  },
  attackTime: {
    enumerable: true,
    get: function () {
      return this._attackTime;
    },
    set: function (value) {
      this._attackTime = value;
      this._attackC = Math.exp(-1 / this._attackTime * this.sampleRate / this.buffersize);
    }
  },
  releaseTime: {
    enumerable: true,
    get: function () {
      return this._releaseTime;
    },
    set: function (value) {
      this._releaseTime = value;
      this._releaseC = Math.exp(-1 / this._releaseTime * this.sampleRate / this.buffersize);
    }
  },
  callback: {
    get: function () {
      return this._callback;
    },
    set: function (value) {
      if (typeof value === "function") {
        this._callback = value;
      } else {
        console.error("tuna.js: " + this.name + ": Callback must be a function!");
      }
    }
  },
  target: {
    get: function () {
      return this._target;
    },
    set: function (value) {
      this._target = value;
    }
  },
  activate: {
    value: function (doActivate) {
      this.activated = doActivate;
      if (doActivate) {
        this.jsNode.connect(userContext.destination);
        this.jsNode.onaudioprocess = this.returnCompute(this);
      } else {
        this.jsNode.disconnect();
        this.jsNode.onaudioprocess = null;
      }
      if (this.activateCallback) {
        this.activateCallback(doActivate);
      }
    }
  },
  returnCompute: {
    value: function (instance) {
      return function (event) {
        instance.compute(event);
      };
    }
  },
  compute: {
    value: function (event) {
      var count = event.inputBuffer.getChannelData(0).length,
        channels = event.inputBuffer.numberOfChannels,
        current, chan, rms, i;
      chan = rms = i = 0;

      for (chan = 0; chan < channels; ++chan) {
        for (i = 0; i < count; ++i) {
          current = event.inputBuffer.getChannelData(chan)[i];
          rms += (current * current);
        }
      }
      rms = Math.sqrt(rms / channels);

      if (this._envelope < rms) {
        this._envelope *= this._attackC;
        this._envelope += (1 - this._attackC) * rms;
      } else {
        this._envelope *= this._releaseC;
        this._envelope += (1 - this._releaseC) * rms;
      }
      this._callback(this._target, this._envelope);
    }
  }
});

Tuna.prototype.LFO = function (properties) {
  if (!properties) {
    properties = this.getDefaults();
  }

  //Instantiate AudioNode
  this.input = userContext.createGain();
  this.output = new AudioWorkletNode(userContext, 'lfo', {
    processorOptions: { sampleRate: userContext.sampleRate }, channelCount: 1, channelCountMode: 'explicit', outputChannelCount: [1]
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
    type: 'set-all',
    value: { oscillation: this.oscillation, offset: this.offset, frequency: this.frequency, phase: this.phase }
  });
};
Tuna.prototype.LFO.prototype = Object.create(Super, {
  name: {
    value: "LFO"
  },
  bufferSize: {
    value: 128
  },
  sampleRate: {
    value: 44100
  },
  defaults: {
    value: {
      frequency: {
        value: 1,
        min: 0,
        max: 20,
        automatable: false,
        type: FLOAT
      },
      offset: {
        value: 0.85,
        min: 0,
        max: 22049,
        automatable: false,
        type: FLOAT
      },
      oscillation: {
        value: 0.3,
        min: -22050,
        max: 22050,
        automatable: false,
        type: FLOAT
      },
      phase: {
        value: 0,
        min: 0,
        max: 2 * Math.PI,
        automatable: false,
        type: FLOAT
      },
      bypass: {
        value: false,
        automatable: false,
        type: BOOLEAN
      }
    }
  },
  frequency: {
    get: function () {
      return this._frequency;
    },
    set: function (value) {
      this._frequency = value;
      this._phaseInc = 2 * Math.PI * this._frequency * this.bufferSize / this.sampleRate;
      this.output.port.postMessage({
        type: 'set-frequency',
        value: this.frequency
      });
    }
  },
  offset: {
    get: function () {
      return this._offset;
    },
    set: function (value) {
      this._offset = value;
      this.output.port.postMessage({
        type: 'set-offset',
        value: this.offset
      });
    }
  },
  oscillation: {
    get: function () {
      return this._oscillation;
    },
    set: function (value) {
      this._oscillation = value;
      this.output.port.postMessage({
        type: 'set-oscillation',
        value: this.oscillation
      });
    }
  },
  phase: {
    get: function () {
      return this._phase;
    },
    set: function (value) {
      this._phase = value;
      this.output.port.postMessage({
        type: 'set-phase',
        value: this.phase
      });
    }
  },
  activate: {
    value: function (doActivate) {
      if (doActivate) {
        // this.output.connect(userContext.destination);
        if (this.activateCallback) {
          this.activateCallback(doActivate);
        }
      } else {
        // this.output.disconnect();
      }
    }
  }
});

Tuna.toString = Tuna.prototype.toString = function () {
  return "Please visit https://github.com/Theodeus/tuna/wiki for instructions on how to use Tuna.js";
};
