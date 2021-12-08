import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Align } from "../../common/enums";
import { Log } from "../../utils/logger";

export const API = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'API',
    options.position || new Vector2(50, 50),
    options.width || 150,
    [{ name: 'trigger', dataType: 'event' }],
    [{ name: 'data', dataType: 'any' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { src: '', ...options.props } : { src: '' }
  );

  node.ui.append(node.createLabel('', 'src', true, true, { align: Align.Center }));
  node.inputs[0].on('event', async () => {
    if (!node.props.src || node.props.src === '') Log.error("Prop 'src' of API Node is invalid, cannot make an API call");
    else {
      let data = await (await fetch(node.props.src)).json();
      node.setOutputs(0, data);
    }
  });
  return node;
};