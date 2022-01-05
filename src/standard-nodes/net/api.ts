import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Align } from "../../common/enums";
import { Log } from "../../utils/logger";
import { isEmpty } from "../../utils/utils";
import { Node } from "../../core/node";

export class API extends Node {

  static DefaultState = { src: '' };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'API', options.position || new Vector2(50, 50), options.width || 150,
      [{ name: 'trigger', dataType: 'event' }],
      [{ name: 'text', dataType: 'string' }, { name: 'json', dataType: 'any' }, { name: 'array-buffer', dataType: 'array-buffer' }],
      {
        state: options.state ? { ...API.DefaultState, ...options.state } : API.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.inputs[0].on('event', async () => {
      if (!this.state.src || this.state.src === '') Log.error("Prop 'src' of API Node is invalid, cannot make an API call");
      else {
        let response, outputs: Record<string, any> = {};
        if (this.outputs.map(terminal => terminal.connectors.length).reduce((acc, curr) => acc + curr, 0) > 0) {
          response = await fetch(this.state.src);

          if (this.outputs[0].connectors.length > 0) outputs[this.outputs[0].name] = await response.text();
          else if (this.outputs[1].connectors.length > 0) outputs[this.outputs[1].name] = await response.json();
          else if (this.outputs[2].connectors.length > 0) {
            // If this is an audio connection then check the arrayBufferCache first
            if (this.outputs[2].connectors.map(connector => connector.end.dataType).includes('audio')) {
              let cached = flow.flowConnect.arrayBufferCache.get(this.state.src);
              if (!cached) {
                cached = await response.arrayBuffer();
                flow.flowConnect.arrayBufferCache.set(this.state.src, cached);
              }
              outputs[this.outputs[2].name] = cached;
            } else {
              outputs[this.outputs[2].name] = await response.arrayBuffer();
            }
          }

          if (!isEmpty(outputs)) this.setOutputs(outputs);
        }
      }
    });
  }

  setupUI() {
    this.ui.append(this.createLabel('', { propName: 'src', input: true, output: true, style: { align: Align.Center } }));
  }
}
