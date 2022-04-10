# UI for Nodes

A <Ref to="/reference/api/classes/node">node</Ref> can also have interactive UI inside it, using <Ref to="/reference/api/classes/ui-node">UINodes</Ref> for showing labels, selectors, toggles, files, sliders, buttons, dials, images, and a lot more... structured in a hierarchical way.

<br/>
Creating a node

```js
let node = flow.createNode('Node UI', new Vector(50, 50), 250, {
  inputs: [
    { name: 'R', dataType: 'r' },
    { name: 'G', dataType: 'g' },
    { name: 'B', dataType: 'b' }
  ],
  outputs: [
    { name: 'Image', dataType: 'image' }
  ],
  state: {
    labelText: 'Label Text',
    sliderValue: 50,
    toggle: false,
    selectedValue: null,
    file: null,
    inputValue: 365
  },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
  terminalStyle: {}
});
```

<br/>
Creating a label<br/>
<Ref to="/reference/api/classes/node#createlabel">Node.createLabel</Ref>

```js
let label1 = node.createLabel('', {
    propName: 'labelText',
    input: true,
    output: true,
    style: { align: Align.Center, fontSize: '17px' }
}),

node.ui.append(label1);
```

<br/>
Creating Image, Sliders, Toggles, Buttons ...

```js
node.ui.append([
  node.createImage(null, { style: { align: Align.Center } }),
  node.createHozLayout([
    node.createLabel('', { propName: 'sliderValue', style: { grow: .2, precision: 2 } }),
    node.createSlider(0, 150, { propName: 'sliderValue', input: true, output: true, height: 15, style: { grow: .8, railHeight: 5 } })
  ]),
  node.createButton('Click Me !', { input: true, output: true }),
  node.createHozLayout([
    node.createLabel('Toggle: ', { style: { grow: .8 } }),
    node.createToggle({ propName: 'toggle', input: true, output: true, style: { grow: .2 } })
  ]),
  node.createHozLayout([
    node.createLabel('Select: ', { style: { grow: .3 } }),
    node.createSelect(['ABC', 'DEF', 'GHI', 'JKL', 'MNO'], { propName: 'selectedValue', input: true, output: true, height: 20, style: { grow: .7 } })
  ]),
  node.createHozLayout([
    node.createLabel('Source: ', { style: { grow: .5 } }),
    node.createSource({ propName: 'file', input: true, output: true, height: 20, style: { grow: .5 } })
  ]),
  node.createHozLayout([
    node.createLabel('Input: ', { style: { grow: .4 } }),
    node.createInput({
      propName: 'inputValue', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .6, align: Align.Right }
    })
  ])
]);
```

