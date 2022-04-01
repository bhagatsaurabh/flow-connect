let flow = flowConnect.createFlow({ name: 'Test' });

flow.renderResolver.group = () => {
  return (context, params, _group) => {
    context.strokeStyle = '#000';
    context.setLineDash([4, 2]);
    context.strokeRect(params.position.x, params.position.y, params.width, params.height);
  };
}
let testNode1 = new StandardNodes.Common.NumberSource(flow);
let testNode2 = new StandardNodes.Common.Log(flow);

let node = flow.createNode('Node', new Vector(50, 50), 230, {
  state: { vSliderValue: -22}
});
let stack = node.createStack({ childs: [
  node.createVSlider(-50, 50, { height: 150, propName: 'vSliderValue'}),
  node.createLabel(node.state.vSliderValue, { propName: 'vSliderValue', style: { align: Align.Center, fontSize: '16px' } })
], style: { spacing: 20 } });
node.ui.append(stack);


testNode1.outputs[0].connect(testNode2.inputs[1]);
