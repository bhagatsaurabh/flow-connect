import { Graph } from "../core/graph";
import { Rules } from "../common/interfaces";
import { Terminal } from "../core/terminal";
import { ViewPort } from "../common/enums";

export const getNewGUID = () => {
  var S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  return (S4() + "-" + S4() + "-" + S4() + "-" + S4());
};
export const normalize = (value: number, min: number, max: number) => {
  if (min === max) return 1;
  return (value - min) / (max - min);
};
export const denormalize = (normalized: number, min: number, max: number) => {
  return (max - min) * normalized + min;
};
export const getRandom = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};
export const intersects = (start1X: number, start1Y: number, end1X: number, end1Y: number, start2X: number, start2Y: number, end2X: number, end2Y: number): ViewPort => {
  let intersects = !(start2X > end1X || end2X < start1X || start2Y > end1Y || end2Y < start1Y);
  if (intersects) {
    if (!(start2X < start1X || start2Y < start1Y || end2X > end1X || end2Y > end1Y)) return ViewPort.INSIDE;
    else return ViewPort.INTERSECT;
  } else return ViewPort.OUTSIDE;
};
export const clamp = (value: number, min: number, max: number): number => {
  return value <= min ? min : (value > max ? max : value);
};
export const canConnect = (source: Terminal, destination: Terminal, rules: Rules, executionGraph: Graph) => {
  if (!destination) return false;
  if (source === destination) return false;
  if (source.node === destination.node) return false;
  if (source.type === destination.type) return false;
  if (!rules[source.dataType].includes(destination.dataType)) return false;
  if (!executionGraph.canConnect(source.node, destination.node)) return false;
  return true;
};
/** @hidden */
export const binarySearch = ({ max, getValue, match }: { max: number, getValue: Function, match: number }) => {
  let min = 0;
  while (min <= max) {
    let mid = Math.floor((min + max) / 2);
    const curr = getValue(mid);

    if (curr === match) return mid;
    if (curr < match) min = mid + 1;
    else max = mid - 1;
  }
  return max;
};