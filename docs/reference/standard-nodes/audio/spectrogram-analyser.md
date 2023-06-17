## StandardNode: SpectrogramAnalyser

<img class="zoomable" alt="SpectrogramAnalyser standard node" src="/images/standard-nodes/audio/spectrogram-analyser.png" />

<Hierarchy :extend="{name: 'Node', link: '../../api/classes/node.html'}" />
<br/>

```js
let spectrogramAnalyser = flow.createNode("audio/spectrogram-analyser", {});
```

<br/>

### Default State

```js
{
  fftSize: 11,
  colorScale: 'Heated Metal'
}
```
