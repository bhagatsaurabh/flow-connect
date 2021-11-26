let flow = flowConnect.createFlow({
    name: 'Stock Flow',
    rules: { 'array': ['array', 'any'] },
    terminalTypeColors: {}
});

let timer = StandardNodes.Timer(flow);
let api = StandardNodes.API(flow, { props: { src: 'https://public.polygon.io/v2/market/now' } });
let log = StandardNodes.Log(flow);

timer.outputs[0].connect(api.inputs[0]);
api.outputs[0].connect(log.inputs[0]);