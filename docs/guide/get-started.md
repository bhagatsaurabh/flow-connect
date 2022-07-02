# Getting Started

## Installation

#### NPM

```bash
npm i flow-connect
```

#### CDN

```html
<script
  src="https://cdn.jsdelivr.net/npm/flow-connect@1.0.12/dist/flow-connect.js"
></script>
```

## Usage

ESM

#### Note: Seperate dependency required for '@flow-connect/*' packages, check [flow-connect-standard-nodes](https://github.com/saurabh-prosoft/flow-connect-standard-nodes) monorepo for further details.

<br/>

```js
import { FlowConnect, Vector } from "flow-connect";
import { Timer, Log } from "@flow-connect/common";
```

Example

```js
const flowConnect = new FlowConnect(canvasElement);

const flow = flowConnect.createFlow({ name: "New Flow" });

const timer = new Timer(flow, {
  state: { delay: 500 },
  position: new Vector(50, 50),
});
const log = new Log(flow, { position: new Vector(250, 100) });

timer.outputs[0].connect(log.inputs[0]);

this.flowConnect.render(flow);
flow.start();
```
