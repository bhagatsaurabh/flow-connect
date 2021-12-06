import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { InputType, TerminalType } from "../../math/constants";
import { Terminal } from "../../core/terminal";
import { Evaluator } from "../../utils/evaluator";
import { Log } from "../../utils/logger";

export const Func = (flow: Flow, options: NodeCreatorOptions = {}, noofVars?: number, noOfExprs?: number) => {

    noofVars = noofVars && noofVars > 0 ? (noofVars > 26 ? 26 : noofVars) : 1;
    noOfExprs = noOfExprs && noOfExprs > 0 ? noOfExprs : 1;

    let node = flow.createNode(
        options.name || 'Function',
        options.position || new Vector2(50, 50),
        options.width || 200, [], [],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props
            ? { evaluator: new Evaluator({}), newVar: 'y', expressions: [], ...options.props }
            : { evaluator: new Evaluator({}), newVar: 'y', expressions: [] }
    );

    let process = () => {
        node.props.evaluator.variables = {};
        for (let i = 0; i < node.inputs.length; i += 1) {
            let data = (node.inputs[i] as any).getData();
            node.props.evaluator.variables[node.inputs[i].name] = (typeof data !== 'undefined' && data !== null) ? data : 0;
        }
        try {
            let result: any = {};
            node.props.expressions.forEach((expr: string, index: number) => {
                result[node.outputs[index].name] = node.props.evaluator.evaluate(expr);
            });
            node.setOutputs(result);
        } catch (error) {
            Log.error('Error while evaluating one of the expressions: ', node.props.expressions, error);
        }
    }

    let currVar = 'a';
    for (let i = 0; i < noofVars; i += 1) {
        node.addTerminal(new Terminal(node, TerminalType.IN, 'any', currVar));
        currVar = String.fromCharCode(currVar.charCodeAt(0) + 1);
    }
    let exprStack = node.createStack([], { spacing: 10 });
    for (let i = 0; i < noOfExprs; i += 1) {
        let newState = [...node.props.expressions];
        newState[i] = 'a*sin(a^2)+cos(a*tan(a))';
        node.props.expressions = newState;

        let exprInput = node.createInput(
            node.props.expressions[i], `expressions[${i}]`, true, true,
            20, { type: InputType.Text, grow: .9 } as any
        );
        exprInput.on('change', process);
        exprStack.append(
            node.createHozLayout([
                node.createLabel('𝒇' + (i + 1), null, false, false, { grow: .1 } as any),
                exprInput
            ], { spacing: 10 })
        );
        node.addTerminal(new Terminal(node, TerminalType.OUT, 'number', `𝒇${i + 1}`));
    }

    let addExprButton = node.createButton('Add Function', false, false, 20, { grow: '.5' } as any);
    let addVarButton = node.createButton('Add', false, false, 20, { grow: .4 } as any);
    node.ui.append([
        exprStack,
        addExprButton,
        node.createHozLayout([
            node.createInput(node.props.newVar, 'newVar', false, false, 20, { type: InputType.Text, maxLength: 1, grow: .6 } as any),
            addVarButton
        ], { spacing: 10 })
    ]);

    addExprButton.on('click', () => {
        let index = exprStack.children.length;
        let newState = [...node.props.expressions];
        newState[index] = 'a*sin(a^2)+cos(a*tan(a))';
        node.props.expressions = newState;

        let exprInput = node.createInput(
            node.props.expressions[index], 'expressions[' + index + ']', true, true,
            20, { type: InputType.Text, grow: .9 } as any
        );
        exprStack.append(
            node.createHozLayout([
                node.createLabel('𝒇' + (index + 1), null, false, false, { grow: .1 } as any),
                exprInput
            ], { spacing: 10 })
        );
        node.addTerminal(new Terminal(node, TerminalType.OUT, 'number', `𝒇${index + 1}`));
    });
    addVarButton.on('click', () => {
        if (!node.props.newVar || node.props.newVar.trim() === '') return;
        if (node.inputs.map(input => input.name).includes(node.props.newVar.trim().toLowerCase())) {
            Log.error('Variable', node.props.newVar.trim(), 'already exists');
            return;
        }
        node.addTerminal(new Terminal(node, TerminalType.IN, 'any', node.props.newVar.trim()));
    });
    node.on('process', process);

    return node;
};
