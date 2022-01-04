import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class Floor extends Node {
  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Floor', options.position || new Vector2(50, 50), options.width || 120,
      [{ name: 'x', dataType: 'any' }],
      [{ name: '|x|', dataType: 'any' }],
      {
        state: options.state ? { ...options.state } : {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {},
      }
    );

    this.on('process', (_, inputs) => {
      if (typeof inputs[0] === 'number') {
        this.setOutputs(0, Math.floor(inputs[0]));
      } else if (Array.isArray(inputs[0])) {
        this.setOutputs(0, inputs[0].map(item => Math.floor(item)));
      }
    });
  }
}
