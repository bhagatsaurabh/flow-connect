import { FlowConnect } from '../../../src/flow-connect';
import { Constant } from '../../../src/math/constants';

Cypress.config({
    viewportHeight: 1000,
    viewportWidth: 1000
});

let canvasEl = document.createElement('canvas');

describe('Flow', () => {
    describe('Setup', () => {
        it('should setup', () => {
            cy.document().then(doc => {
                doc.body.appendChild(canvasEl);
            });
        });
    });

    describe('Initialization', () => {
        it('should create an instance of FlowConnect', () => {
            let [width, height] = [1500, 1000];
            let flowConnect = new FlowConnect(canvasEl, width, height);

            expect(flowConnect.canvas).to.be.equal(canvasEl);
            expect(flowConnect.canvas.width).to.be.equal(width);
            expect(flowConnect.canvas.height).to.be.equal(height);

            expect(flowConnect.offCanvas).to.satisfy((val) => val instanceof OffscreenCanvas || val instanceof HTMLCanvasElement);
            expect(flowConnect.offCanvas.width).to.be.equal(width);
            expect(flowConnect.offCanvas.height).to.be.equal(height);

            expect(flowConnect.offUICanvas).to.satisfy((val) => val instanceof OffscreenCanvas || val instanceof HTMLCanvasElement);
            expect(flowConnect.offUICanvas.width).to.be.equal(width);
            expect(flowConnect.offUICanvas.height).to.be.equal(height);
        });
    });

    describe('Flow Creation', () => {
        it('should create a flow', () => {
            let flowConnect = new FlowConnect(canvasEl, 1000, 1000);

            let name = 'Test Flow';
            let rules = {
                'r': ['r', 'g', 'b'],
                'g': ['r', 'g', 'b'],
                'b': ['r', 'g', 'b'],
                'image': ['image']
            };
            let terminalTypeColors = {
                'r': '#ff0000',
                'g': '#00ff00',
                'b': '#0000ff',
                'image': 'grey'
            };
            let flow = flowConnect.createFlow({ name, rules, terminalTypeColors });

            expect(flow.name).to.be.equal(name);
            expect(flow.rules).to.deep.include(rules);
            expect(flow.rules).to.deep.include(Constant.DefaultRules);
            expect(flow.terminalTypeColors).to.deep.equal(terminalTypeColors);
        });
    });
});
