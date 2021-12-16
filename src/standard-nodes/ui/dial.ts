import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { DialStyle } from "../../ui/dial";
import { Align } from "../../common/enums";

export const Dial = (flow: Flow, options: NodeCreatorOptions = new Object(), dialStyle: DialStyle = new Object()) => {

  let node = flow.createNode(
    options.name || 'Dial',
    options.position || new Vector2(50, 50),
    options.width || 80, [], [],
    options.style || { rowHeight: 10, padding: 5, spacing: 10 },
    options.terminalStyle || {},
    options.props
      ? { value: 0, min: 0, max: 1, ...options.props }
      : { value: 0, min: 0, max: 1 }
  );

  Object.assign(node.ui.style, {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    shadowBlur: 0,
    shadowColor: 'transparent'
  });

  let dial = node.createDial(node.props.min, node.props.max, node.props.value, node.width, 'value', true, true, dialStyle);
  node.ui.append([
    dial,
    node.createStack([
      node.createHozLayout([
        node.createLabel(node.props.min, 'min', false, false, { precision: 1, fontSize: '11px', align: Align.Left } as any),
        node.createLabel(node.props.max, 'max', false, false, { precision: 1, fontSize: '11px', align: Align.Right } as any)
      ]),
      node.createHozLayout([
        node.createLabel(node.props.value, 'value', false, false, { precision: 1, fontSize: '20px', align: Align.Center } as any)
      ])
    ], { spacing: 5 })
  ]);

  return node;
};
