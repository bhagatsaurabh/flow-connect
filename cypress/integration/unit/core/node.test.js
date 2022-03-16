import { Flow, FlowConnect, Vector } from '../../../../src/flow-connect';

Cypress.config({
  viewportHeight: 1000,
  viewportWidth: 1000
});

let canvasEl = document.createElement('canvas');
let flowConnect = new FlowConnect(canvasEl, 1000, 1000);

describe('Node', () => {
  describe('Setup', () => {
    it('should setup', () => {
      cy.document().then(doc => {
        doc.body.appendChild(canvasEl);
      });
    });
  });
});
