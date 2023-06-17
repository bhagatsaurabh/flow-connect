## StandardNode: Metronome

<img class="zoomable" alt="Metronome standard node" src="/images/standard-nodes/audio/metronome.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let metronome = flow.createNode("audio/metronome", {});
```

<br/>

### Default State

```js
{
  frequency: 330,
  buffer: null,
  bpm: 130,
  loop: true,
  auto: true
}
```
