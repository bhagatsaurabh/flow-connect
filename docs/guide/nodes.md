# Nodes

## Creating a Node

A Node is a singular processing unit in a <Ref to="/reference/api/classes/flow">Flow</Ref> accepting inputs through input <Ref to="/reference/api/classes/terminal">terminals</Ref> and producing output through output <Ref to="/reference/api/classes/terminal">terminals</Ref> for other connected nodes/flows.

### Using Flow.createNode

<br/>
<Ref to="/reference/api/classes/flow#createnode">Flow.createNode</Ref>

```js
let randomNode = flow.createNode("core/empty", Vector.create(285, 50), {
  name: "Random",
  width: 120,
  inputs: [{ name: "trigger", dataType: "event" }],
  outputs: [{ name: "random", dataType: "number" }],
});
```

### Extending Node class

```js
class TimerNode extends Node {
  timerId = -1;

  setupIO() {
    this.addTerminals([{ type: TerminalType.OUT, name: "trigger", dataType: "event" }]);
  }
  created(options) {
    const { interval = 1000, name = "Timer", width = 100 } = options;

    this.width = width;
    this.name = name;
    this.state = { interval };

    this.flow.on("start", () => {
      this.outputs[0].emit();
      this.timerId = setInterval(() => this.outputs[0].emit(), this.state.interval);
    });
    this.flow.on("stop", () => clearInterval(this.timerId));
  }
  process() {}
}

// Register a new Node plugin by passing in the metadata and the constructor
FlowConnect.register({ type: "node", name: "custom/my-timer-node" }, TimerNode);

// Create the custom Node
let timerNode = flow.createNode("custom/my-timer-node", Vector.create(45, 7), { interval: 500 });
```

### Using StandardNodes

There are a few <Ref to="/reference/standard-nodes/common/">StandardNodes</Ref> that can be re-used instead of creating nodes from scratch:

```js
let numberSource = flow.createNode("common/number-source", Vector.create(245, 128), {
  state: { value: 100 },
});
```
