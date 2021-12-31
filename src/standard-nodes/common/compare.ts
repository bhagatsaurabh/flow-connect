import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";
import { Select } from "../../ui/select";

export class Compare extends Node {
  select: Select

  static DefaultProps = { value: '==' };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Compare', options.position || new Vector2(50, 50), options.width || 150,
      [{ name: 'x', dataType: 'any' }, { name: 'y', dataType: 'any' }],
      [{ name: 'result', dataType: 'boolean' }],
      {
        props: options.props ? { ...Compare.DefaultProps, ...options.props } : Compare.DefaultProps,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.select.on('change', () => this.process(this.getInputs()));
    this.on('process', (_, inputs) => this.process(inputs));
  }

  process(inputs: any[]) {
    if (inputs[0] === null || typeof inputs[0] === 'undefined' || inputs[1] === null || typeof inputs[1] === 'undefined') return;
    let res;
    switch (this.props.value) {
      case '==': { res = inputs[0] == inputs[1]; break; }
      case '===': { res = inputs[0] === inputs[1]; break; }
      case '!=': { res = inputs[0] != inputs[1]; break; }
      case '!==': { res = inputs[0] !== inputs[1]; break; }
      case '<': { res = inputs[0] < inputs[1]; break; }
      case '<=': { res = inputs[0] <= inputs[1]; break; }
      case '>': { res = inputs[0] > inputs[1]; break; }
      case '>=': { res = inputs[0] >= inputs[1]; break; }
      case '&&': { res = inputs[0] && inputs[1]; break; }
      case '||': { res = inputs[0] || inputs[1]; break; }
      default: res = false;
    }
    this.setOutputs(0, res);
  }
  setupUI() {
    let select = this.createSelect(
      ['==', '===', '!=', '!==', '<', '<=', '>', '>=', '&&', '||'],
      { propName: 'value', input: true, output: true, height: 15, style: { fontSize: '14px' } }
    );
    this.ui.append(select);
  }
}
