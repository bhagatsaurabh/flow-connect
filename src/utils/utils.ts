import { Graph } from "../core/graph.js";
import { Rules } from "../common/interfaces.js";
import { Terminal } from "../core/terminal.js";
import { ViewPort } from "../common/enums.js";

export const uuid = () => crypto.randomUUID();

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
export const intersects = (
  start1X: number,
  start1Y: number,
  end1X: number,
  end1Y: number,
  start2X: number,
  start2Y: number,
  end2X: number,
  end2Y: number
): ViewPort => {
  let res = !(start2X > end1X || end2X < start1X || start2Y > end1Y || end2Y < start1Y);
  if (res) {
    if (!(start2X < start1X || start2Y < start1Y || end2X > end1X || end2Y > end1Y)) return ViewPort.INSIDE;
    else return ViewPort.INTERSECT;
  } else return ViewPort.OUTSIDE;
};
export const clampMin = (value: number, min: number): number => Math.max(value, min);
export const clampMax = (value: number, max: number): number => Math.min(value, max);
export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
export const lerp = (a: number, b: number, t: number): number => (1 - t) * a + t * b;
export const canConnect = (source: Terminal, destination: Terminal, rules: Rules, executionGraph: Graph) => {
  if (!destination) return false;
  if (source === destination) return false;
  if (source.node === destination.node) return false;
  if (source.type === destination.type) return false;
  if (!rules[source.dataType].includes(destination.dataType)) return false; // Directional !!
  if (!executionGraph.canConnect(source.node, destination.node)) return false;
  return true;
};
export const isEmpty = (obj: any): boolean => {
  for (let _ in obj) return false;
  return true;
};
export const isInRange = (value: number, min: number, max: number): boolean => {
  return Math.min(value, min) >= min && Math.max(value, max) <= max;
};
export const exists = (value: any): boolean => typeof value !== "undefined" && value !== null;
export const binarySearch = ({ max, getValue, match }: { max: number; getValue: Function; match: number }) => {
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
export const noop = () => {
  /**/
};
export const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
export const cloneAudioBuffer = (from: AudioBuffer): AudioBuffer => {
  const cloned = new AudioBuffer({
    length: from.length,
    numberOfChannels: from.numberOfChannels,
    sampleRate: from.sampleRate,
  });
  for (let i = 0; i < cloned.numberOfChannels; ++i) {
    cloned.copyToChannel(from.getChannelData(i), i);
  }
  return cloned;
};
