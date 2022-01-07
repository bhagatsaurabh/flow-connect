---
home: true
title: Home
heroImage: /images/hero.png
footer: Copyright © 2021-present Saurabh Bhagat
---

<ClientOnly>
  <HomeExample/>
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
<script src="https://cdn.jsdelivr.net/npm/flow-connect@1.0.1-beta/bundles/flow-connect.js"></script>
```

  </CodeGroupItem>
</CodeGroup>
</div>

<div class="quick-start-step quick-start-example">
<h5>Example</h5>

<LiveExample snippet="quick-start">
<template v-slot:name>quick-start.js</template>
<template v-slot:run="props"><LiveRunBasic :play="props.play" /></template>
<template v-slot:code>
<div class="code-block">

@[code](./snippets/quick-start.js)

</div>
</template>
</LiveExample>

</div>

<Features>
<template v-slot:feature-code-1>
<div class="code-block">

@[code](./snippets/custom-example.js)

</div>
</template>
<template v-slot:feature-code-2>
<div class="code-block">

@[code](./snippets/event-example.js)

</div>
</template>
<template v-slot:feature-code-3>
<div class="code-block">

@[code](./snippets/reactive-example.js)

</div>
</template>
</Features>

<script setup>
  import HomeExample from '../../components/HomeExample.vue';
  import QuickStart from '../../components/QuickStart.vue';
  import Features from '../../components/Features.vue';
  import LiveRunBasic from '../../components/LiveRunBasic.vue';
  import LiveExample from '../../components/LiveExample.vue';
</script>
<style>
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
  height: 50vh;
}

@media (max-width: 419px) {
  .quick-start-step {
    max-width: 100vw;
  }
  .quick-start-example .live-example {
    margin-left: -1.5rem;
    margin-right: -1.5rem;
  }
}
@media (max-width: 700px) {
  .quick-start-step {
    max-width: 90vw;
  }
}
</style>
