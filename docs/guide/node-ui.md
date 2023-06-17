# UI for Nodes

A <Ref to="/reference/api/classes/node">node</Ref> can also have interactive UI inside it, using <Ref to="/reference/api/classes/ui-node">UINodes</Ref> for showing labels, selectors, toggles, files, sliders, buttons, dials, images, and a lot more... structured in a hierarchical way.

<br/>
Creating a node

```js
let node = flow.createNode("core/empty", Vector.create(50, 50), {
  name: "Node UI",
  width: 250,
  inputs: [
    { name: "R", dataType: "r" },
    { name: "G", dataType: "g" },
    { name: "B", dataType: "b" },
  ],
  outputs: [{ name: "Image", dataType: "image" }],
  state: {
    labelText: "Label Text",
    sliderValue: 50,
    toggle: false,
    selectedValue: null,
    file: null,
    inputValue: 365,
  },
  style: { padding: 10, spacing: 10, rowHeight: 10 },
});
```

<br/>
Creating a label<br/>
<Ref to="/reference/api/classes/node#createui">Node.createUI</Ref>

```js
let label1 = node.createUI('core/label', {
  text: '',
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
  node.createUI("core/image", { style: { align: Align.Center } }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "", propName: "sliderValue", style: { grow: 0.2, precision: 2 } }),
      node.createUI("core/slider", {
        min: 0,
        max: 150,
        propName: "sliderValue",
        input: true,
        output: true,
        height: 15,
        style: { grow: 0.8, railHeight: 5 },
      }),
    ],
  }),
  node.createUI("core/button", { text: "Click Me !", input: true, output: true }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "Toggle: ", style: { grow: 0.8 } }),
      node.createUI("core/toggle", { propName: "toggle", input: true, output: true, style: { grow: 0.2 } }),
    ],
  }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "Select: ", style: { grow: 0.3 } }),
      node.createUI("core/select", {
        values: ["ABC", "DEF", "GHI", "JKL", "MNO"],
        propName: "selectedValue",
        input: true,
        output: true,
        height: 20,
        style: { grow: 0.7 },
      }),
    ],
  }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "Source: ", style: { grow: 0.5 } }),
      node.createUI("core/source", { propName: "file", input: true, output: true, height: 20, style: { grow: 0.5 } }),
    ],
  }),
  node.createUI("core/x-layout", {
    childs: [
      node.createUI("core/label", { text: "Input: ", style: { grow: 0.4 } }),
      node.createUI("core/input", {
        propName: "inputValue",
        input: true,
        output: true,
        height: 20,
        style: { type: InputType.Number, grow: 0.6, align: Align.Right },
      }),
    ],
  }),
]);
```
