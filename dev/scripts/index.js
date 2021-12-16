let examples = [];
let fetchExamples = async () => {
  examples = await (await fetch('/examples')).json();
  let select = document.getElementById('examples-select');
  let lastExample = localStorage.getItem('example');
  examples.forEach(example => {
    let option = document.createElement('option');
    option.innerText = example;
    if (example === lastExample) option.selected = true;
    select.appendChild(option);
  });

  await setupFlowConnect();

  if (lastExample) {
    let script = document.createElement('script');
    script.src = 'scripts/examples/' + lastExample;
    script.onload = () => typeof flow !== 'undefined' && flowConnect.render(flow);
    document.body.appendChild(script);
  }
  else {
    localStorage.setItem('example', examples[0]);
  }
}
let exampleChangeHandler = (example) => {
  localStorage.setItem('example', example);
  location.reload();
}
fetchExamples();

let setupFlowConnect = async () => {
  window.flowConnect = await FlowConnect.create(canvas);

  flowConnect.on('update', () => {
    offContext.clearRect(0, 0, offCanvas.width, offCanvas.height);
    offUIContext.clearRect(0, 0, offUICanvas.width, offUICanvas.height);
    offGroupContext.clearRect(0, 0, offGroupCanvas.width, offGroupCanvas.height);

    offContext.drawImage(flowConnect.offCanvas, 0, 0, flowConnect.offCanvas.width, flowConnect.offCanvas.height);
    offUIContext.drawImage(flowConnect.offUICanvas, 0, 0);
    offGroupContext.drawImage(flowConnect.offGroupCanvas, 0, 0);
  });
}
