offCanvas.width = offCanvas.clientWidth;
offCanvas.height = offCanvas.clientHeight;
offUICanvas.width = offUICanvas.clientWidth;
offUICanvas.height = offUICanvas.clientHeight;
offGroupCanvas.width = offGroupCanvas.clientWidth;
offGroupCanvas.height = offGroupCanvas.clientHeight;

let adjustDimension = (canvas) => {
  if (!canvas.parentElement) return;
  let parentBoundingRect = canvas.parentElement.getBoundingClientRect();
  canvas.width = Math.round(parentBoundingRect.width);
  canvas.height = Math.round(parentBoundingRect.height);
}

let removeObserver = (view) => observers[view].disconnect();
let setObserver = (view) => {
  observers[view] = new ResizeObserver(() => adjustDimension(viewToCanvas[view]));
  observers[view].observe(viewToCanvas[view]);
}

let offCanvasObserver = new ResizeObserver(() => adjustDimension(offCanvas));
offCanvasObserver.observe(offCanvas);
let offUICanvasObserver = new ResizeObserver(() => adjustDimension(offUICanvas));
offUICanvasObserver.observe(offUICanvas);
let offGroupCanvasObserver = new ResizeObserver(() => adjustDimension(offGroupCanvas));
offGroupCanvasObserver.observe(offGroupCanvas);

let observers = {
  'Node hit-map': offCanvasObserver,
  'UI hit-map': offUICanvasObserver,
  'Group hit-map': offGroupCanvasObserver
}

let offContext = offCanvas.getContext('2d');
let offUIContext = offUICanvas.getContext('2d');
let offGroupContext = offGroupCanvas.getContext('2d');

let flowConnect = new FlowConnect(canvas);
flowConnect.on('update', () => {
  offContext.clearRect(0, 0, offCanvas.width, offCanvas.height);
  offUIContext.clearRect(0, 0, offUICanvas.width, offUICanvas.height);
  offGroupContext.clearRect(0, 0, offGroupCanvas.width, offGroupCanvas.height);

  offContext.drawImage(flowConnect.offCanvas, 0, 0, flowConnect.offCanvas.width, flowConnect.offCanvas.height);
  offUIContext.drawImage(flowConnect.offUICanvas, 0, 0);
  offGroupContext.drawImage(flowConnect.offGroupCanvas, 0, 0);
});
