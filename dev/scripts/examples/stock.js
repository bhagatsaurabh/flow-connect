let flow = flowConnect.createFlow({
    name: 'Stock Flow',
    rules: { 'array': ['array', 'any'] },
    terminalTypeColors: {
        'number': '#7aff66',
        'string': '#ffe366',
        'array': '#66e6ff',
        'any': '#6675ff',
        'event': '#ffb066',
    }
});

let timer = StandardNodes.Timer(flow, { props: { delay: 1000 } });
let api = StandardNodes.API(flow, { props: { src: 'https://public.polygon.io/v2/market/now' } });
let log = StandardNodes.Log(flow);
let extract = flow.createNode('Data Extract', new Vector2(50, 50), 100, [{ name: 'data', dataType: 'any' }],
    [{ name: 'BTC', dataType: 'number' }, { name: 'ETH', dataType: 'number' }, { name: 'LTC', dataType: 'number' }]
);
extract.on('process', (_, inputs) => {
    if (!inputs[0]) return;
    extract.setOutputs({
        'BTC': inputs[0].crypto['X:BTCUSD'].lastTrade.p,
        'ETH': inputs[0].crypto['X:ETHUSD'].lastTrade.p,
        'LTC': inputs[0].crypto['X:LTCUSD'].lastTrade.p
    });
});
let btcBuffer = StandardNodes.Buffer(flow, { props: { size: 30 } });
let ethBuffer = StandardNodes.Buffer(flow, { props: { size: 30 } });
let ltcBuffer = StandardNodes.Buffer(flow, { props: { size: 30 } });
let btcNormalize = StandardNodes.Normalize(flow, { props: { relative: true, constant: 5 } }, 'array');
let ethNormalize = StandardNodes.Normalize(flow, { props: { relative: true, constant: 5 } }, 'array');
let ltcNormalize = StandardNodes.Normalize(flow, { props: { relative: true, constant: 5 } }, 'array');
let btcEthToArray = StandardNodes.ToArray(flow, {}, 2);
let btcLtcToArray = StandardNodes.ToArray(flow, {}, 2);
let btcEthLtcToArray = StandardNodes.ToArray(flow, {}, 3);

let btcEthChart = StandardNodes.LineChartMini(
    flow, { name: 'BTC : ETH', width: 250 },
    100, ['#ff6666', '#66d4ff'], { backgroundColor: '#7a7a7a' }
);
let btcLtcChart = StandardNodes.LineChartMini(
    flow, { name: 'BTC : LTC', width: 250 },
    100, ['#ffb066', '#668fff'], { backgroundColor: '#7a7a7a' }
);
let btcEthLtcChart = StandardNodes.LineChartMini(
    flow, { name: 'BTC : ETH : LTC', width: 250 },
    100, ['#ff66ad', '#669eff', '#66ffe3'], { backgroundColor: '#7a7a7a' }
);

timer.outputs[0].connect(api.inputs[0]);
api.outputs[0].connect(extract.inputs[0]);
extract.outputs[0].connect(btcBuffer.inputs[0]);
extract.outputs[1].connect(ethBuffer.inputs[0]);
extract.outputs[2].connect(ltcBuffer.inputs[0]);
//log.ui.query('button')[1].call('click');
log.ui.children[0].children[1].call('click');
log.ui.children[0].children[1].call('click');
btcBuffer.outputs[0].connect(btcNormalize.inputs[0]);
ethBuffer.outputs[0].connect(ethNormalize.inputs[0]);
ltcBuffer.outputs[0].connect(ltcNormalize.inputs[0]);
btcNormalize.outputs[0].connect(btcEthToArray.inputs[0]);
ethNormalize.outputs[0].connect(btcEthToArray.inputs[1]);
// btcEthToArray.outputs[0].connect(log.inputs[1]);
btcNormalize.outputs[0].connect(btcLtcToArray.inputs[0]);
ltcNormalize.outputs[0].connect(btcLtcToArray.inputs[1]);
// btcLtcToArray.outputs[0].connect(log.inputs[2]);
btcNormalize.outputs[0].connect(btcEthLtcToArray.inputs[0]);
ethNormalize.outputs[0].connect(btcEthLtcToArray.inputs[1]);
ltcNormalize.outputs[0].connect(btcEthLtcToArray.inputs[2]);
// btcEthLtcToArray.outputs[0].connect(log.inputs[3]);

btcBuffer.outputsUI[0].connect(btcEthChart.inputsUI[0]);
btcBuffer.outputsUI[0].connect(btcLtcChart.inputsUI[0]);
btcBuffer.outputsUI[0].connect(btcEthLtcChart.inputsUI[0]);

btcEthToArray.outputs[0].connect(btcEthChart.inputs[0]);
btcLtcToArray.outputs[0].connect(btcLtcChart.inputs[0]);
btcEthLtcToArray.outputs[0].connect(btcEthLtcChart.inputs[0]);