import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core/terminal";
import { Node } from "../../core/node";
import { Button } from "../../ui/button";

export class ToArray extends Node {
  addButton: Button;

  constructor(flow: Flow, inputs: number, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'To Array', options.position || new Vector2(50, 50), options.width || 100,
      (inputs && inputs > 0
        ? (new Array(inputs).fill(null).map((_, index) => ({ name: 'In ' + (index + 1), dataType: 'any' })))
        : [{ name: 'In 1', dataType: 'any' }]
      ),
      [{ name: 'out', dataType: 'array' }],
      {
        props: options.props ? { ...options.props } : {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.addButton.on('click', () => this.addTerminal(new Terminal(this, TerminalType.IN, 'any', 'In ' + this.inputs.length + 1)));
    this.on('process', (_, inData) => this.setOutputs(0, [...inData]));
  }

  setupUI() {
    this.addButton = this.createButton('Add', { style: { grow: .5 } });
    this.ui.append(this.addButton);
  }
}
