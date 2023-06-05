if (!window.TimerNode) {
  window.TimerNode = class TimerNode extends Node {
    timerId = -1;

    setupIO() {
      this.addTerminals([{ type: TerminalType.OUT, name: "trigger", dataType: "event" }]);
    }
    created(options) {
      const { interval = 1000 } = options;

      this.name = "Timer";
      this.width = 100;
      this.state = { interval };

      flow.on("start", () => {
        this.outputs[0].emit();

        this.timerId = setInterval(() => {
          this.outputs[0].emit();
        }, this.state.interval);
      });
      flow.on("stop", () => clearInterval(this.timerId));
    }
  };

  FlowConnect.register({ type: "node", name: "custom/timer-node" }, window.TimerNode);
}
