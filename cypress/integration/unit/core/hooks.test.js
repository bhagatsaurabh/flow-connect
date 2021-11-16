import { Hooks } from '../../../../src/core/hooks';

describe('Hooks', () => {
  describe('Instantiation', () => {
    it('should create a Hooks object with default values', () => {
      let hooks = new Hooks();

      expect(hooks.registeredEvents).to.deep.equal({});
      expect(hooks.lastId).to.be.equal(0);
    });
  });
  describe('Hook Registration and De-registration', () => {
    it('should register hooks', () => {
      let hooks = new Hooks();

      let callback1 = () => { };
      let id1 = hooks.on('event1', callback1);
      console.log(hooks.registeredEvents);
      expect(hooks.registeredEvents).to.have.property('event1');
      expect(hooks.registeredEvents.event1).to.deep.equal({ [id1]: callback1 });

      let callback2 = () => { };
      let callback3 = () => { };
      let id2 = hooks.on('event2', callback2);
      let id3 = hooks.on('event1', callback3);
      expect(hooks.registeredEvents).to.have.property('event2');
      expect(hooks.registeredEvents.event2).to.deep.equal({ [id2]: callback2 });
      expect(hooks.registeredEvents).to.have.property('event1');
      expect(hooks.registeredEvents.event1).to.deep.equal({ [id1]: callback1, [id3]: callback3 });
    });

    it('should de-register hooks', () => {
      let hooks = new Hooks();

      let callback = () => { };
      let id1 = hooks.on('event1', callback);
      let id2 = hooks.on('event2', callback);
      let id3 = hooks.on('event2', callback);
      let id4 = hooks.on('event1', callback);
      let id5 = hooks.on('event3', callback);

      expect(hooks.registeredEvents).to.deep.equal({
        event1: { [id1]: callback, [id4]: callback },
        event2: { [id2]: callback, [id3]: callback },
        event3: { [id5]: callback }
      });

      hooks.off('event1', id4);
      expect(hooks.registeredEvents.event1).not.to.have.property(id4);

      hooks.off('event2', id2);
      expect(hooks.registeredEvents.event2).not.to.have.property(id2);
    });
  });
  describe('Callback', () => {
    it('should call all the registered callbacks for a given hook', () => {
      let hooks = new Hooks();

      let callbacks = {
        callback1: () => { },
        callback2: () => { },
        callback3: () => { },
        callback4: () => { },
        callback5: () => { }
      };
      let spyCallback1 = cy.spy(callbacks, 'callback1');
      let spyCallback2 = cy.spy(callbacks, 'callback2');
      let spyCallback3 = cy.spy(callbacks, 'callback3');
      let spyCallback4 = cy.spy(callbacks, 'callback4');
      let spyCallback5 = cy.spy(callbacks, 'callback5');

      hooks.on('event1', callbacks.callback1);
      hooks.on('event2', callbacks.callback1);
      hooks.on('event2', callbacks.callback2);
      hooks.on('event2', callbacks.callback3);
      hooks.on('event3', callbacks.callback4);
      hooks.on('event3', callbacks.callback5);
      hooks.on('event4', callbacks.callback5);
      hooks.on('event5', callbacks.callback5);

      hooks.call('event1');
      hooks.call('event2');
      hooks.call('event3');
      hooks.call('event4');
      hooks.call('event5');

      expect(spyCallback1.callCount).to.be.equal(2);
      expect(spyCallback2.callCount).to.be.equal(1);
      expect(spyCallback3.callCount).to.be.equal(1);
      expect(spyCallback4.callCount).to.be.equal(1);
      expect(spyCallback5.callCount).to.be.equal(3);
    });
  });
});
