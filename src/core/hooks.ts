export class Hooks {
  protected registeredEvents: { [key: string]: { [id: number]: (...args: any) => void } };
  protected lastId: number;

  constructor() {
    this.registeredEvents = {};
    this.lastId = 0;
  }

  on(eventKey: string, callback: (...args: any) => void): number {
    if (!this.registeredEvents[eventKey]) this.registeredEvents[eventKey] = {};

    let id = this.lastId;
    this.registeredEvents[eventKey][id] = callback;
    this.lastId += 1;
    return id;
  }
  /** @hidden */
  call(eventKey: string, ...args: any) {
    if (this.registeredEvents[eventKey]) {
      if (args) Object.values(this.registeredEvents[eventKey]).forEach(callback => new Promise((resolve) => resolve(callback(...args))));
      else Object.values(this.registeredEvents[eventKey]).forEach(callback => new Promise((resolve) => resolve(callback())));
    }
  }
  off(eventKey: string, id: number) {
    if (this.registeredEvents[eventKey]) delete this.registeredEvents[eventKey][id];
  }
}
