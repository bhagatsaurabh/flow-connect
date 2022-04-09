import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Log } from "../../utils/logger";
import { Node } from "../../core/node";

export class ToVector extends Node {
  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'To Vector', options.position || new Vector(50, 50), options.width || 100,
      [{ name: 'x', dataType: 'any' }, { name: 'y', dataType: 'any' }],
      [{ name: 'vector', dataType: 'any' }],
      {
        state: options.state ? { ...options.state } : {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.on('process', (_, inputs) => {
      if (typeof inputs[0] === 'number' && typeof inputs[1] === 'number') {
        this.setOutputs(0, { x: inputs[0], y: inputs[1] });
      } else if (Array.isArray(inputs[0]) && Array.isArray(inputs[1])) {
        let result = [];
        for (let i = 0; i < inputs[0].length; i++) {
          result.push({ x: inputs[0][i], y: inputs[1][i] });
        }
        this.setOutputs(0, result);
      } else {
        Log.error('Type mismatch: Inputs to standard node \'ToVector\' should be of same type');
      }
    });
  }
}
