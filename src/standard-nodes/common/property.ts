import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class Property extends Node {
  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Property', options.position || new Vector2(50, 50), options.width || 130,
      [{ name: 'object', dataType: 'any' }, { name: 'key', dataType: 'string' }],
      [{ name: 'value', dataType: 'any' }],
      {
        state: options.state ? { ...options.state } : {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.on('process', (_, inputs) => {
      if (!inputs[0]) return;
      this.setOutputs(0, inputs[0][inputs[1]]);
    });
  }
}
