import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions, TerminalOutputs } from "../../common/interfaces";
import { Align } from "../../common/enums";
import { Log } from "../../utils/logger";
import { isEmpty } from "../../utils/utils";

export const API = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'API',
    options.position || new Vector2(50, 50),
    options.width || 150,
    [{ name: 'trigger', dataType: 'event' }],
    [{ name: 'text', dataType: 'string' }, { name: 'json', dataType: 'any' }, { name: 'array-buffer', dataType: 'array-buffer' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { src: '', ...options.props } : { src: '' }
  );

  node.ui.append(node.createLabel('', 'src', true, true, { align: Align.Center }));
  node.inputs[0].on('event', async () => {
    if (!node.props.src || node.props.src === '') Log.error("Prop 'src' of API Node is invalid, cannot make an API call");
    else {
      let response, outputs: TerminalOutputs = {};
      if (node.outputs.map(terminal => terminal.connectors.length).reduce((acc, curr) => acc += curr, 0) > 0) {
        response = await fetch(node.props.src);

        if (node.outputs[0].connectors.length > 0) outputs[node.outputs[0].name] = await response.text();
        else if (node.outputs[1].connectors.length > 0) outputs[node.outputs[1].name] = await response.json();
        else if (node.outputs[2].connectors.length > 0) {
          // If this is an audio connection then check the arrayBufferCache first
          if (node.outputs[2].connectors.map(connector => connector.end.dataType).includes('audio')) {
            let cached = flow.flowConnect.arrayBufferCache.get(node.props.src);
            if (!cached) {
              cached = await response.arrayBuffer();
              flow.flowConnect.arrayBufferCache.set(node.props.src, cached);
            }
            outputs[node.outputs[2].name] = cached;
          } else {
            outputs[node.outputs[2].name] = await response.arrayBuffer();
          }
        }

        if (!isEmpty(outputs)) node.setOutputs(outputs);
      }
    }
  });
  return node;
};
