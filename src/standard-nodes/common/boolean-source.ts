import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";
import { Toggle } from "../../ui/toggle";

export class BooleanSource extends Node {
  toggle: Toggle;

  static DefaultProps = { value: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Boolean Source', options.position || new Vector2(50, 50), options.width || 130, [],
      [{ name: 'value', dataType: 'boolean' }],
      {
        props: options.props ? { ...BooleanSource.DefaultProps, ...options.props } : BooleanSource.DefaultProps,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.toggle.on('change', () => this.process());
    this.on('process', () => this.process());
  }


  process() { this.setOutputs(0, this.props.value); }
  setupUI() {
    let toggle = this.createToggle({ propName: 'value', input: true, output: true, height: 10, style: { grow: .3 } });
    this.ui.append(this.createHozLayout([
      this.createLabel('Value'),
      toggle
    ], { style: { spacing: 20 } }));
  }
}
