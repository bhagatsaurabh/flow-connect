## StandardNode: Dial

<img class="zoomable" alt="Dial standard node" src="/images/standard-nodes/ui/dial.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let dial = new StandardNodes.UI.Dial(
  flow,
  { state: { min: 0, max: 2, value: 0.5 } }
);
```

<br/>

### Default State

```js
{
  value: 0,
  min: 0,
  max: 1
}
```

## Constructor

<Method type="method">
  <template v-slot:signature>
    new Dial(<strong>flow: </strong><em><Ref to="../../api/classes/flow">Flow</Ref></em>,
    <strong>options?: </strong><em><Ref to="../../api/interfaces/node-creator-options">NodeCreatorOptions</Ref></em>,
    <strong>dialStyle?: </strong><em><Ref to="../../api/interfaces/dial-style">DialStyle</Ref></em>):
    <em><Ref to="#standardnode-dial">Dial</Ref></em>
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
    <Param name="dialStyle?">
      <em><Ref to="../../api/interfaces/dial-style">DialStyle</Ref></em>
      <template v-slot:default-value>
        <em>{}</em>
      </template>
    </Param>
  </template>
</Method>
