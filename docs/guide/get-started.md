# Getting Started

## Installation

#### NPM

```bash
npm i flow-connect
```

#### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/flow-connect@latest/dist/flow-connect.js"></script>
```

## Usage

ESM

#### Note: Seperate dependency required for '@flow-connect/\*' packages, check [flow-connect-standard-nodes](https://github.com/saurabh-prosoft/flow-connect-standard-nodes) monorepo for further details.

<br/>

```js
import { FlowConnect, Vector } from "flow-connect";
import * from "@flow-connect/common";
```

Example

```js
const flowConnect = new FlowConnect(canvasElement);

const flow = flowConnect.createFlow({ name: "New Flow" });

const timer = flow.createNode("common/timer", Vector.create(50, 50), {
  state: { delay: 500 },
});
const log = flow.createNode("common/log", Vector.create(250, 100), {});

timer.outputs[0].connect(log.inputs[0]);

this.flowConnect.render(flow);
flow.start();
```
