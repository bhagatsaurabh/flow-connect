## StandardNode: Func

<img class="zoomable" alt="Func standard node" src="/images/standard-nodes/math/func.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let func = new StandardNodes.Math.Function(
  flow,
  {},
  'sin(t) + 0.2cos(2.8t)'
);
```

<br/>

### Default State

```js
{ newVar: 'y' }
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new Func(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>,
    <strong>expression?: </strong><em>string</em>):
    <em><Ref to="#standardnode-func">Func</Ref></em>
  </template>
  <template v-slot:params>
    <Param name="flow">
      <em><Ref to="../../api/classes/flow">Flow</Ref></em>
    </Param>
    <Param name="options?">
      <em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>
      <template v-slot:default-value>
        <em>{}</em>
      </template>
    </Param>
    <Param name="expression?">
      <em>string</em>
    </Param>
  </template>
</Method>
