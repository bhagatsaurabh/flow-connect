# Flow

## Creating a Flow

A Flow is a set of <Ref to="/reference/api/classes/node">Nodes</Ref>, <Ref to="/reference/api/classes/connector">Connectors</Ref> and <Ref to="/reference/api/classes/group">Groups</Ref>, it can also contain <Ref to="/reference/api/classes/subflow-node">SubFlowNodes</Ref>.

<br/>
<Ref to="/reference/api/classes/flow-connect#createflow">FlowConnect.createFlow</Ref>

```js
let flow = flowConnect.createFlow({ name: "Basic Example" });
```

```js
let flow = flowConnect.createFlow({
  name: "Detailed Example",
  rules: {
    r: ["r", "image"],
    g: ["g", "image"],
    b: ["b", "image"]
    image: ['image']
  },
  ruleColors: {
    r: Color.create('#ff0000'),
    g: Color.create('#00ff00'),
    b: Color.create('#0000ff'),
    image: Color.create('#0ffff0')
  }
});
```

<br/>

## Creating Rules

<br/>
<Ref to="/reference/api/interfaces/rules">Rules</Ref> specified for a Flow acts as constraints when connecting <Ref to="/reference/api/classes/terminal">terminals</Ref> of diferent <Ref to="/reference/api/classes/node">nodes</Ref> together.<br/><br/>
If you need to create a Flow that restricts terminals with <Ref to="/reference/api/classes/terminal#datatype">dataType</Ref> 'A' to be only connected to other terminals of dataType 'C' or 'D', then the rule for such a constraint will be:

```js
{
  A: ["C", "D"];
}
```

<br/>
If two dataTypes can be connected bi-directionally, then you need to specify rules for them explicitly, for e.g.
If terminals with dataType 'C' can also be connected to 'A', then the rule becomes:

```js
{
  A: ['C', 'D'],
  C: ['A']
}
```

<br/>
Some dataTypes are in-built and every Flow have these rules by default:

```js
{
  'string': ['string', 'any'],
  'number': ['number', 'audioparam', 'any'],
  'boolean': ['boolean', 'any'],
  'array': ['array', 'any'],
  'file': ['file', 'any'],
  'event': ['event', 'any'],
  'vector': ['vector', 'any'],
  'array-buffer': ['array-buffer', 'any'],
  'audio': ['audio', 'audioparam'],
  'audioparam': ['audioparam'],
  'audio-buffer': ['audio-buffer', 'any'],
  'any': ['any']
}
```
