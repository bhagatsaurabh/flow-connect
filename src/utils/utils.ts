import { ViewPort } from "../math/constants";

export const getNewGUID = () => {
  var S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + "-" + S4() + "-" + S4() + "-" + S4());
};
export const normalize = (value: number, min: number, max: number) => {
  return (value - min) / (max - min);
};
export const denormalize = (normalized: number, min: number, max: number) => {
  return (max - min) * normalized + min;
};
export const getRandom = (min: number, max: number) => {
  return Math.random() * max + min;
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