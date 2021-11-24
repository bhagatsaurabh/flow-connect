offCanvas.width = offCanvas.clientWidth;
offCanvas.height = offCanvas.clientHeight;
offUICanvas.width = offUICanvas.clientWidth;
offUICanvas.height = offUICanvas.clientHeight;
offGroupCanvas.width = offGroupCanvas.clientWidth;
offGroupCanvas.height = offGroupCanvas.clientHeight;

let offContext = offCanvas.getContext('2d');
let offUIContext = offUICanvas.getContext('2d');
let offGroupContext = offGroupCanvas.getContext('2d');

let flowConnect = new FlowConnect(canvas);
flowConnect.on('update', () => {
    offContext.clearRect(0, 0, offCanvas.width, offCanvas.height);
    offUIContext.clearRect(0, 0, offUICanvas.width, offUICanvas.height);
    offGroupContext.clearRect(0, 0, offGroupCanvas.width, offGroupCanvas.height);

    offContext.drawImage(flowConnect.offCanvas, 0, 0);
    offUIContext.drawImage(flowConnect.offUICanvas, 0, 0);
    offGroupContext.drawImage(flowConnect.offGroupCanvas, 0, 0);
});