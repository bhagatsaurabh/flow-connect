let flow = flowConnect.createFlow({ name: 'Test' });

Group.renderResolver = () => {
  return (context, params, _group) => {
    context.strokeStyle = '#000';
    context.setLineDash([4, 2]);
    context.strokeRect(params.position.x, params.position.y, params.width, params.height);
  };
}
let testNode1 = new StandardNodes.Common.NumberSource(flow);
let testNode2 = new StandardNodes.Common.Log(flow);

testNode1.outputs[0].connect(testNode2.inputs[1]);
