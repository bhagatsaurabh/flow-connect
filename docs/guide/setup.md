# Initialization

## Creating a FlowConnect

FlowConnect can be considered as a container storing all <Ref to="/reference/api/classes/flow">Flows</Ref> created by it, a FlowConnect instance can render one Flow at a time on-screen.

A <Ref to="/reference/api/classes/flow-connect">FlowConnect</Ref> instance is bound to exactly one `<canvas>`, this instance maintains/tracks the dimensions of that canvas, registers user-interaction events (mouse, keyboard, touch) and creates additional OffScreenCanvas's to track/act-upon these events.

<br/>
<Ref to="/reference/api/classes/flow-connect#constructor">FlowConnect.constructor</Ref>

```js
let flowConnect = new FlowConnect(document.getElementById('canvas'));
```

The only thing that is required to create a new FlowConnect instance is a reference to the `<canvas>` element, used as a mount point for rendering Flows.

<script setup>
  import Ref from "../../../components/api/Ref.vue";
</script>
