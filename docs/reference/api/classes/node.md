# Class: Node

A Node is a singular processing unit in a <Ref to="./flow">Flow</Ref> accepting inputs through input <Ref to="./terminal">terminals</Ref> and producing output through output terminals for other connected nodes/flows.

<img class="zoomable" alt="Node example" src="/images/node-example.png" />

A node can also have interactive UI inside it, using <Ref to="./ui-node">UINodes</Ref> for showing labels, selectors, toggles, files, sliders, buttons, dials, images, and a lot more.

## Hierarchy

<Hierarchy
  :extend="{name: 'Hooks', link: './hooks'}"
  :implement="[
    {name: 'Events', link: '../interfaces/events.html'},
    {name: 'Serializable', link: '../interfaces/serializable.html'},
    {name: 'Renderable', link: '../interfaces/renderable.html'}
  ]"
/>

## Overview

<Overview :data="data" />

## Constructor

<Method type="constructor">
  <template v-slot:signature>
    new Node(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>name: </strong><em>string</em>,
    <strong>position: </strong><em><Ref to="./vector">Vector</Ref></em>,
    <strong>width: </strong><em>number</em>,
    <strong>inputs: </strong><em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref>[]</em>,
    <strong>outputs: </strong><em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref>[]</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/node-constructor-options">NodeConstructorOptions</Ref></em>):
    <em><Ref to="#class-node">Node</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="name">
      <em>string</em>
    </Param>
    <Param name="position">
      <em><Ref to="./vector">Vector</Ref></em>
    </Param>
    <Param name="width">
      <em>number</em>
    </Param>
    <Param name="inputs">
      <em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref>[]</em>
    </Param>
    <Param name="outputs">
      <em><Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref>[]</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/node-constructor-options">NodeConstructorOptions</Ref></em>
  <template v-slot:default-value>

  ```js
  {
    style: {},
    terminalStyle: {},
    state: {},
    id: getNewUUID() // dynamic
  }
  ```
  </template>
    </Param>
  </template>
</Method>

## Properties

### flow

<Property type="property" name="flow">
  <template v-slot:type>
    <em><Ref to="./flow">Flow</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the <Ref to="./flow">Flow</Ref> in which this node exists.
  </template>
</Property>

### focused

<Property type="property" name="focused">
  <template v-slot:type>
    <em>boolean</em>
  </template>
  <template v-slot:desc>
    Node's current focused state.
    <img class="zoomable" alt="Focused node" src="/images/focused-node-example.png" />
  </template>
</Property>

### group

<Property type="property" name="group">
  <template v-slot:type>
    <em><Ref to="./group">Group</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the <Ref to="./group">Group</Ref> if this node is grouped with other nodes.
  </template>
</Property>

### id

<Property type="property" name="id">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    A unique identifier.
  </template>
</Property>

### inputs

<Property type="property" name="inputs">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the input terminals of the node.
  </template>
</Property>

### inputsUI

<Property type="property" name="inputsUI">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the input terminals of node that are bound to one of the <Ref to="./ui-node">UINodes</Ref>.<br/>
    For e.g. A Label can have it's own input/output terminal.
    <img class="zoomable" alt="Label inside node with input and output terminals" src="/images/label-terminals.png" />
  </template>
</Property>

### name

<Property type="property" name="name">
  <template v-slot:type>
    <em>string</em>
  </template>
  <template v-slot:desc>
    Display name of the node.
  </template>
</Property>

### nodeButtons

<Property type="property" name="nodeButtons">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./node-button">NodeButton</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Collection of all the <Ref to="./node-button">node-buttons</Ref> displayed besides the node's <Ref to="#name">name</Ref>.<br/>
    <img class="zoomable" alt="Node-button example" src="/images/node-button-example.png" />
  </template>
</Property>

### outputs

<Property type="property" name="outputs">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the output terminals of the node.
  </template>
</Property>

### outputsUI

<Property type="property" name="outputsUI">
  <template v-slot:type>
    <em><Ref to="./terminal">Terminal</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to all the output terminals of node that are bound to one of the <Ref to="./ui-node">UINodes</Ref>.<br/>
    For e.g. A Label can have it's own input/output terminal.
    <img class="zoomable" alt="Label inside node with input and output terminals" src="/images/label-terminals.png" />
  </template>
</Property>

### renderResolver

<Property type="property" name="renderResolver">
  <template v-slot:type>
    {<br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>node?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="#class-node">Node</Ref>,
        <Ref to="../interfaces/node-renderparams">NodeRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>nodeButton?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="./node-button">NodeButton</Ref>,
        <Ref to="../interfaces/node-button-renderparams">NodeButtonRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>terminal?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="./terminal">Terminal</Ref>,
        <Ref to="../interfaces/terminal-renderparams">TerminalRenderParams</Ref>&gt;
      </span><br/>
      <span class="ml-1">
        <Optional class="mr-0p5" /><strong>uiContainer?: </strong>
        <Ref to="../interfaces/render-resolver">RenderResolver</Ref
        >&lt;<Ref to="../nodeui/container">Container</Ref>,
        <Ref to="../interfaces/container-renderparams">ContainerRenderParams</Ref>&gt;
      </span>
    <br/>}
  </template>
  <template v-slot:desc>
  A <Ref to="../interfaces/render-resolver">RenderResolver</Ref> which is scoped to the Node instance.

  Any custom render functions specified using this resolver will only affect everything inside this node instance.
  </template>
  <template v-slot:default>{}</template>
</Property>

### renderState

<Property type="property" name="renderState">
  <template v-slot:type>
    <Ref to="../interfaces/render-state">RenderState</Ref>
  </template>
  <template v-slot:desc>
    The RenderState of a node is a collection of various states corresponding to Viewport visibility, maximized/minimized state and level-of-detail to show when zooming in/out. 
  </template>
  <template v-slot:default>
    <pre>
{
  viewport: <Ref to="../enums/viewport">ViewPort</Ref>.INSIDE,
  nodeState: <Ref to="../enums/node-state">NodeState</Ref>.MAXIMIZED,
  lod: <Ref to="../enums/lod">LOD</Ref>.LOD2
}</pre>
  </template>
</Property>

### state

<Property type="property" name="state">
  <template v-slot:type>
    <em><Ref to="../interfaces/record">Record</Ref>&lt;string, any&gt;</em>
  </template>
  <template v-slot:desc>
    A local reactive state of the node, properties defined within this state is two-way bindable with any <Ref to="./ui-node">UINode</Ref>.

  ```js
  let customNode = flow.createNode(
    "Custom Node",
    new Vector(50, 50), 170,
    {
      state: {
        name: "John Doe",
        age: 24
      }
    }
  );
  ```
  </template>
</Property>

### style

<Property type="property" name="style">
  <template v-slot:type>
    <em><Ref to="../interfaces/node-style">NodeStyle</Ref></em>
  </template>
  <template v-slot:default>

  ```js
  {
    font: 'arial',
    fontSize: '.75rem',
    titleFont: 'arial',
    titleFontSize: '.85rem',
    color: '#000',
    titleColor: '#000',
    maximizeButtonColor: 'darkgrey',
    nodeButtonSize: 10,
    nodeButtonSpacing: 5,
    expandButtonColor: '#000',
    minimizedTerminalColor: 'green',
    outlineColor: '#000',
    padding: 10,
    spacing: 10,
    rowHeight: 20,
    titleHeight: 29,
    terminalRowHeight: 24,
    terminalStripMargin: 8
  }
  ```
  </template>
</Property>

### terminalStyle

<Property type="property" name="terminalStyle">
  <template v-slot:type>
    <em><Ref to="../interfaces/terminal-style">TerminalStyle</Ref></em>
  </template>
</Property>

### terminals

<Property type="property" name="terminals">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./terminal">Terminal</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Reference to all the terminals (inputs/outputs) of the node mapped to their id's.
  </template>
</Property>

### ui

<Property type="property" name="ui">
  <template v-slot:type>
    <em><Ref to="../nodeui/container">Container</Ref></em>
  </template>
  <template v-slot:desc>
    Reference to the UI Container which is also the root <Ref to="./ui-node">UINode</Ref>.
  </template>
</Property>

### uiNodes

<Property type="property" name="uiNodes">
  <template v-slot:type>
    <em>Map&lt;string, <Ref to="./ui-node">UINode</Ref>&gt;</em>
  </template>
  <template v-slot:desc>
    Reference to all the UINodes.
  </template>
</Property>

## Accessors

### height

<Property type="accessor" name="height">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

### position

<Property type="accessor" name="position">
  <template v-slot:type>
    <em><Ref to="./vector">Vector</Ref></em>
  </template>
</Property>

### width

<Property type="accessor" name="width">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

### zIndex

<Property type="accessor" name="zIndex">
  <template v-slot:type>
    <em>number</em>
  </template>
</Property>

## Methods

### addNodeButton

<Method type="method">
  <template v-slot:signature>
    addNodeButton(<strong>callback: </strong><em>() => void</em>,
    <strong>render: </strong><em><Ref to="../interfaces/render-function">RenderFunction</Ref>&lt;<Ref to="./node-button">NodeButton</Ref>, <Ref to="../interfaces/node-button-render-params">NodeButtonRenderParams</Ref>&gt;</em>,
    <strong>align: </strong><em><Ref to="../enums/align">Align</Ref></em>):
    <em><Ref to="./node-button">NodeButton</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="callback"><em>() => void</em></Param>
    <Param name="render">
      <em><Ref to="../interfaces/render-function">RenderFunction</Ref>&lt;<Ref to="./node-button">NodeButton</Ref>, <Ref to="../interfaces/node-button-render-params">NodeButtonRenderParams</Ref>&gt;</em>
    </Param>
    <Param name="align"><em><Ref to="../enums/align">Align</Ref></em></Param>
  </template>
  <template v-slot:example>

  ```js
  node.addNodeButton(
    () => doSomething(),
    (
      context: CanvasRenderingContext2D,
      params: NodeButtonRenderParams,
      nodeButton: NodeButton
    ) => {
      let style = nodeButton.node.style;

      context.strokeStyle = style.color;
      context.beginPath();
      context.arc(params.position.x, params.position.y, 10, 0, 2 * Math.PI);
      context.closePath();

      context.stroke();
    },
    Align.Right
  );
  ```
  </template>
</Method>

### addTerminal

<Method type="method">
  <template v-slot:signature>
    addTerminal(<strong>terminal: </strong><em><Ref to="./terminal">Terminal</Ref> | <Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref></em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="terminal">
      <em><Ref to="./terminal">Terminal</Ref> | <Ref to="../interfaces/serialized-terminal">SerializedTerminal</Ref></em>
    </Param>
  </template>
  <template v-slot:example>

  ```js
  node.addTerminal(
    new Terminal(
      node,
      TerminalType.IN,
      "string",
      "first-name"
    )
  );
  ```
  </template>
</Method>

### call

<Method type="method-inherited">
  <template v-slot:signature>
    call(<strong>eventKey: </strong><em>string</em>, <strong>...args: </strong><em>any</em>):
    <em>void</em>
  </template>
  <template v-slot:inherit>
    <Icon type="inherited" />from <Ref to="./hooks">Hooks</Ref>.<Ref to="./hooks#call">call</Ref>
  </template>
</Method>

### createButton

<Method type="method">
  <template v-slot:signature>
    createButton(<strong>text: </strong><em>string</em>, <strong>options?: </strong><em><Ref to="../interfaces/button-creator-options">ButtonCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/button">Button</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="text">
      <em>string</em><br/>
      Text to display on button.
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/button-creator-options">ButtonCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a new button.
  </template>
  <template v-slot:example>

  ```js
  let button = node.createButton('Click me');
  node.ui.append(button);
  ```
  <img class="zoomable" alt="Node UI Button example" src="/images/node-ui-button-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/button">Button</Ref></em>
  </template>
</Method>

### createDial

<Method type="method">
  <template v-slot:signature>
    createDial(<strong>min: </strong><em>number</em>,
    <strong>max: </strong><em>number</em>,
    <strong>size: </strong><em>number</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/dial-creator-options">DialCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/dial">Dial</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="min">
      <em>number</em>
    </Param>
    <Param name="max">
      <em>number</em>
    </Param>
    <Param name="size">
      <em>number</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/dial-creator-options">DialCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a new radial dial.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 150, {
    state: { dialValue: 65 }
  });

  let dial = node.createDial(0, 100, 100, { propName: 'dialValue'});
  let label = node.createLabel(
    node.state.dialValue, {
      propName: 'dialValue',
      style: { align: Align.Center, fontSize: '14px', precision: 0 }
    }
  );

  node.ui.append([dial, label]);
  ```
  <img class="zoomable" alt="Node UI Dial example" src="/images/node-ui-dial-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/dial">Dial</Ref></em>
  </template>
</Method>

### createDisplay

<Method type="method">
  <template v-slot:signature>
    createDisplay(<strong>height: </strong><em>number</em>,
    <strong>renderers: </strong><em><Ref to="../interfaces/custom-renderer-config">CustomRendererConfig</Ref>[]</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/display-creator-options">DisplayCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/display">Display</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="height">
      <em>number</em>
    </Param>
    <Param name="renderers">
      <em><Ref to="../interfaces/custom-renderer-config">CustomRendererConfig</Ref>[]</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/display-creator-options">DisplayCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a new fully-customized rendering display.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230);

  let display = node.createDisplay(150, [{
    auto: true,
    clear: true,
    renderer: (context, width, height) => {
      for (let i = 0 ; i < 100 ; i++) {
        context.fillStyle = Color.Random().hexValue;
        context.fillRect(Math.random() * width, Math.random() * height, 5, 5);
      }
      return true;
    }
  }]);

  node.ui.append(display);
  ```
  <img class="zoomable" alt="Node UI Display example" src="/images/node-ui-display-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/display">Display</Ref></em>
  </template>
</Method>

### createEnvelope

<Method type="method">
  <template v-slot:signature>
    createEnvelope(<strong>height: </strong><em>number</em>,
    <strong>values?: </strong><em><Ref to="./vector">Vector</Ref>[]</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/envelope-creator-options">EnvelopeCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/envelope">Envelope</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="height">
      <em>number</em>
    </Param>
    <Param name="values?">
      <em><Ref to="./vector">Vector</Ref>[]</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/envelope-creator-options">EnvelopeCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates an interactive linear envelope.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230);

  let envelope = node.createEnvelope(150, [
    new Vector(.1, .1),
    new Vector(.3, .8),
    new Vector(.75, .3),
    new Vector(.9, .7)
  ]);

  node.ui.append(envelope);
  ```
  <img class="zoomable" alt="Node UI Envelope example" src="/images/node-ui-envelope-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/envelope">Envelope</Ref></em>
  </template>
</Method>

### createHozLayout

<Method type="method">
  <template v-slot:signature>
    createHozLayout(<strong>childs?: </strong><em><Ref to="./ui-node">UINode</Ref>[]</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/horizontal-layout-creator-options">HorizontalLayoutCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/horizontal-layout">HorizontalLayout</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="childs?">
      <em><Ref to="./ui-node">UINode</Ref>[]</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/horizontal-layout-creator-options">HorizontalLayoutCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a horizontal layout.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230);

  let hozLayout = node.createHozLayout([
    node.createLabel('W: 0.2', {
      style: { grow: .2, backgroundColor: '#0f0', align: Align.Center }
    }),
    node.createLabel('W: 0.5', {
      style: { grow: .5, backgroundColor: '#e0e', align: Align.Center }
    }),
    node.createLabel('W: 0.3', {
      style: { grow: .3, backgroundColor: '#0ff', align: Align.Center }
    }),
  ]);

  node.ui.append(hozLayout);
  ```
  <img class="zoomable" alt="Node UI Horizontal Layout example" src="/images/node-ui-hoz-layout-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/horizontal-layout">HorizontalLayout</Ref></em>
  </template>
</Method>

### createImage

<Method type="method">
  <template v-slot:signature>
    createImage(<strong>source: </strong><em>string</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/image-creator-options">ImageCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/image">Image</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="source">
      <em>string</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/image-creator-options">ImageCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates an Image.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230);
  let image = node.createImage('/assets/hero.png', {
    style: { align: Align.Center }
  });
  node.ui.append(image);
  ```
  <img class="zoomable" alt="Node UI Image example" src="/images/node-ui-image-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/image">Image</Ref></em>
  </template>
</Method>

### createInput

<Method type="method">
  <template v-slot:signature>
    createInput(<strong>options?: </strong><em><Ref to="../interfaces/input-creator-options">InputCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/input">Input</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="options?">
      <em><Ref to="../interfaces/input-creator-options">InputCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a text input.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230);
  let input = node.createInput({ value: 'Sample Text'});
  node.ui.append(input);
  ```
  <img class="zoomable" alt="Node UI Input example" src="/images/node-ui-input-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/input">Input</Ref></em>
  </template>
</Method>

### createLabel

<Method type="method">
  <template v-slot:signature>
    createLabel(<strong>text: </strong><em>string | number</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/label-creator-options">LabelCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/label">Label</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="text">
      <em>string | number</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/label-creator-options">LabelCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a label.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230);
  let label = node.createLabel('Sample Label');
  node.ui.append(label);
  ```
  <img class="zoomable" alt="Node UI Label example" src="/images/node-ui-label-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/label">Label</Ref></em>
  </template>
</Method>

### createRadioGroup

<Method type="method">
  <template v-slot:signature>
    createRadioGroup(<strong>values?: </strong><em>string[]</em>,
    <strong>selected?: </strong><em>string</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/radio-group-creator-options">RadioGroupCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/radio-group">RadioGroup</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="values?">
      <em>string[]</em>
    </Param>
    <Param name="selected?">
      <em>string</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/radio-group-creator-options">RadioGroupCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a radio-group.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230);
  let radioGroup = node.createRadioGroup(
    ['Sample A', 'Sample B', 'Sample C'],
    'Sample B'
  );
  node.ui.append(radioGroup);
  ```
  <img class="zoomable" alt="Node UI Radio-group example" src="/images/node-ui-radio-group-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/radio-group">RadioGroup</Ref></em>
  </template>
</Method>

### createSelect

<Method type="method">
  <template v-slot:signature>
    createSelect(<strong>values?: </strong><em>string[]</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/select-creator-options">SelectCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/select">Select</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="values?">
      <em>string[]</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/select-creator-options">SelectCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a select.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230, {
    style: { rowHeight: 10}
  });
  let select = node.createSelect(['Sample A', 'Sample B', 'Sample C']);
  node.ui.append(select);
  ```
  <img class="zoomable" alt="Node UI Select example" src="/images/node-ui-select-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/select">Select</Ref></em>
  </template>
</Method>

### createSlider

<Method type="method">
  <template v-slot:signature>
    createSlider(<strong>min: </strong><em>number</em>,
    <strong>max: </strong><em>number</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/slider-creator-options">SliderCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/slider">Slider</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="min">
      <em>number</em>
    </Param>
    <Param name="max">
      <em>number</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/slider-creator-options">SliderCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a Horizontal Slider.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230, {
    style: { rowHeight: 10 },
    state: { sliderValue: -18 }
  });
  let hozLayout = node.createHozLayout([
    node.createSlider(-100, 100, {
      propName: 'sliderValue',
      style: { grow: .8 }
    }),
    node.createLabel(node.state.sliderValue, {
      propName: 'sliderValue',
      style: { grow: .2, align: Align.Center, precision: 0 }
    })
  ]);
  node.ui.append(hozLayout);
  ```
  <img class="zoomable" alt="Node UI Horizontal Slider example" src="/images/node-ui-h-slider-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/slider">Slider</Ref></em>
  </template>
</Method>

### createSlider2D

<Method type="method">
  <template v-slot:signature>
    createSlider2D(<strong>options?: </strong><em><Ref to="../interfaces/slider2d-creator-options">Slider2DCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/slider2d">Slider2D</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="options?">
      <em><Ref to="../interfaces/slider2d-creator-options">Slider2DCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates an XY 2D Slider.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230, {
    style: { rowHeight: 10 },
  });
  let slider2D = node.createSlider2D({
    height: 100,
    value: new Vector(.2, .8)
  });
  node.ui.append(slider2D);
  ```
  <img class="zoomable" alt="Node UI 2D Slider example" src="/images/node-ui-2d-slider-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/slider2d">Slider2D</Ref></em>
  </template>
</Method>

### createSource

<Method type="method">
  <template v-slot:signature>
    createSource(<strong>options?: </strong><em><Ref to="../interfaces/source-creator-options">SourceCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/source">Source</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="options?">
      <em><Ref to="../interfaces/source-creator-options">SourceCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a file input.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230, {
    style: { rowHeight: 20 },
  });
  let source = node.createSource();
  node.ui.append(source);
  ```
  <img class="zoomable" alt="Node UI Source example" src="/images/node-ui-source-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/source">Source</Ref></em>
  </template>
</Method>

### createStack

<Method type="method">
  <template v-slot:signature>
    createStack(<strong>options?: </strong><em><Ref to="../interfaces/stack-creator-options">StackCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/source">Source</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="options?">
      <em><Ref to="../interfaces/stack-creator-options">StackCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a vertical layout.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230);
  let stack = node.createStack({
    childs: [
      node.createLabel('A', {
        height: 20,
        style: { backgroundColor: '#0f0', align: Align.Center }
      }),
      node.createLabel('B', {
        height: 60,
        style: { backgroundColor: '#e0e', align: Align.Center }
      }),
      node.createLabel('C', {
        height: 30,
        style: { backgroundColor: '#0ff', align: Align.Center }
      })
    ],
    spacing: 5
  });
  node.ui.append(stack);
  ```
  <img class="zoomable" alt="Node UI Stack example" src="/images/node-ui-stack-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/stack">Stack</Ref></em>
  </template>
</Method>

### createToggle

<Method type="method">
  <template v-slot:signature>
    createToggle(<strong>options?: </strong><em><Ref to="../interfaces/toggle-creator-options">ToggleCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/toggle">Toggle</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="options?">
      <em><Ref to="../interfaces/toggle-creator-options">ToggleCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a Toggle.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230, {
    style: { rowHeight: 10 }
  });
  let toggle = node.createToggle();
  node.ui.append(toggle);
  ```
  <img class="zoomable" alt="Node UI Toggle example" src="/images/node-ui-toggle-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/toggle">Toggle</Ref></em>
  </template>
</Method>

### createVSlider

<Method type="method">
  <template v-slot:signature>
    createVSlider(<strong>min: </strong><em>number</em>,
    <strong>max: </strong><em>number</em>,
    <strong>options?: </strong><em><Ref to="../interfaces/v-slider-creator-options">VSliderCreatorOptions</Ref></em>):
    <em><Ref to="../nodeui/v-slider">VSlider</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="min">
      <em>number</em>
    </Param>
    <Param name="max">
      <em>number</em>
    </Param>
    <Param name="options?">
      <em><Ref to="../interfaces/v-slider-creator-options">VSliderCreatorOptions</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Creates a Vertical Slider.
  </template>
  <template v-slot:example>

  ```js
  let node = flow.createNode('Node', new Vector(50, 50), 230, {
    state: { vSliderValue: -22}
  });
  let stack = node.createStack({ childs: [
    node.createVSlider(-50, 50, {
      height: 150,
      propName: 'vSliderValue'
    }),
    node.createLabel(node.state.vSliderValue, {
      propName: 'vSliderValue',
      style: { align: Align.Center, fontSize: '16px' }
    })
  ], style: { spacing: 20 } });
  node.ui.append(stack);
  ```
  <img class="zoomable" alt="Node UI VSlider example" src="/images/node-ui-v-slider-example.png" />
  </template>
  <template v-slot:return>
    <em><Ref to="../nodeui/v-slider">VSlider</Ref></em>
  </template>
</Method>

### dispose

<Method type="method">
  <template v-slot:signature>
    dispose():
    <em>void</em>
  </template>
  <template v-slot:desc>
    Remove node from the <Ref to="./flow">Flow</Ref>.
  </template>
</Method>

### getInput

<Method type="method">
  <template v-slot:signature>
    getInput(<strong>terminal: </strong><em>string | number</em>):
    <em>any</em>
  </template>
  <template v-slot:desc>
    Get input data from the terminal's name or its index.
  </template>
</Method>

### getInputs

<Method type="method">
  <template v-slot:signature>
    getInputs():
    <em>any[]</em>
  </template>
  <template v-slot:desc>
    Get an array of all the inputs to the node.
  </template>
</Method>

### off

<Method type="method-inherited">
  <template v-slot:signature>
    off(<strong>eventKey: </strong><em>string</em>, <strong>id: </strong><em>number</em>):
    <em>void</em>
  </template>
  <template v-slot:inherit>
    <Icon type="inherited" />from <Ref to="./hooks">Hooks</Ref>.<Ref to="./hooks#off">off</Ref>
  </template>
</Method>

### offAll

<Method type="method-inherited">
  <template v-slot:signature>
    offAll():
    <em>void</em>
  </template>
  <template v-slot:inherit>
    <Icon type="inherited" />from <Ref to="./hooks">Hooks</Ref>.<Ref to="./hooks#offall">offAll</Ref>
  </template>
</Method>

### on

<Method type="method-inherited">
  <template v-slot:signature>
    on(<strong>eventKey: </strong><em>string</em>, <strong>callback: </strong><em>(...args: any) => void</em>):
    <em>number</em>
  </template>
  <template v-slot:inherit>
    <Icon type="inherited" />from <Ref to="./hooks">Hooks</Ref>.<Ref to="./hooks#on">on</Ref>
  </template>
  <template v-slot:desc>
    <br/>
    See <Ref to="#events">Events</Ref>.
  </template>
</Method>

### removeTerminal

<Method type="method">
  <template v-slot:signature>
    removeTerminal(<strong>terminal: </strong><em><Ref to="./terminal">Terminal</Ref></em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="terminal">
      <em><Ref to="./terminal">Terminal</Ref></em>
    </Param>
  </template>
  <template v-slot:desc>
    Removes specified terminal from the node.
  </template>
</Method>

### serialize

<Method type="method-implementation">
  <template v-slot:signature>
    serialize():
    <em><Ref to="../interfaces/serialized-node">SerializedNode</Ref></em>
  </template>
  <template v-slot:inherit>
    <Icon valign="bottom" type="implementation" /> of <Ref to="../interfaces/serializable">Serializable</Ref>.<Ref to="../interfaces/serializable#serialize">serialize</Ref>
  </template>
  <template v-slot:return><em><Ref to="../interfaces/serialized-node">SerializedNode</Ref></em></template>
</Method>

### setOutputs

<Method type="method">
  <template v-slot:signature>
    setOutputs(<strong>outputs: </strong><em>string | number | <Ref to="../interfaces/record">Record</Ref>&lt;string, any&gt;</em>,
    <strong>data?: </strong><em>any</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="setOutputs">
      <em>string | number | <Ref to="../interfaces/record">Record</Ref>&lt;string, any&gt;</em>
    </Param>
    <Param name="data?">
      <em>any</em>
    </Param>
  </template>
  <template v-slot:desc>
    Set outputs on one or more output terminals.
  </template>
  <template v-slot:example>
  Setting output on single terminal using it's name:

  ```js
  node.setOutputs('first-name', 'John');
  ```

  Setting output on single terminal using it's index:

  ```js
  node.setOutputs(2, 'John');
  ```

  Setting output on mulitple terminals at once:

  ```js
  node.setOutputs({
    'first-name': 'John',
    'last-name': 'Doe',
    age: 24
  });
  ```
  </template>
  <template v-slot:return>
    void
  </template>
</Method>


### toggleNodeState

<Method type="method">
  <template v-slot:signature>
    toggleNodeState():
    <em>void</em>
  </template>
  <template v-slot:desc>
    Toggles between maximized and minimized state.
    <img class="zoomable" alt="Node-state toggle example" src="/images/toggle-nodestate-example.png" />
  </template>
  <template v-slot:return>void</template>
</Method>

### watch

<Method type="method">
  <template v-slot:signature>
    watch(<strong>propName: </strong><em>string</em>,
    <strong>callback: </strong><em>(oldVal: any, newVal: any) => void</em>):
    <em>number</em>
  </template>
  <template v-slot:params>
    <Param name="propName">
      <em>string</em><br/>
      The name of the prop defined in <Ref to="#state">state</Ref> that needs to be watched for changes.
    </Param>
    <Param name="callback">
      <Function class="mr-0p5" /><em>(oldVal: any, newVal: any) => void</em><br/>
      Callback that needs to be triggered whenever specified prop's value changes.
    </Param>
  </template>
  <template v-slot:desc>
    Watch for changes on any prop defined in <Ref to="#state">state</Ref>.
  </template>
  <template v-slot:return>
    number<br/>
    A numbered id that can be used to <Ref to="#unwatch">unwatch</Ref>.
  </template>
</Method>

### unwatch

<Method type="method">
  <template v-slot:signature>
    unwatch(<strong>propName: </strong><em>string</em>,
    <strong>id: </strong><em>number</em>):
    <em>void</em>
  </template>
  <template v-slot:params>
    <Param name="propName">
      <em>string</em><br/>
      The name of the prop defined in <Ref to="#state">state</Ref> that needs to be un-watched.
    </Param>
    <Param name="id">
      <em>number</em><br/>
      A numbered id returned when doing <Ref to="#watch">watch</Ref>.
    </Param>
  </template>
  <template v-slot:desc>
    Unwatch any prop defined in <Ref to="#state">state</Ref>.
  </template>
  <template v-slot:return>
    void
  </template>
</Method>

### deSerialize

<Method type="method-static">
  <template v-slot:signature>
    deSerialize(<strong>flow: </strong><em><Ref to="./flow">Flow</Ref></em>,
    <strong>data: </strong><em><Ref to="../interfaces/serialized-node">SerializedNode</Ref></em>):
    <em><Ref to="#class-node">Node</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow"><em><Ref to="./flow">Flow</Ref></em></Param>
    <Param name="data"><em><Ref to="../interfaces/serialized-node">SerializedNode</Ref></em></Param>
  </template>
  <template v-slot:return><em><Ref to="#class-node">Node</Ref></em></template>
</Method>

## Events

### process <Icon type="event" /> {#event-process}

<Event type="event">
  <template v-slot:desc>
    When the node is triggered for processing due to new/changed input.
  </template>
</Event>

### render <Icon type="event" /> {#event-render}

<Event type="event">
  <template v-slot:desc>
    When a single render cycle completes for this node instance.
  </template>
</Event>

### down <Icon type="event" /> {#event-down}

<Event type="event">
  <template v-slot:desc>
    When touch down or mouse left down occurs on the node.
  </template>
</Event>

### over <Icon type="event" /> {#event-over}

<Event type="event">
  <template v-slot:desc>
    When mouse over happens on the node.
  </template>
</Event>

### enter <Icon type="event" /> {#event-enter}

<Event type="event">
  <template v-slot:desc>
    When mouse enter happens on the node.
  </template>
</Event>

### exit <Icon type="event" /> {#event-exit}

<Event type="event">
  <template v-slot:desc>
    When mouse exit happens on the node
  </template>
</Event>

### up <Icon type="event" /> {#event-up}

<Event type="event">
  <template v-slot:desc>
    When touch up or mouse left up happens on the node.
  </template>
</Event>

### click <Icon type="event" /> {#event-click}

<Event type="event">
  <template v-slot:desc>
    When tap or mouse click happens on the node.
  </template>
</Event>

### drag <Icon type="event" /> {#event-drag}

<Event type="event">
  <template v-slot:desc>
    When touch or mouse drag happens on the node.
  </template>
</Event>

### rightclick <Icon type="event" /> {#event-rightclick}

<Event type="event">
  <template v-slot:desc>
    When mouse right-click happens on the node.
  </template>
</Event>

### wheel <Icon type="event" /> {#event-wheel}

<Event type="event">
  <template v-slot:desc>
    When mouse scroll happens on the node.
  </template>
</Event>

<script setup>
import data from '../../../../../reflections/api/classes/node.json';
</script>
