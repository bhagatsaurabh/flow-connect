class TimerNode extends Node {
  timerId = -1;
  constructor(flow, position, interval) {
    super(flow, 'Timer', position, 100, [], [{ name: "trigger", dataType: "event" }], {
      state: { interval: interval }
    });

    flow.on('start', () => {
      this.outputs[0].emit();

      this.timerId = setInterval(() => {
        this.outputs[0].emit();
      }, this.state.interval);
    });
    flow.on('stop', () => clearInterval(this.timerId));
  }
}
