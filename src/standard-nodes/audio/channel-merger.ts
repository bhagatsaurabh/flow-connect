import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Terminal, TerminalType } from "../../core/terminal.js";
import { Node } from "../../core/node.js";
import { Button } from "../../ui/index.js";

export class ChannelMerger extends Node {
  addChannelButton: Button

  merger: ChannelMergerNode;

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Channel Merger', options.position || new Vector(50, 50), options.width || 160,
      [{ name: 'Channel 1', dataType: 'audio' }, { name: 'Channel 2', dataType: 'audio' }],
      [{ name: 'out', dataType: 'audio' }],
      {
        state: options.state || {},
        style: options.style || { rowHeight: 10, spacing: 15 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inputs[0].ref = flow.flowConnect.audioContext.createGain();
    this.inputs[1].ref = flow.flowConnect.audioContext.createGain();
    this.outputs[0].ref = flow.flowConnect.audioContext.createGain();
    this.merger = flow.flowConnect.audioContext.createChannelMerger(2);

    this.inputs[0].ref.connect(this.merger, 0, 0);
    this.inputs[1].ref.connect(this.merger, 0, 1);
    this.merger.connect(this.outputs[0].ref);

    this.setupUI();

    this.addChannelButton.on('click', () => {
      this.merger.disconnect();
      this.inputs.forEach(input => input.ref.disconnect());
      this.merger = flow.flowConnect.audioContext.createChannelMerger(this.inputs.length + 1);

      let newTerm = new Terminal(this, TerminalType.IN, 'audio', 'Channel ' + (this.inputs.length + 1));
      newTerm.ref = flow.flowConnect.audioContext.createGain();
      this.addTerminal(newTerm);

      this.inputs.forEach((input, index) => input.ref.connect(this.merger, 0, index));
      this.merger.connect(this.outputs[0].ref);
    });

    this.handleAudioConnections();
  }

  setupUI() {
    this.addChannelButton = this.createButton('Add In Channel', { height: 20 });
    this.ui.append(this.addChannelButton);
  }
  handleAudioConnections() {
    // Handle actual webaudio node stuff
    this.outputs[0].on('connect', (_, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
