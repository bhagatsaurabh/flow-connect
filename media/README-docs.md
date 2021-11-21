![Flow Connect](media://flow-connect-index.png)

FlowConnect is a highly-customizable library for creating node-based editors, graphs and diagrams

[Jump to Index](modules.html)
\
\
\
🌐 **Website:** https://flow-connect.saurabh-bhagat.me

🔍 **Examples:** https://flow-connect.saurabh-bhagat.me/examples

📚 **Docs:** [https://flow-connect.saurabh-bhagat.me/docs](https://flow-connect.saurabh-bhagat.me/docs)  
\
\.

## Installation

### NPM

---

```bash
npm i flow-connect
```

### CDN

---

```html
<script src=""></script>
```

## Example Usage

ES6

```js
import * as FlowConnect from "flow-connect";
import * as StandardNodes from "flow-connect/standard-nodes";
```

Example

```js
let flowConnect = new FlowConnect(document.getElementById("canvas"));

let flow = flowConnect.createFlow({
  name: "Stock Flow",
  rules: { array: ["array", "any"] },
  terminalTypeColors: {},
});

let timer = StandardNodes.Timer(flow);

flowConnect.render(flow);
```

## Testing

Testing is done via Cypress

- Install [Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress#System-requirements)

```bash
npm i cypress --save-dev
```

- Run tests

```bash
npm run test
```

## Build

Build AMD, ESM and CommonJS modules

```bash
npm run build
```

## Docs

Docs are generated using [TypeDoc](https://typedoc.org/)

```bash
npm run doc
```

## Feedback

Feel free to send any feedback on <saurabhbhagat98die@gmail.com>
