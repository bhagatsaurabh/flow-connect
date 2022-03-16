import { FlowConnect } from 'flow-connect';
import { Vector } from 'flow-connect/core/vector';
import StandardNodes from 'flow-connect/standard-nodes';

let flowConnect = new FlowConnect(document.getElementById('canvas'));
let flow = flowConnect.createFlow({
  name: 'Customize Example',
  // Customize colors for each terminal type of every node in this Flow
  terminalColors: {
    event: '#ff8787', number: '#b7ff87', boolean: '#87afff',
    string: '#ff87c9', any: 'red'
  }
});

let timerNode1 = new StandardNodes.Common.Timer(flow, {
  position: new Vector(22.6, 1.2), state: { delay: 700 },
  // Customization applied only on this node
  style: {
    padding: 15, spacing: 20, rowHeight: 20,
    color: '#555',
    titleColor: 'green', titleHeight: 30, outlineColor: '#ffa200',
    terminalRowHeight: 25, terminalStripMargin: 4,
    maximizeButtonColor: '#df87ff', expandButtonColor: 'blueviolet', minimizedTerminalColor: '#87dfff',
    nodeButtonSize: 10, nodeButtonSpacing: 10
  }
});
// Styling this Node
timerNode1.ui.style = {
  backgroundColor: '#6ba4ff',
  shadowColor: 'white',
  shadowBlur: 0,
  shadowOffset: Vector.Zero(),
  borderColor: '#0062ff',
  borderWidth: 8
};
// Styling individual UI components
let label = timerNode1.ui.query('input')[0].children[0];
label.style.backgroundColor = '#fff';
label.style.color = '#000';

let timerNode2 = new StandardNodes.Common.Timer(flow, {
  position: new Vector(22.6, 194.7), state: { delay: 600 }
});
timerNode2.ui.style = {
  backgroundColor: '#ffb561',
  shadowColor: '#999', shadowBlur: 10, shadowOffset: Vector.Zero(),
  borderColor: '#ffb561', borderWidth: 0
};

let randomNode = new StandardNodes.Common.Random(flow, {
  position: new Vector(321.5, 6.7), state: { min: 0, max: 5 }
});
randomNode.ui.style.backgroundColor = '#f7ff99';
let labelStyle = { color: '#547053', font: 'courier' };
randomNode.ui.query('label').forEach(lbl => Object.assign(lbl.style, labelStyle));
randomNode.ui.query('input').forEach(input => input.children[0].style.backgroundColor = '#abff45');

let customNode = flow.createNode('Custom', new Vector(615.3, 79.8), 200, {
  state: { preset: 'default', renderer: 0 }
});
let select = customNode.createSelect(['default', 'dark', 'transparent', 'red', 'green'],
  { propName: 'preset', height: 15, input: true, style: { fontSize: '13px', grow: 1 } }
);
let button = customNode.createButton('Custom Renderers', { input: true });
customNode.ui.append([
  customNode.createHozLayout([customNode.createLabel('Preset'), select], { style: { spacing: 15 } }),
  button
]);
let labels = customNode.ui.query('label');
let selects = customNode.ui.query('select');
let lightStyle = () => {
  labels.forEach(label => label.style.color = '#000');
  selects.forEach(select => select.style.arrowColor = '#000');
  button.style.backgroundColor = '#666';
  button.children[0].style.color = '#fff';
}
let darkStyle = () => {
  labels.forEach(label => label.style.color = '#fff');
  selects.forEach(select => select.style.arrowColor = '#fff');
  button.style.backgroundColor = '#fff';
  button.children[0].style.color = '#000';
}
customNode.watch('preset', (_oldVal, newVal) => {
  if (newVal === 'dark') darkStyle();
  else lightStyle();
  switch (newVal) {
    case 'default':
      customNode.ui.style.backgroundColor = '#ddd'; break;
    case 'dark':
      customNode.ui.style.backgroundColor = '#000'; break;
    case 'transparent':
      customNode.ui.style.backgroundColor = 'transparent'; break;
    case 'red':
      customNode.ui.style.backgroundColor = '#ff8080'; break;
    case 'green':
      customNode.ui.style.backgroundColor = '#b1ff80'; break;
    default: return;
  }
});
button.on('click', () => (customNode.state.renderer = (customNode.state.renderer + 1) % 3));
customNode.ui.style.shadowOffset = Vector.Zero();
customNode.ui.style.shadowBlur = 20;
customNode.ui.style.borderWidth = 0;

let renderers = [
  (context, params) => { /* ... (omitted  for simplicity, copy this demo to grab full code) */ },
  (context, params) => { /*...*/ },
  (context, params) => { /*...*/ }
];
// RenderResolver is a function which returns a user-defined renderer
// Which is extremely helpful if you need a complex renderer and full control
// It can be scoped to FlowConnect, Flow or individual Nodes, Groups and Connectors
// Here, we have scoped it to this 'customNode' that we created above, which means
// the renderer this function returns will only affect our 'customNode' Node
customNode.renderResolver.uiContainer = (container) => {
  return (context, params) => {
    Object.assign(context, {
      fillStyle: container.style.backgroundColor,
      strokeStyle: container.style.borderColor,
      shadowColor: container.style.shadowColor,
      shadowBlur: container.style.shadowBlur,
      lineWidth: container.style.borderWidth,
      shadowOffsetX: container.style.shadowOffset.x,
      shadowOffsetY: container.style.shadowOffset.y
    });
    renderers[customNode.state.renderer](context, params);
  };
};

let customRenderFn1 = (context, params, connector) => { /*...*/ };
let customRenderFn2 = (context, params, connector) => { /*...*/ };
// Here, we have a renderResolver which is scoped to entire FlowConnect instance,
// and will affect every connector in every Flow
flowConnect.renderResolver.connector = (connector) => {
  if (
    (connector.start && connector.start.dataType) === 'event'
    || (connector.end && connector.end.dataType) === 'event'
  ) return customRenderFn1;
};
flow.renderResolver.connector = (connector) => {
  if (connector.start && connector.start.node === timerNode2) return customRenderFn2;
};

timerNode1.outputs[0].connect(randomNode.inputs[0]);
randomNode.outputs[0].connect(customNode.inputsUI[0]);
timerNode2.outputs[0].connect(customNode.inputsUI[1]);

flowConnect.render(flow);
