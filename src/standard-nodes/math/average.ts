import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class Average extends Node {
  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Average', options.position || new Vector2(50, 50), options.width || 120,
      [{ name: 'n', dataType: 'any' }],
      [{ name: 'μ', dataType: 'any' }],
      {
        props: options.props ? { ...options.props } : {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.on('process', (_, inputs) => {
      if (Array.isArray(inputs[0])) {
        this.setOutputs(0, inputs[0].reduce((acc, curr) => acc + curr, 0) / inputs[0].length);
      }
    });
  }
}
