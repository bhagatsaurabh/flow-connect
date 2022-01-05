/** 
 * Hooks is a general purpose class used by FlowConnect, Flow, Node, UINode, Terminal, Group... classes
 * for making their normal processes available as events to listen to when they happen.
 * For e.g you can listen to any Terminal's 'connect'/'disconnect' event to do some custom stuff
 */
export class Hooks {
  protected registeredEvents: Record<string, Record<number, (...args: any) => void>>;
  protected lastId: number;

  constructor() {
    this.registeredEvents = {};
    this.lastId = 0;
  }

  /** 
   * Register a callback to an event
   * 
   * @param eventKey name of the event to listen to
   * @param callback reference to a callback that will be triggered when this event happens
   * @returns a numbered ID that can be used later to de-register this hook
   */
  on(eventKey: string, callback: (...args: any) => void): number {
    if (!this.registeredEvents[eventKey]) this.registeredEvents[eventKey] = {};

    let id = this.lastId;
    this.registeredEvents[eventKey][id] = callback;
    this.lastId += 1;
    return id;
  }
  call(eventKey: string, ...args: any) {
    if (this.registeredEvents[eventKey]) {
      if (!args) args = [];
      Object.values(this.registeredEvents[eventKey]).forEach(callback => callback(...args));
    }
  }
  /** 
   * De-register a callback to an event
   * 
   * @param eventKey name of the event to de-register
   * @param id a numbered id that was generated at the time of event registration
   */
  off(eventKey: string, id: number) {
    if (this.registeredEvents[eventKey]) delete this.registeredEvents[eventKey][id];
  }
  offAll() {
    this.registeredEvents = {};
  }
}
