export const WorkletUtils = {
  CircularBuffer: URL.createObjectURL(new Blob([
    `export default class CircularBuffer {
      constructor(bufferLength, noOfChannels) {
        this.noOfChannels = noOfChannels;
        this.bufferLength = bufferLength;

        this.read = this.write = this.frames = 0;
        this.channels = [];
        for (let i = 0; i < this.noOfChannels; ++i) this.channels[i] = new Float32Array(bufferLength);
      }
      pushBlock(buffer) {
        let sourceLength = buffer[0].length;
        for (let i = 0; i < sourceLength; ++i) {
          let write = (this.write + i) % this.bufferLength;
          for (let c = 0; c < this.noOfChannels; ++c) {
            this.channels[c][write] = buffer[c][i];
          }
        }
        this.write += sourceLength;
        if (this.write >= this.bufferLength) this.write = 0;
        this.frames += sourceLength;
        if (this.frames > this.bufferLength) this.frames = this.bufferLength;
      }
      popBlock(buffer) {
        if (this.frames === 0) return;
        let destinationLength = buffer[0].length;
        for (let i = 0; i < destinationLength; ++i) {
          let read = (this.read + i) % this.bufferLength;
          for (let c = 0; c < this.noOfChannels; ++c) {
            buffer[c][i] = this.channels[c][read];
          }
        }
        this.read += destinationLength;
        if (this.read >= this.bufferLength) this.read = 0;
        this.frames -= destinationLength;
        if (this.frames < 0) this.frames = 0;
      }
    }`
  ], { type: 'application/javascript' })),
}
export const generateAudioWorklets = (utilsFileName: string) => {
  let audioWorklets: { [name: string]: string } = {
    // Creates a AudioWorkletProcessor to setup custom AudioParams for AudioBufferSourceNode's automation (because of their fire-forget-destroy behaviour)
    Worklet_ProxyParamForSource: URL.createObjectURL(new Blob([
      `registerProcessor('proxy-param-for-source', class ProxyParamForSource extends AudioWorkletProcessor {
          static get parameterDescriptors() {
            return [{
              name: 'detune',
              defaultValue: 0,
              minValue: -2400,
              maxValue: 2400,
              automationRate: 'k-rate'
            }, {
              name: 'playbackRate',
              defaultValue: 1,
              minValue: 0.25,
              maxValue: 3,
              automationRate: 'k-rate'
            }]
          }
          process(inputs, outputs, parameters) {
            outputs[0].forEach(channel => {
              for (let i = 0; i < channel.length; i++) {
                // wierd bug, the detune is off by 1200 cents, have to offset this anomaly
                channel[i] = (parameters['detune'].length > 1 ? parameters['detune'][i] : parameters['detune'][0]) - 1200;
              }
            });
            outputs[1].forEach(channel => {
              for (let i = 0; i < channel.length; i++) {
                channel[i] = (parameters['playbackRate'].length > 1 ? parameters['playbackRate'][i] : parameters['playbackRate'][0]);
              }
            });
            return true;
          }
        })`
    ], { type: 'application/javascript' })),

    // Same as above, but not specifically for AudioBufferSourceNodes, this is more general purpose
    Worklet_ProxyParam: URL.createObjectURL(new Blob([
      `registerProcessor('proxy-param', class ProxyParam extends AudioWorkletProcessor {
          static get parameterDescriptors() {
            return [{
              name: 'param',
              defaultValue: 0,
              minValue: -340282346638528859811704183484516925439,
              maxValue: 340282346638528859811704183484516925439,
              automationRate: 'k-rate'
            }]
          }

          min = -340282346638528859811704183484516925439;
          max =  340282346638528859811704183484516925439;
          offset = 0;
          constructor(...args) {
            super(...args);
            this.port.onmessage = (e) => {
              switch(e.data.type) {
                case 'set-range': {
                  this.min = e.data.value.min;
                  this.max = e.data.value.max;
                  break;
                }
                case 'set-offset': {
                  this.offset = -e.data.value
                  break;
                }
                default: break;
              }
            }
          }
          clamp(value) { return Math.min(Math.max(value, this.min), this.max); }
          process(inputs, outputs, parameters) {
            outputs[0].forEach(channel => {
              for (let i = 0; i < channel.length; i++) {
                channel[i] = this.clamp((parameters['param'].length > 1 ? parameters['param'][i] : parameters['param'][0]) + this.offset);
              }
            });
            return true;
          }
        })`
    ], { type: 'application/javascript' })),

    // This one is used to only peak at the audio data flowing through this node, mainly for debugging purposes
    Worklet_Debug: URL.createObjectURL(new Blob([
      `registerProcessor('debug', class Debug extends AudioWorkletProcessor {
          throttle = 1000;
          lastPeak = -Infinity;
          constructor(...args) {
            super(...args);
            this.port.onmessage = (e) => {
              this.throttle = e.data;
            }
          }
          process(inputs, outputs, parameters) {
            if (Date.now() - this.lastPeak > this.throttle) {
              let data = {
                inputs: inputs.map(input => input.length),
                outputs: outputs.map(output => output.length)
              };
              this.port.postMessage(data);
              this.lastPeak = Date.now();
            }
            let input = inputs[0];
            let output = outputs[0]
            for (let i = 0 ; i < input.length ; i+=1) {
              for(let c = 0 ; c < input[i].length ; c+=1) {
                output[i][c] = input[i][c];
              }
            }
            return true;
          }
        })`
    ], { type: 'application/javascript' })),

    Worklet_MoogEffect: URL.createObjectURL(new Blob([
      `import CircularBuffer from '${utilsFileName}'
      registerProcessor('moog-effect', class MoogEffect extends AudioWorkletProcessor {
      cutoff = 0.065;
      resonance = 3.5;
      f = 0; inputFactor = 0; fb = 0;

      constructor(options) {
        super();
        this.bufferSize = options.processorOptions.bufferSize;

        this.setParams();
        this.port.onmessage = (e) => {
          this.cutoff = e.data.cutoff;
          this.resonance = e.data.resonance;
          this.setParams();
        }
      }
      setParams() {
        this.f = this.cutoff * 1.16;
        this.inputFactor = 0.35013 * (this.f * this.f) * (this.f * this.f);
        this.fb = this.resonance * (1.0 - 0.15 * this.f * this.f);
      }
      channelsChanged(newNoOfChannels) {
        this.channelCount = newNoOfChannels;
        this.inputBuffer = new CircularBuffer(this.bufferSize, this.channelCount);
        this.outputBuffer = new CircularBuffer(this.bufferSize, this.channelCount);
        this.in1 = new Array(this.channelCount).fill(0);
        this.in2 = new Array(this.channelCount).fill(0);
        this.in3 = new Array(this.channelCount).fill(0);
        this.in4 = new Array(this.channelCount).fill(0);
        this.out1 = new Array(this.channelCount).fill(0);
        this.out2 = new Array(this.channelCount).fill(0);
        this.out3 = new Array(this.channelCount).fill(0);
        this.out4 = new Array(this.channelCount).fill(0);
      }

      _process(input, output) {
        for (let c = 0; c < input.length; ++c) {
          for (let i = 0; i < input[c].length; ++i) {
            input[c][i] -= this.out4[c] * this.fb;
            input[c][i] *= this.inputFactor;
            this.out1[c] = input[c][i] + 0.3 * this.in1[c] + (1 - this.f) * this.out1[c];
            this.in1[c] = input[c][i];
            this.out2[c] = this.out1[c] + 0.3 * this.in2[c] + (1 - this.f) * this.out2[c];
            this.in2[c] = this.out1[c];
            this.out3[c] = this.out2[c] + 0.3 * this.in3[c] + (1 - this.f) * this.out3[c];
            this.in3[c] = this.out2[c];
            this.out4[c] = this.out3[c] + 0.3 * this.in4[c] + (1 - this.f) * this.out4[c];
            this.in4[c] = this.out3[c];
            output[c][i] = this.out4[c];
          }
        }
      }
      process(inputs, outputs, parameters) {
        let input = inputs[0], output = outputs[0];
        if (input.length === 0) return true;

        if (!this.prevChannelCount || this.prevChannelCount !== inputs[0].length) {
          this.channelsChanged(inputs[0].length);
          this.prevChannelCount = inputs[0].length;
        }

        this.inputBuffer.pushBlock(input);
        if (this.inputBuffer.frames >= this.bufferSize) {
          let tmpInBuffer = [], tmpOutBuffer = [];
          for (let i = 0; i < this.channelCount; ++i) {
            tmpInBuffer[i] = new Float32Array(this.bufferSize);
            tmpOutBuffer[i] = new Float32Array(this.bufferSize);
          }

          this.inputBuffer.popBlock(tmpInBuffer);
          this._process(tmpInBuffer, tmpOutBuffer);
          this.outputBuffer.pushBlock(tmpOutBuffer);
        }
        this.outputBuffer.popBlock(output);
        return true;
      }
    })`
    ], { type: 'application/javascript' })),

    Worklet_BitcrusherEffect: URL.createObjectURL(new Blob([
      `import CircularBuffer from '${utilsFileName}'
      registerProcessor('bitcrusher-effect', class BitcrusherEffect extends AudioWorkletProcessor {
      bits = 4;
      normFreq = 0.1;
      step = 0;

      constructor(options) {
        super();
        this.bufferSize = options.processorOptions.bufferSize;

        this.setParams();
        this.port.onmessage = (e) => {
          this.bits = e.data.bits;
          this.normFreq = e.data.normFreq;
          this.setParams();
        }
      }
      setParams() {
        this.step = Math.pow(1 / 2, this.bits);
      }
      channelsChanged(newNoOfChannels) {
        this.channelCount = newNoOfChannels;
        this.inputBuffer = new CircularBuffer(this.bufferSize, this.channelCount);
        this.outputBuffer = new CircularBuffer(this.bufferSize, this.channelCount);
        this.phaser = new Array(this.channelCount).fill(0);
        this.last = new Array(this.channelCount).fill(0);
      }

      _process(input, output) {
        for (let c = 0; c < input.length; ++c) {
          for (let i = 0; i < input[c].length; ++i) {
            this.phaser[c] += this.normFreq;
            if (this.phaser[c] >= 1.0) {
              this.phaser[c] -= 1.0;
              this.last[c] = this.step * Math.floor(input[c][i] / this.step + 0.5);
            }
            output[c][i] = this.last[c];
          }
        }
      }
      process(inputs, outputs, parameters) {
        let input = inputs[0], output = outputs[0];
        if (input.length === 0) return true;
        if (!this.prevChannelCount || this.prevChannelCount !== inputs[0].length) {
          this.channelsChanged(inputs[0].length);
          this.prevChannelCount = inputs[0].length;
        }
        this.inputBuffer.pushBlock(input);
        if (this.inputBuffer.frames >= this.bufferSize) {
          let tmpInBuffer = [], tmpOutBuffer = [];
          for (let i = 0; i < this.channelCount; ++i) {
            tmpInBuffer[i] = new Float32Array(this.bufferSize);
            tmpOutBuffer[i] = new Float32Array(this.bufferSize);
          }
          this.inputBuffer.popBlock(tmpInBuffer);
          this._process(tmpInBuffer, tmpOutBuffer);
          this.outputBuffer.pushBlock(tmpOutBuffer);
        }
        this.outputBuffer.popBlock(output);
        return true;
      }
    })`
    ], { type: 'application/javascript' })),

    Worklet_LFO: URL.createObjectURL(new Blob([
      `registerProcessor('lfo', class LFO extends AudioWorkletProcessor {
      oscillation = 0.3;
      offset = 0.85;
      phaseInc = 0;
      phase = 0;

      constructor(options) {
        super();
        this.sampleRate = options.processorOptions.sampleRate;

        this.port.onmessage = (e) => {
          switch(e.data.type) {
            case 'set-oscillation': { this.oscillation = e.data.value; break; }
            case 'set-offset': { this.offset = e.data.value; break; }
            case 'set-phase': { this.phase = e.data.value; break; }
            case 'set-frequency': { this.phaseInc = 2 * Math.PI * e.data.value * 128 / this.sampleRate; break; }
            case 'set-all': {
              this.oscillation = e.data.value.oscillation;
              this.offset = e.data.value.offset;
              this.phase = e.data.value.phase;
              this.phaseInc = 2 * Math.PI * e.data.value.frequency * 128 / this.sampleRate;
              break;
            }
            default: return;
          }
        }
      }
      process(inputs, outputs, parameters) {
        let output = outputs[0][0];

        for (let i = 0; i < output.length; ++i) {
          this.phase += this.phaseInc;
          if (this.phase > 2 * Math.PI) this.phase = 0;
          output[i] = this.offset + this.oscillation * Math.sin(this.phase);
        }

        return true;
      }
    })`
    ], { type: 'application/javascript' })),

    Worklet_Noise: URL.createObjectURL(new Blob([
      `registerProcessor('noise', class Noise extends AudioWorkletProcessor {
      type = 'white';
      types = ['white', 'pink', 'brownian'];

      constructor(options) {
        super();
        this.port.onmessage = (e) => {
          if (!this.types.includes(e.data)) this.type = 'white';
          else this.type = e.data;
        }

        this.generate = {
          'white': (output) => {
            for (let i = 0; i < output.length; ++i) output[i] = Math.random() * 2 - 1;
          },
          'pink': (output) => {
            let b0, b1, b2, b3, b4, b5, b6;
            b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

            for (let i = 0; i < output.length; ++i) {
              let white = Math.random() * 2 - 1;
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              output[i] *= 0.11;
              b6 = white * 0.115926;
            }
          },
          'brownian': (output) => {
            let lastOut = 0.0;
            for (let i = 0; i < output.length; i++) {
              let white = Math.random() * 2 - 1;
              output[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = output[i];
              output[i] *= 3.5;
            }
          }
        }
      }
      process(inputs, outputs, parameters) {
        this.generate[this.type](outputs[0][0]);
        return true;
      }
    })`
    ], { type: 'application/javascript' })),

    // Just a normal proxy, outputs the inputs as it is, used for seamless connections of SourceNodes
    Worklet_Proxy: URL.createObjectURL(new Blob([
      `registerProcessor('proxy', class Proxy extends AudioWorkletProcessor {

      constructor() { super(); }
      process(inputs, outputs, parameters) {
        inputs.forEach((input, index) => input.forEach((channel, cIndex) => {
          outputs[index][cIndex].set(channel);
        }));
        return true;
      }
    })`
    ], { type: 'application/javascript' })),
  }

  return audioWorklets;
}
