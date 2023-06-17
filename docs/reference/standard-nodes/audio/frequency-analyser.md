## StandardNode: FrequencyAnalyser

<img class="zoomable" alt="FrequencyAnalyser standard node" src="/images/standard-nodes/audio/frequency-analyser.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let frequencyAnalyser = flow.createNode("audio/frequency-analyser", {});
```

<br/>

### Default State

```js
{ fftSize: 11, currFreq: 0 }
```
