import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { DialStyle } from "../../ui/dial";
import { Align } from "../../common/enums";
import { Node } from "../../core/node";

export class Dial extends Node {

  static DefaultProps = { value: 0, min: 0, max: 1 };

  constructor(flow: Flow, options: NodeCreatorOptions = new Object(), dialStyle: DialStyle = new Object()) {
    super(flow, options.name || 'Dial', options.position || new Vector2(50, 50), options.width || 90, [], [],
      {
        props: options.props ? { ...Dial.DefaultProps, ...options.props } : Dial.DefaultProps,
        style: options.style || { rowHeight: 10, padding: 5, spacing: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    Object.assign(this.ui.style, {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      shadowBlur: 0,
      shadowColor: 'transparent'
    });

    this.setupUI(dialStyle);

    this.outputsUI[0].on('connect', (_inst, connector) => {
      if (connector.end.ref instanceof AudioParam) this.props.value = connector.end.ref.value;
    });
  }

  setupUI(dialStyle: DialStyle) {
    let dial = this.createDial(this.props.min, this.props.max, this.width, {
      value: this.props.value, propName: 'value', input: true, output: true, style: dialStyle
    });
    this.ui.append([
      dial,
      this.createStack({
        childs: [
          this.createHozLayout([
            this.createLabel('', { propName: 'min', style: { precision: 1, fontSize: '11px', align: Align.Left, grow: .5 } }),
            this.createLabel('', { propName: 'max', style: { precision: 1, fontSize: '11px', align: Align.Right, grow: .5 } })
          ]),
          this.createHozLayout([
            this.createLabel('', { propName: 'value', style: { precision: 1, fontSize: '20px', align: Align.Center, grow: 1 } })
          ])
        ],
        style: { spacing: 5 }
      })
    ]);
  }
}
