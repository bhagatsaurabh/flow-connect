import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { CustomRendererType } from "../../ui/display";

export const FunctionPlotter = (flow: Flow, options: NodeCreatorOptions = {}, height: number, style: { axisColor?: string, gridColor?: string, plotColor?: string } = new Object()) => {

  let node = flow.createNode(
    options.name || 'Parametric Plotter',
    options.position || new Vector2(50, 50),
    options.width || 300,
    [{ name: 'data', dataType: 'any' }], [],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props
      ? { points: [], polar: false, config: { gX: 3, gY: 3, xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 }, ...options.props }
      : { points: [], polar: false, config: { gX: 3, gY: 3, xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 } }
  );

  let gridRenderer = (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number) => {
    drawGrid(context, width, height);
    return false;
  };

  let display = node.createDisplay(height, [
    { type: CustomRendererType.Auto, renderer: gridRenderer },
    { type: CustomRendererType.Manual }
  ]);
  let polarToggle = node.createToggle('polar', false, false, 10, { grow: .1 } as any);
  node.ui.append([
    display,
    node.createHozLayout([node.createLabel('Polar ?', null, false, false, { grow: .2 } as any), polarToggle], { spacing: 5 })
  ]);
  polarToggle.on('change', () => process(node.getInputs()));

  let dragStart: Vector2 = null;
  display.on('up', () => dragStart = null);
  display.on('exit', () => dragStart = null);
  display.on('down', (_, screenPos) => {
    dragStart = screenPos.subtract(display.position.transform(flow.flowConnect.transform));
    dragStart.x = xPixToCoord(node.props.config, display.autoOffCanvases[0].canvas.width, dragStart.x);
    dragStart.y = yPixToCoord(node.props.config, display.autoOffCanvases[0].canvas.height, dragStart.y);
  });
  display.on('drag', (_, screenPos) => {
    if (dragStart) {
      let curr = screenPos.subtract(display.position.transform(flow.flowConnect.transform));
      curr.x = xPixToCoord(node.props.config, display.autoOffCanvases[0].canvas.width, curr.x);
      curr.y = yPixToCoord(node.props.config, display.autoOffCanvases[0].canvas.height, curr.y);

      let delta = dragStart.subtract(curr);
      Object.assign(node.props.config, {
        xMin: node.props.config.xMin + delta.x,
        xMax: node.props.config.xMax + delta.x,
        yMin: node.props.config.yMin + delta.y,
        yMax: node.props.config.yMax + delta.y,
      });

      gridRenderer(
        display.autoOffCanvases[0].context,
        display.autoOffCanvases[0].canvas.width,
        display.autoOffCanvases[0].canvas.height
      );
      functionRenderer(
        display.manualOffCanvases[0].context,
        display.manualOffCanvases[0].canvas.width,
        display.manualOffCanvases[0].canvas.height
      );
    }
  });
  display.on('wheel', (_, direction, screenPos) => {
    let cursor = screenPos.subtract(display.position.transform(flow.flowConnect.transform));
    cursor.x = xPixToCoord(node.props.config, display.autoOffCanvases[0].canvas.width, cursor.x);
    cursor.y = yPixToCoord(node.props.config, display.autoOffCanvases[0].canvas.height, cursor.y);

    Object.assign(node.props.config, {
      xMin: node.props.config.xMin - cursor.x,
      xMax: node.props.config.xMax - cursor.x,
      yMin: node.props.config.yMin - cursor.y,
      yMax: node.props.config.yMax - cursor.y
    });
    if (!direction) {
      Object.assign(node.props.config, {
        xMin: node.props.config.xMin + node.props.config.xMin * 0.1,
        xMax: node.props.config.xMax + node.props.config.xMax * 0.1,
        yMin: node.props.config.yMin + node.props.config.yMin * 0.1,
        yMax: node.props.config.yMax + node.props.config.yMax * 0.1
      });
    } else {
      Object.assign(node.props.config, {
        xMin: node.props.config.xMin - node.props.config.xMin * 0.1,
        xMax: node.props.config.xMax - node.props.config.xMax * 0.1,
        yMin: node.props.config.yMin - node.props.config.yMin * 0.1,
        yMax: node.props.config.yMax - node.props.config.yMax * 0.1
      });
    }
    Object.assign(node.props.config, {
      xMin: node.props.config.xMin + cursor.x,
      xMax: node.props.config.xMax + cursor.x,
      yMin: node.props.config.yMin + cursor.y,
      yMax: node.props.config.yMax + cursor.y
    });

    gridRenderer(
      display.autoOffCanvases[0].context,
      display.autoOffCanvases[0].canvas.width,
      display.autoOffCanvases[0].canvas.height
    );
    functionRenderer(
      display.manualOffCanvases[0].context,
      display.manualOffCanvases[0].canvas.width,
      display.manualOffCanvases[0].canvas.height
    );
  });
  flow.flowConnect.on('scale', () => functionRenderer(
    display.manualOffCanvases[0].context,
    display.manualOffCanvases[0].canvas.width,
    display.manualOffCanvases[0].canvas.height
  ));

  let process = (inputs: any) => {
    if (Array.isArray(inputs[0])) {
      if (node.props.polar) {
        node.props.points = [];
        for (let i = 0; i < inputs[0].length; i += 1) {
          node.props.points.push({ x: inputs[0][i].x * Math.cos(inputs[0][i].y), y: inputs[0][i].x * Math.sin(inputs[0][i].y) });
        }
      } else {
        node.props.points = inputs[0];
      }
    } else {
      node.props.points.push(node.props.polar
        ? { x: inputs[0].x * Math.cos(inputs[0].y), y: inputs[0].x * Math.sin(inputs[0].y) }
        : inputs[0]
      );
    }
    functionRenderer(display.manualOffCanvases[0].context, display.manualOffCanvases[0].canvas.width, display.manualOffCanvases[0].canvas.height);
  }
  node.inputsUI[0].on('event', () => node.props.points = []);
  node.on('process', (_, inputs) => process(inputs));

  let xCoordToPix = (config: any, width: number, xCoord: number) => {
    const xDiff = config.xMax - config.xMin;
    const xPixPerUnit = width / xDiff;
    return Math.round((xCoord - config.xMin) * xPixPerUnit);
  }
  let yCoordToPix = (config: any, height: number, yCoord: number) => {
    const yDiff = config.yMax - config.yMin;
    const yPixPerUnit = height / yDiff;
    return Math.round(height - (yCoord - config.yMin) * yPixPerUnit);
  }
  let xPixToCoord = (config: any, width: number, xPix: number) => {
    const xDiff = config.xMax - config.xMin;
    const xPixPerUnit = width / xDiff;
    return xPix / xPixPerUnit + config.xMin;
  };
  let yPixToCoord = (config: any, height: number, yPix: number) => {
    const yDiff = config.yMax - config.yMin;
    const yPixPerUnit = height / yDiff;
    return -(yPix - height) / yPixPerUnit + config.yMin;
  };
  let drawLine = (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }
  let getGridPointDist = (min: number, max: number, factor: number) => {
    const diff = max - min;
    let result = Math.pow(10.0, Math.ceil(Math.log(diff) / Math.log(10.0)) - 1);
    switch (Math.floor(diff / result)) {
      case 9: result /= 2; break;
      case 8: result /= 3; break;
      case 7: result /= 4; break;
      case 6: result /= 5; break;
      case 5: result /= 6; break;
      case 4: result /= 7; break;
      case 3: result /= 8; break;
      case 2: result /= 9; break;
      case 1: result /= 10; break;
    }
    result *= factor;
    return result;
  };
  let drawGrid = (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number) => {
    context.clearRect(0, 0, width, height);
    const xDiff = node.props.config.xMax - node.props.config.xMin;
    const xPixPerUnit = width / xDiff;
    const yDiff = node.props.config.yMax - node.props.config.yMin;
    const yPixPerUnit = height / yDiff;
    const xF = getGridPointDist(node.props.config.xMin, node.props.config.xMax, node.props.config.gX);
    const yF = getGridPointDist(node.props.config.yMin, node.props.config.yMax, node.props.config.gY);
    style.axisColor = style.axisColor || "#000000";
    style.gridColor = style.gridColor || "#b0b0b0";

    let startValue = Math.ceil(node.props.config.xMin / xF) * xF;
    let number = Math.round(Math.floor(xDiff / xF)) + 1;
    let axisPosition;
    if (node.props.config.yMin < 0 && node.props.config.yMax > 0) {
      axisPosition = height + node.props.config.yMin * yPixPerUnit + 12;
    } else {
      axisPosition = height - 12;
    }
    context.strokeStyle = style.gridColor;
    for (let i = 0; i < number; i++) {
      if (Math.abs(startValue) < xF * 0.5) {
        context.strokeStyle = style.axisColor;
      }
      const position = Math.round((startValue - node.props.config.xMin) * xPixPerUnit);
      drawLine(context, position, 0, position, height);
      context.fillStyle = style.axisColor;
      const text = Math.round(startValue * 100) / 100;
      context.fillText(text + '', position + 4, axisPosition);
      context.strokeStyle = style.gridColor;
      startValue += xF;
    }

    startValue = Math.ceil(node.props.config.yMin / yF) * yF;
    number = Math.round(Math.floor(yDiff / yF)) + 1;
    if (node.props.config.xMin < 0 && node.props.config.xMax > 0) {
      axisPosition = -node.props.config.xMin * xPixPerUnit + 5;
    } else {
      axisPosition = 5;
    }
    context.strokeStyle = style.gridColor;
    for (let i = 0; i < number; i++) {
      if (Math.abs(startValue) < yF * 0.5) {
        context.strokeStyle = style.axisColor;
      }
      const position = height - Math.round((startValue - node.props.config.yMin) * yPixPerUnit);
      drawLine(context, 0, position, width, position);
      let axisVal = Math.round(startValue * 100) / 100;
      if (axisVal !== 0) {
        context.fillStyle = style.axisColor;
        const text = axisVal;
        context.fillText(text + '', axisPosition, position - 4);
      }
      context.strokeStyle = style.gridColor;
      startValue += yF;
    }
  };
  let functionRenderer = (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number) => {
    if (node.props.points.length <= 0) return;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = style.plotColor || '#000';
    context.lineWidth = 2;
    context.beginPath();
    let startX = xCoordToPix(node.props.config, width, node.props.points[0].x);
    let startY = yCoordToPix(node.props.config, height, node.props.points[0].y);
    context.moveTo(startX, startY);
    for (let i = 1; i < node.props.points.length; i += 1) {
      const x = xCoordToPix(node.props.config, width, node.props.points[i].x);
      const y = yCoordToPix(node.props.config, height, node.props.points[i].y);
      context.lineTo(x, y);
    }
    context.stroke();
  }

  return node;
};
