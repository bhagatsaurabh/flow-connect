import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core/terminal";
import { Node } from "../../core/node";
import { RadioGroup } from "../../ui/radio-group";
import { Button } from "../../ui/button";

export class SyncData extends Node {
  syncTypeInput: RadioGroup;
  addButton: Button;

  eventIds: number[] = [];

  static DefaultState = { syncType: 'partial', hold: {} };

  constructor(flow: Flow, options: NodeCreatorOptions = {}, inputs?: number) {
    super(flow, options.name || 'Sync Data', options.position || new Vector2(50, 50), options.width || 160,
      [{ name: 'Data 1', dataType: 'any' }, { name: 'Data 2', dataType: 'any' }],
      [{ name: 'synced', dataType: 'any' }],
      {
        state: options.state ? { ...SyncData.DefaultState, ...options.state, hold: {} } : SyncData.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    if (inputs) {
      for (let i = 0; i < inputs - 2; i++) {
        this.addTerminal(new Terminal(this, TerminalType.IN, 'any', 'Data ' + (this.inputs.length + 1)));
      }
    }

    this.setupUI();

    for (let terminal of this.inputs) {
      this.eventIds.push(terminal.on('data', (inst, data) => this.process(inst, data)));
    }

    this.on('process', () => process);
  }
  setupUI() {
    this.syncTypeInput = this.createRadioGroup(['partial', 'full'], this.state.syncType, { propName: 'syncType', height: 20 });
    this.addButton = this.createButton('Add', { input: true, output: true, height: 20 });
    this.ui.append([this.syncTypeInput, this.addButton]);
    this.addButton.on('click', () => {
      let newTerminal = new Terminal(this, TerminalType.IN, 'any', 'Data ' + (this.inputs.length + 1));
      this.addTerminal(newTerminal);
      this.eventIds.push(newTerminal.on('data', (inst, data) => this.process(inst, data)));
    });
  }
  process(terminal: Terminal, data: any) {
    this.state.hold[terminal.id] = data;

    let hold = [];
    for (let term of this.inputs) {
      if (this.state.hold.hasOwnProperty(term.id)) {
        hold.push(this.state.hold[term.id]);
      }
      else return;
    }

    if (this.state.syncType === 'full') this.state.hold = {};
    this.outputs[0].emit(hold);

    for (let term of this.inputs) if (term.connectors.length > 0 && typeof term.getData() === 'undefined') return;
    this.setOutputs(0, this.getInputs());
  }
}
