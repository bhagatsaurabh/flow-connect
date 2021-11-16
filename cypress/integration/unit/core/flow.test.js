import { Flow, FlowConnect, Vector2 } from '../../../../src/flow-connect';

Cypress.config({
    viewportHeight: 1000,
    viewportWidth: 1000
});

let canvasEl = document.createElement('canvas');
let flowConnect = new FlowConnect(canvasEl, 1000, 1000);

describe('Flow', () => {
    describe('Setup', () => {
        it('should setup', () => {
            cy.document().then(doc => {
                doc.body.appendChild(canvasEl);
            });
        });
    });

    describe('Initialization', () => {
        it('should create an instance of flow', () => {
            
        });
    });

    describe('Node Creation', () => {
        it('should create nodes', () => {
            let flow = new Flow(flowConnect, 'TestFlow', {}, {});

            let node1 = flow.createNode(
                'Node 1', new Vector2(50, 50),
                100,
                [{ name: 'R', dataType: 'r' }, { name: 'G', dataType: 'g' }, { name: 'B', dataType: 'b' }],
                [{ name: 'Image', dataType: 'image' }],
                { padding: 10, spacing: 10, rowHeight: 10 }, {}, {}
            );
            let node2 = flow.createNode(
                'Node 2',
                new Vector2(150, 50),
                200,
                [],
                [],
                { padding: 10, spacing: 10, rowHeight: 10 },
                {},
                { value: 15 }
            );
            let node3 = flow.createNode(
                'Node 3',
                new Vector2(300, 120),
                250,
                [],
                [],
                { padding: 10, spacing: 10, rowHeight: 10 },
                {},
                { value: 'Example Text' }
            );

            flowConnect.render(flow);

            expect(Object.keys(flowConnect.rootFlow.nodes).length).to.be.equal(3);
            expect(flowConnect.rootFlow.nodes).to.have.property(node1.id, node1);
            expect(flowConnect.rootFlow.nodes).to.have.property(node2.id, node2);
            expect(flowConnect.rootFlow.nodes).to.have.property(node3.id, node3);
            cy.get('canvas').toMatchImageSnapshot();
        });
    })
});
