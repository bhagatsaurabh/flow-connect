import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const FileSource = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'File Source',
    options.position || new Vector2(50, 50),
    options.width || 130, [],
    [{ name: 'file', dataType: 'file' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { file: null, ...options.props } : { file: null }
  );

  let process = () => node.setOutputs(0, node.props.file);

  let fileInput = node.createSource({ propName: 'file', input: true, output: true, height: 20 });
  node.ui.append(fileInput);

  fileInput.on('change', process);
  node.on('process', process);

  return node;
};
