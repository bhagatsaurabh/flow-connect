import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Terminal, TerminalType } from "../../core/terminal.js";
import { Node } from "../../core/node.js";

export class ChannelSplitter extends Node {
  splitter: ChannelSplitterNode;

  oldNoOfChannels = 1;

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Channel Splitter', options.position || new Vector(50, 50), options.width || 160,
      [{ name: 'in', dataType: 'audio' }],
      [{ name: 'Channel 1', dataType: 'audio' }],
      {
        state: options.state || {},
        style: options.style || { rowHeight: 10, spacing: 15 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inputs[0].ref = flow.flowConnect.audioContext.createGain();
    this.outputs[0].ref = flow.flowConnect.audioContext.createGain();
    this.outputs[0].ref.channelCountMode = 'explicit';

    this.on('channel-count-change', (newNoOfChannels) => this.checkChannels(newNoOfChannels));

    this.handleAudioConnections();
  }

  checkChannels(newNoOfChannels: number) {
    if (this.oldNoOfChannels === newNoOfChannels) return;

    this.splitter && this.splitter.disconnect();
    this.inputs[0].ref.disconnect();

    let splitter = this.flow.flowConnect.audioContext.createChannelSplitter(newNoOfChannels);
    this.inputs[0].ref.connect(splitter);

    let terminalsToRemove = [];
    for (let i = 0; i < Math.max(newNoOfChannels, this.oldNoOfChannels); i += 1) {
      if (i < newNoOfChannels) {
        if (i < this.oldNoOfChannels) {
          splitter.connect(this.outputs[i].ref, i);
        } else {
          let newTerminal = new Terminal(this, TerminalType.OUT, 'audio', 'Channel ' + (i + 1));
          newTerminal.ref = this.flow.flowConnect.audioContext.createGain();
          newTerminal.ref.channelCountMode = 'explicit';
          this.addTerminal(newTerminal);
          this.outputs[i].on('connect', (_inst, cntr) => this.outputs[i].ref.connect(cntr.end.ref));
          this.outputs[i].on('disconnect', (_inst, _cntr, _start, end) => this.outputs[i].ref.disconnect(end.ref));
          splitter.connect(this.outputs[i].ref, i);
        }
      } else {
        terminalsToRemove.push(this.outputs[i]);
      }
    }
    terminalsToRemove.forEach(term => {
      term.ref.disconnect();
      this.removeTerminal(term);
    });

    this.oldNoOfChannels = newNoOfChannels;
    this.splitter = splitter;
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_inst, cntr) => this.outputs[0].ref.connect(cntr.end.ref));
    this.outputs[0].on('disconnect', (_inst, _cntr, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
