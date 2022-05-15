---
home: true
title: Home
heroImage: images/hero.png
footer: Copyright © 2021-present Saurabh Bhagat
---

<ClientOnly>
  <HomeExample />
</ClientOnly>

<QuickStart/>

<div class="quick-start-step">
<h5>Installation</h5>
<CodeGroup>
  <CodeGroupItem title="NPM">

```bash:no-line-numbers
npm install --save flow-connect
```

  </CodeGroupItem>

  <CodeGroupItem title="CDN">

```js:no-line-numbers
<script src="https://cdn.jsdelivr.net/npm/flow-connect@1.0.11/dist/flow-connect.js"></script>
```

  </CodeGroupItem>
</CodeGroup>
</div>
<div class="quick-start-desc">
  <h6>Learning FlowConnect is as simple as understanding what these terms mean and how they are related: Flows, Nodes, Connectors, Groups and Sub-Flows.<br/><br/>
  Every FlowConnect instance that you create has one or more Flows, and every Flow consists of Nodes, Connectors and Groups, Flows can also have Sub-Flows.<br/><br/>
  Create a <span class="colored-emphasis">Flow</span>, create a bunch of <span class="colored-emphasis">Nodes</span> inside that flow, connect those nodes using <span class="colored-emphasis">Connectors</span>, group similar nodes together using Node <span class="colored-emphasis">Groups</span> and if your flow becomes large, create <span class="colored-emphasis">Sub-Flows</span></h6>
</div>
<div class="quick-start-step quick-start-example">
<h5>Example</h5>

<LiveExample snippet="quick-start">
<template v-slot:name>quick-start.js</template>
<template v-slot:run="props"><LiveRunBasic :play="props.play" /></template>
<template v-slot:code>
<div class="code-block">

@[code](snippets/quick-start.js)

</div>
</template>
</LiveExample>

</div>

<div class="action-buttons">
  <ActionButton to="/guide/" primary>Introduction</ActionButton>
  <ActionButton to="/reference/api/classes/flow-connect" secondary>Docs</ActionButton>
  <ActionButton to="/guide/get-started" primary>Getting Started</ActionButton>
</div>

<Features>
<template v-slot:feature-code-1>
<div class="code-block">

@[code](snippets/custom-example.js)

</div>
</template>
<template v-slot:feature-code-2>
<div class="code-block">

@[code](snippets/event-example.js)

</div>
</template>
<template v-slot:feature-code-3>
<div class="code-block">

@[code](snippets/reactive-example.js)

</div>
</template>
<template v-slot:feature-code-4>
<div class="code-block">

@[code](snippets/executable-example.js)

</div>
</template>
</Features>

<style>
.home .features {
  border-top: unset;
}
.action-buttons {
  margin: auto;
  text-align: center;
  margin-top: 4rem !important;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.footer {
  text-align: left !important;
}
.quick-start-step {
  margin: auto;
  max-width: 80vw;
}
.quick-start-step h5 {
  margin-bottom: 0;
}

.quick-start-example h5 {
  margin-bottom: .85rem;
}
.quick-start-example .live-example {
  position: relative;
  height: 60vh;
}
.quick-start-desc {
  text-align: center;
  color: var(--c-text);
  opacity: .7;
  max-width: 70vw;
  margin: auto;
  margin-bottom: 0;
}

@media (max-width: 419px) {
  .quick-start-step {
    max-width: 100vw;
  }
  .quick-start-example .live-example {
    margin-left: -1.5rem;
    margin-right: -1.5rem;
  }
  .quick-start-desc {
    max-width: 100vw;
  }
}
@media (max-width: 700px) {
  .quick-start-step {
    max-width: 90vw;
  }
  .quick-start-desc {
    max-width: 90vw;
  }
}
</style>
