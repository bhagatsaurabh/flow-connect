# Getting Started

## Installation

#### NPM

```bash
npm i flow-connect
```

#### CDN

```html
<script
  src="https://cdn.jsdelivr.net/npm/flow-connect@1.0.1/bundles/flow-connect.js"
></script>
```

## Usage

ES6

```js
import * as FlowConnect from "flow-connect";
import { StandardNodes } from "flow-connect/lib/standard-nodes";
```

Example

```js
let flowConnect = new FlowConnect(document.getElementById("canvas"));

let flow = flowConnect.createFlow({
  name: "Stock Flow",
  rules: { array: ["array", "any"] },
  terminalColors: {}
});

let timer = StandardNodes.Timer(flow);

flowConnect.render(flow);
```
