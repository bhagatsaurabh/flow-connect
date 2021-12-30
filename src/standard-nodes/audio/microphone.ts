import { Flow, FlowState } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from '../../core/node';
import { Log } from "../../utils/logger";

export class Microphone extends Node {
  microphone: MediaStreamAudioSourceNode;
  stream: MediaStream;
  outGain: GainNode;

  static DefaultProps = {};

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Microphone',
      options.position || new Vector2(50, 50),
      options.width || 120, [],
      [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {},
        props: options.props ? { ...Microphone.DefaultProps, ...options.props } : Microphone.DefaultProps
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

    this.getMicrophone().then(() => { }, error => {
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
