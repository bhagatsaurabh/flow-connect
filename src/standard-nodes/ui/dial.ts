import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { DialStyle } from "../../ui/dial";
import { Align } from "../../common/enums";

export const Dial = (flow: Flow, options: NodeCreatorOptions = new Object(), dialStyle: DialStyle = new Object()) => {

  let node = flow.createNode(options.name || 'Dial', options.position || new Vector2(50, 50), options.width || 90, {
    props: options.props
      ? { value: 0, min: 0, max: 1, ...options.props }
      : { value: 0, min: 0, max: 1 },
    style: options.style || { rowHeight: 10, padding: 5, spacing: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  Object.assign(node.ui.style, {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    shadowBlur: 0,
    shadowColor: 'transparent'
  });

  let dial = node.createDial(node.props.min, node.props.max, node.width, {
    value: node.props.value, propName: 'value', input: true, output: true, style: dialStyle
  });
  node.ui.append([
    dial,
    node.createStack({
      childs: [
        node.createHozLayout([
          node.createLabel('', { propName: 'min', style: { precision: 1, fontSize: '11px', align: Align.Left, grow: .5 } }),
          node.createLabel('', { propName: 'max', style: { precision: 1, fontSize: '11px', align: Align.Right, grow: .5 } })
        ]),
        node.createHozLayout([
          node.createLabel('', { propName: 'value', style: { precision: 1, fontSize: '20px', align: Align.Center, grow: 1 } })
        ])
      ],
      style: { spacing: 5 }
    })
  ]);

  node.outputsUI[0].on('connect', (_inst, connector) => {
    if (connector.end.ref instanceof AudioParam) node.props.value = connector.end.ref.value;
  });

  return node;
};
