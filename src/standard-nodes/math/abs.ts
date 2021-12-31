import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class Abs extends Node {
  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Abs', options.position || new Vector2(50, 50), options.width || 120,
      [{ name: 'x', dataType: 'any' }],
      [{ name: '|x|', dataType: 'any' }],
      {
        props: options.props ? { ...options.props } : {},
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
