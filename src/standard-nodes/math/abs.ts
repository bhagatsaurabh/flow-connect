import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Node } from "../../core/node.js";

export class Abs extends Node {
  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Abs', options.position || new Vector(50, 50), options.width || 120,
      [{ name: 'x', dataType: 'any' }],
      [{ name: '|x|', dataType: 'any' }],
      {
        state: options.state ? { ...options.state } : {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.on('process', (_, inputs) => {
      if (typeof inputs[0] === 'number') {
        this.setOutputs(0, Math.abs(inputs[0]));
      } else if (Array.isArray(inputs[0])) {
        this.setOutputs(0, inputs[0].map(item => Math.abs(item)));
      }
    });
  }
}
