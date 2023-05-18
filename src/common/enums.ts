/** To distinguish whether two rectangles are inside/intersecting/disconnected */
export enum ViewPort {
  INSIDE = "INSIDE",
  OUTSIDE = "OUTSIDE",
  INTERSECT = "INTERSECT",
}

/** Levels of Detail, affects rendering while zooming in/out */
export enum LOD {
  LOD0,
  LOD1,
  LOD2,
}

export enum Align {
  Left,
  Center,
  Right,
}

export enum GlobalEventType {
  Emitter,
  Receiver,
}
