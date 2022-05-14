import { Flow, FlowState } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Node } from '../../core/node.js';
import { Log } from "../../utils/logger.js";

export class Microphone extends Node {
  microphone: MediaStreamAudioSourceNode;
  stream: MediaStream;
  outGain: GainNode;

  static DefaultState = {};

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Microphone',
      options.position || new Vector(50, 50),
      options.width || 120, [],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...Microphone.DefaultState, ...options.state } : Microphone.DefaultState
      }
    )

    this.outGain = flow.flowConnect.audioContext.createGain();
    this.outputs[0].ref = this.outGain;

    this.flow.flowConnect.on('start', () => {
      if (!this.stream) {
        this.getMicrophone().then(() => {
          if (this.flow.state !== FlowState.Stopped) this.microphone.connect(this.outGain);
        }, error => {
          Log.error('Cannot access microphone: ', error);
        }).catch(error => Log.error(error));
      } else {
        this.microphone.connect(this.outGain);
      }
    });
    this.flow.flowConnect.on('stop', () => this.microphone && this.microphone.disconnect());

    this.handleAudioConnections();

    this.getMicrophone().then(() => { /**/ }, error => {
      Log.error('Cannot access microphone: ', error);
    }).catch(error => Log.error(error));
  }

  async getMicrophone() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.microphone = this.flow.flowConnect.audioContext.createMediaStreamSource(this.stream);
  }

  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
