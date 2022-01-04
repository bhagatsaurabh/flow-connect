import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { InputType } from "../../ui/input";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";

export class Timer extends Node {
  lastTrigger: number = Number.MIN_VALUE;

  static DefaultState = { delay: 1000 };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Timer', options.position || new Vector2(50, 50), options.width || 150, [],
      [{ name: 'timer', dataType: 'event' }],
      {
        state: options.state ? { ...Timer.DefaultState, ...options.state } : Timer.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    flow.flowConnect.on('tickreset', () => this.lastTrigger = Number.MIN_VALUE);
    flow.flowConnect.on('tick', () => {
      let current = flow.flowConnect.time;
      if (current - this.lastTrigger >= this.state.delay) {
        this.outputs[0].emit(null);
        this.lastTrigger = current;
      }
    });
  }

  setupUI() {
    this.ui.append(this.createInput({ propName: 'delay', height: 20, style: { type: InputType.Number } }));
  }
}
