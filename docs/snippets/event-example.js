import { FlowConnect } from 'flow-connect';
import { Vector2 } from 'flow-connect/core/vector';
import StandardNodes from 'flow-connect/standard-nodes';

let flowConnect = new FlowConnect(document.getElementById('canvas'));
let flow = flowConnect.createFlow({ name: "Events Example" });

let timer1 = new StandardNodes.Common.Timer(flow, {
  position: new Vector2(39.6, 5.1),
  state: {
    delay: 500, lastBlink: 0, isBlinking: false, blinkDuration: 20,
    emitValue: "Event from Timer1"
  }
});
let timer2 = new StandardNodes.Common.Timer(flow, {
  position: new Vector2(39.6, 126.8),
  state: {
    delay: 1000, lastBlink: 0, isBlinking: false, blinkDuration: 20,
    emitValue: "Event from Timer2"
  }
});
let timer3 = new StandardNodes.Common.Timer(flow, {
  position: new Vector2(304.3, 194),
  state: {
    delay: 200, lastBlink: 0, isBlinking: false, blinkDuration: 20,
    emitValue: "Event from Timer3"
  }
});
let sync1 = new StandardNodes.Common.SyncEvent(flow, {
  position: new Vector2(262.8, 57.8),
  state: { lastBlink: 0, isBlinking: false, blinkDuration: 20 }
});
let sync2 = new StandardNodes.Common.SyncEvent(flow, {
  position: new Vector2(526.7, 118.8),
  state: { lastBlink: 0, isBlinking: false, blinkDuration: 20 }
});

let outputNode = flow.createNode("Output", new Vector2(746.7, 82.8), 110, {
  state: { isLogEnabled: false },
  inputs: [{ name: "out", dataType: "event" }],
});
outputNode.ui.append(outputNode.createHozLayout(
  [
    outputNode.createLabel("Log output ?"),
    outputNode.createToggle({ height: 10, propName: "isLogEnabled", style: { grow: 1 } }),
  ],
  { style: { spacing: 5 } }
));
// Listening to terminals 'event' event
outputNode.inputs[0].on("event", (_terminal, data) => {
  if (outputNode.state.isLogEnabled) console.log(data);
});

timer1.outputs[0].connect(sync1.inputs[0]);
timer2.outputs[0].connect(sync1.inputs[1]);
sync1.outputs[0].connect(sync2.inputs[0]);
timer3.outputs[0].connect(sync2.inputs[1]);
sync2.outputs[0].connect(outputNode.inputs[0]);

let handleEmitEvent = (terminal) => {
  let currTime = flowConnect.time;
  if (!terminal.node.state.isBlinking) {
    [...terminal.node.nodeButtons.values()][1].style.color = "#000";
    terminal.node.state.lastBlink = currTime + terminal.node.state.blinkDuration;
    terminal.node.state.isBlinking = !terminal.node.state.isBlinking;
  }
};

flow.nodes.forEach((node) => {
  if (!node.outputs[0]) return;
  let statusBlip = node.addNodeButton(() => null,
    (context, params, nodeButton) => {
      /* user-defined renderer, omitted for simplicity, copy this demo to grab full code */
    },
    Align.Right
  );
  // Event for this node-button's every render cycle
  statusBlip.on("render", (nodeButton) => {
    let state = nodeButton.node.state;
    if (flowConnect.time - state.lastBlink > state.blinkDuration) {
      nodeButton.style.color = "transparent";
      state.isBlinking = false;
    }
  });
  if (node.outputs[0]) node.outputs[0].on("emit", terminal => handleEmitEvent(terminal));
});

// The global stop event fired on FlowConnect's instance
flowConnect.on("stop", () =>
  flow.nodes.forEach(node => {
    if (node.nodeButtons.size === 2)
      [...node.nodeButtons.values()][1].style.color = "transparent";
  })
);

flowConnect.render(flow);
