import { Flow } from "../../core/flow.js";
import { Vector} from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Node } from "../../core/node.js";

export class Property extends Node {
  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Property', options.position || new Vector(50, 50), options.width || 130,
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
