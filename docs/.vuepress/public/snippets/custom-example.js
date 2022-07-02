import { FlowConnect } from 'flow-connect';
import { Vector } from 'flow-connect/core';
import { Timer, Random } from '@flow-connect/common';

let flowConnect = new FlowConnect(document.getElementById('canvas'));
let flow = flowConnect.createFlow({
  name: 'Custom Example',
  terminalColors: {
    event: '#ff8787',
    number: '#b7ff87',
    boolean: '#87afff',
    string: '#ff87c9',
    any: 'red'
  }
});

let timerNode1 = new Timer(flow, {
  position: new Vector(22.6, 1.2),
  state: { delay: 700 },
  style: {
    padding: 15,
    spacing: 20,
    rowHeight: 20,
    color: '#555',
    titleColor: 'green',
    titleHeight: 30,
    terminalRowHeight: 25,
    terminalStripMargin: 4,
    maximizeButtonColor: '#df87ff',
    expandButtonColor: 'blueviolet',
    minimizedTerminalColor: '#87dfff',
    nodeButtonSize: 10,
    nodeButtonSpacing: 10,
    outlineColor: '#ffa200'
  }
});
timerNode1.ui.style = {
  backgroundColor: '#6ba4ff',
  shadowColor: 'white',
  shadowBlur: 0,
  shadowOffset: Vector.Zero(),
  borderColor: '#0062ff',
  borderWidth: 8
};
let label = timerNode1.ui.query('input')[0].children[0];
label.style.backgroundColor = '#fff';
label.style.color = '#000';

let timerNode2 = new Timer(flow, {
  position: new Vector(22.6, 194.7),
  state: { delay: 600 }
});
timerNode2.ui.style = {
  backgroundColor: '#ffb561',
  shadowColor: '#999',
  shadowBlur: 10,
  shadowOffset: Vector.Zero(),
  borderColor: '#ffb561',
  borderWidth: 0,
};

let randomNode = new Random(flow, {
  position: new Vector(321.5, 6.7), state: { min: 0, max: 5 }
});
randomNode.ui.style.backgroundColor = '#f7ff99';
let labelStyle = { color: '#547053', font: 'courier' };
randomNode.ui.query('label').forEach(lbl => Object.assign(lbl.style, labelStyle));
randomNode.ui.query('input').forEach(input => input.children[0].style.backgroundColor = '#abff45');

let customNode = flow.createNode('Custom', new Vector(615.3, 79.8), 200, {
  state: { preset: 'default', renderer: 0 }
});
let select = customNode.createSelect(['default', 'dark', 'transparent', 'red', 'green'], {
  propName: 'preset',
  height: 15,
  input: true,
  style: { fontSize: '13px', grow: 1 }
});
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
    case 'default': customNode.ui.style.backgroundColor = '#ddd'; break;
    case 'dark': customNode.ui.style.backgroundColor = '#000'; break;
    case 'transparent': customNode.ui.style.backgroundColor = 'transparent'; break;
    case 'red': customNode.ui.style.backgroundColor = '#ff8080'; break;
    case 'green': customNode.ui.style.backgroundColor = '#b1ff80'; break;
    default: return;
  }
});
button.on('click', () => (customNode.state.renderer = (customNode.state.renderer + 1) % 3));
customNode.ui.style.shadowOffset = Vector.Zero();
customNode.ui.style.shadowBlur = 20;
customNode.ui.style.borderWidth = 0;

let renderer0 = (context, params) => {
  context.strokeRect(params.position.x, params.position.y, params.width, params.height);
  context.fillRect(params.position.x, params.position.y, params.width, params.height);
};
let renderer1 = (context, params) => {
  context.beginPath();
  let space = customNode.width / 9;
  let x = params.position.x;
  context.moveTo(x, params.position.y);
  context.bezierCurveTo((x += space), params.position.y - 10, (x += space), params.position.y - 10, (x += space), params.position.y);
  context.bezierCurveTo((x += space), params.position.y + 10, (x += space), params.position.y + 10, (x += space), params.position.y);
  context.bezierCurveTo((x += space), params.position.y - 10, (x += space), params.position.y - 10, (x += space), params.position.y);
  context.lineTo(x, params.position.y + params.height);
  context.lineTo(params.position.x, params.position.y + params.height);
  context.lineTo(params.position.x, params.position.y);
  context.closePath();
  context.stroke();
  context.fill();
};
let renderer2 = (context, params) => {
  context.beginPath();
  context.moveTo(params.position.x, params.position.y);
  context.lineTo(params.position.x + params.width, params.position.y);
  context.lineTo(params.position.x + params.width + 20, params.position.y + params.height / 2);
  context.lineTo(params.position.x + params.width, params.position.y + params.height);
  context.lineTo(params.position.x, params.position.y + params.height);
  context.lineTo(params.position.x - 20, params.position.y + params.height / 2);
  context.lineTo(params.position.x, params.position.y);
  context.closePath();
  context.stroke();
  context.fill();
};
let renderers = [renderer0, renderer1, renderer2];
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

let customRenderFn1 = (context, params, connector) => {
  if (!connector.offset) connector.offset = 1;
  connector.offset += 0.5;
  if (connector.offset > 16) connector.offset = 0;
  context.strokeStyle = 'green';
  context.lineWidth = 2;
  context.setLineDash([8, 8]);
  context.lineDashOffset = -connector.offset;
  context.beginPath();
  context.moveTo(params.start.x, params.start.y);
  context.lineTo(params.end.x, params.end.y);
  context.stroke();
};
let customRenderFn2 = (context, params, connector) => {
  let xDist = Math.abs(params.end.x - params.start.x);
  let points = [];
  points.push({ x: params.start.x, y: params.start.y });
  if (params.start.x > params.end.x) {
    points.push({ x: params.start.x + 20, y: params.start.y });
    points.push({ x: params.start.x + 20, y: params.start.y + (params.end.y - params.start.y) / 2, });
    points.push({ x: params.end.x - 20, y: params.end.y + (params.start.y - params.end.y) / 2, });
    points.push({ x: params.end.x - 20, y: params.end.y });
  } else {
    points.push({ x: params.start.x + xDist / 2, y: params.start.y });
    points.push({ x: params.start.x + xDist / 2, y: params.end.y });
  }
  points.push({ x: params.end.x, y: params.end.y });

  context.strokeStyle = 'black';
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  points.forEach((point) => context.lineTo(point.x, point.y));
  context.stroke();

  context.strokeStyle = 'white';
  context.lineWidth = 4;
  let dist = Vector.Distance(params.start.x, params.start.y, params.end.x, params.end.y);
  if (!connector.offset) connector.offset = 1;
  connector.offset += dist / 100;
  if (connector.offset > dist * 1.5) connector.offset = 0;
  context.setLineDash([dist / 2, dist]);
  context.lineDashOffset = -connector.offset;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  points.forEach((point) => context.lineTo(point.x, point.y));
  context.stroke();
};
flowConnect.renderResolver.connector = (connector) => {
  if (
    (connector.start && connector.start.dataType) === 'event' ||
    (connector.end && connector.end.dataType) === 'event'
  ) return customRenderFn1;
};
flow.renderResolver.connector = (connector) => {
  if (connector.start && connector.start.node === timerNode2) return customRenderFn2;
};

timerNode1.outputs[0].connect(randomNode.inputs[0]);
randomNode.outputs[0].connect(customNode.inputsUI[0]);
timerNode2.outputs[0].connect(customNode.inputsUI[1]);

flowConnect.render(flow);
