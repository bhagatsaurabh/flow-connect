import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { DialStyle } from "../../ui/dial";
import { Align } from "../../common/enums";
import { Node } from "../../core/node";

export class Dial extends Node {

  static DefaultState = { value: 0, min: 0, max: 1 };

  constructor(flow: Flow, options: NodeCreatorOptions = new Object(), dialStyle: DialStyle = new Object()) {
    super(flow, options.name || 'Dial', options.position || new Vector2(50, 50), options.width || 90, [], [],
      {
        state: options.state ? { ...Dial.DefaultState, ...options.state } : Dial.DefaultState,
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
      if (connector.end.ref instanceof AudioParam) this.state.value = connector.end.ref.value;
    });
  }

  setupUI(dialStyle: DialStyle) {
    let dial = this.createDial(this.state.min, this.state.max, this.width, {
      value: this.state.value, propName: 'value', input: true, output: true, style: dialStyle
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
