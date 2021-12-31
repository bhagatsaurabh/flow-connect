import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class ArrayIndex extends Node {
  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Array Index', options.position || new Vector2(50, 50), options.width || 120,
      [{ name: 'data', dataType: 'array' }, { name: 'index', dataType: 'number' }],
      [{ name: 'value', dataType: 'any' }],
      {
        props: options.props ? { ...options.props } : {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.on('process', (_, inputs) => {
      if (!inputs || !inputs[0] || typeof inputs[1] !== 'number') return;
      this.setOutputs(0, inputs[0][inputs[1]]);
    });
  }
}
