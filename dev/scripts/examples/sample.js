let flow1 = flowConnect.createFlow({
    name: 'Test Flow',
    rules: {
        'r': ['r', 'g', 'b'],
        'g': ['r', 'g', 'b'],
        'b': ['r', 'g', 'b'],
        'image': ['image']
    },
    terminalTypeColors: {
        'r': '#ff0000',
        'g': '#00ff00',
        'b': '#0000ff',
        'image': 'grey'
    }
});

let node = flow1.createNode(
    'Channel Merger',
    new Vector2(50, 50),
    flowConnect.canvasDimensions.width * .4,
    [{ name: 'R', dataType: 'r' }, { name: 'G', dataType: 'g' }, { name: 'B', dataType: 'b' }],
    [{ name: 'Image', dataType: 'image' }],
    { padding: 10, spacing: 10, rowHeight: 10 },
    {},
    { labelText: 'Label Text', sliderValue: 50, toggle: false, selectedValue: null, file: null, inputValue: 365 }
);

node.ui.append(node.createLabel(null, 'labelText', true, true, { align: 'center', fontSize: '17px' }));
node.ui.append(node.createImage(null, null, { align: 'center' }));

let sliderValue = node.createLabel(57, null, false, false, { grow: .2 });
let slider = node.createSlider(0, 150, 57, 0, 'sliderValue', true, true, 15, { grow: .8, railHeight: 5 });
slider.on('change', (slider, value) => sliderValue.text = value);
node.ui.append(node.createHozLayout([sliderValue, slider]));

let button = node.createButton('Click Me !', true, true);
button.on('click', () => console.log('click'));
node.ui.append(button);

let toggleLabel = node.createLabel('Toggle: ', null, false, false, { grow: .8 });
let toggle = node.createToggle('toggle', true, true, null, { grow: .2 });
toggle.on('change', (toggle, state) => console.log(state));
node.ui.append(node.createHozLayout([toggleLabel, toggle]));

let selectLabel = node.createLabel('Select: ', null, false, false, { grow: .3 });
let select = node.createSelect(['ABC', 'DEF', 'GHI', 'JKL', 'MNO'], 'selectedValue', true, true, 20, { grow: .7 });
select.on('change', (select, value) => console.log(value));
node.ui.append(node.createHozLayout([selectLabel, select]));

let sourceLabel = node.createLabel('Source: ', null, false, false, { grow: .5 });
let source = node.createSource(null, 'file', true, true, 20, { grow: .5 });
source.on('change', (source, value) => console.log(value));
node.ui.append(node.createHozLayout([sourceLabel, source]));

let inputLabel = node.createLabel('Input: ', null, false, false, { grow: .4 });
let input = node.createInput(45, 'inputValue', true, true, 20, { type: InputType.Number, grow: .6, align: 'right' });
node.ui.append(node.createHozLayout([inputLabel, input]));

let numberNode = flow1.createNode(
    'Number Source',
    new Vector2(50, 50),
    flowConnect.canvasDimensions.width * .25,
    [],
    [],
    { padding: 10, spacing: 10, rowHeight: 10 },
    {},
    { value: 15 }
);
numberNode.ui.append(numberNode.createInput(45, 'value', true, true, 20, { type: InputType.Number, grow: .6, align: 'right' }));

let textNode = flow1.createNode(
    'Text Source',
    new Vector2(50, 120),
    flowConnect.canvasDimensions.width * .25,
    [],
    [],
    { padding: 10, spacing: 10, rowHeight: 10 },
    {},
    { value: 'Example Text' }
);
textNode.ui.append(textNode.createInput('', 'value', true, true, 20, { type: InputType.Text, grow: .6, align: 'right' }));

let toggleNode = flow1.createNode(
    'Toggle Source',
    new Vector2(50, 190),
    flowConnect.canvasDimensions.width * .25,
    [],
    [],
    { padding: 10, spacing: 10, rowHeight: 10 },
    {},
    { value: true }
);
toggleNode.ui.append(toggleNode.createToggle('value', true, true, null, { grow: .2 }));

let timerNode = flow1.createNode(
    'Timer',
    new Vector2(100, 100), 100, [],
    [{ name: 'timer', dataType: 'event' }],
    { padding: 10, spacing: 10, rowHeight: 10 },
    {}, { delay: 1000 }
);
timerNode.ui.append(timerNode.createInput(1000, 'delay', false, false, 20, { type: InputType.Number }));
timerNode.lastTrigger = Number.MIN_VALUE;
flowConnect.on('tickreset', () => {
    timerNode.lastTrigger = Number.MIN_VALUE;
});
flowConnect.on('tick', () => {
    let current = flowConnect.time;
    if (current - timerNode.lastTrigger >= timerNode.props.delay) {
        timerNode.outputs[0].emit();
        timerNode.lastTrigger = current;
    }
});

node.on('process', () => console.log('Channel Merger'));
numberNode.on('process', () => console.log('Number Source'));
textNode.on('process', () => console.log('Text Source'));
toggleNode.on('process', () => console.log('Toggle Source'));

let flow2 = flowConnect.createFlow({ name: 'Test Flow 2', rules: {}, terminalTypeColors: {} });

let inputNode = flow2.addInput('Input 1', 'number', new Vector2(100, 100));
let outputNode = flow2.addOutput('Output 1', 'string', new Vector2(200, 200));
let convertNode = flow2.createNode(
    'Converter',
    new Vector2(50, 50),
    flowConnect.canvasDimensions.width * .4,
    [{ name: 'Number', dataType: 'number' }],
    [{ name: 'Text', dataType: 'string' }],
    {}, {}, {}
);

convertNode.on('process', (node, inputs) => {
    console.log('Convert Node');
    node.setOutput('Text', inputs[0] ? inputs[0].toString() : 'Error');
});

let subFlowNode = flow1.addSubFlow(flow2, new Vector2(200, 200));
subFlowNode.on('process', () => console.log('SubflowNode'));

flowConnect.render(flow1);