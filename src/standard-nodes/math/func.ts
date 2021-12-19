import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { Terminal, TerminalType } from "../../core/terminal";
import { Evaluator } from "../../utils/evaluator";
import { Log } from "../../utils/logger";
import { Parser } from "../../utils/parser";
import { Token, TokenType } from "../../utils/lexer";

export const Func = (flow: Flow, options: NodeCreatorOptions = {}, expression?: string) => {

  expression = expression || 'a*sin(a^2)+cos(a*tan(a))';
  let vars = new Set<string>();
  let parser = new Parser();
  let tokens: Token[];
  try {
    tokens = parser.parse(expression);
  } catch (error) {
    Log.error('Error while parsing expression: ', expression, error);
    return;
  }
  try {
    tokens.forEach(token => {
      if (token.type === TokenType.Variable) {
        if ((token.value as string).length > 1) throw new Error('Only single character variables are allowed: ' + token.value);
        else vars.add(token.value as string);
      }
    });
  } catch (error) { Log.error(error); return; }

  let node = flow.createNode(
    options.name || 'Function',
    options.position || new Vector2(50, 50),
    options.width || 200, [],
    [{ name: '𝒇', dataType: 'any' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props
      ? { evaluator: new Evaluator({}), newVar: 'y', expression, ...options.props }
      : { evaluator: new Evaluator({}), newVar: 'y', expression }
  );

  vars.forEach(variable => node.addTerminal(new Terminal(node, TerminalType.IN, 'any', variable)));
  node.props.expression = expression;

  let process = () => {
    let bulkEvalIterations = -1;
    node.props.evaluator.variables = {};
    for (let inTerminal of node.inputs) {
      let data = inTerminal.getData();

      // Some checks to determine if the intention is to pass variables with array values to this function
      // Which should mean its a bulk evaluation (t=[2,5,6,8...], f(t)=cos(t)  ==>  f(t)=[cos(2),cos(5),cos(6),cos(8)...])
      if (Array.isArray(data)) {
        let expr = node.props.expression;
        let regex = new RegExp('([a-z]+)\\(' + inTerminal.name + '\\)', 'g');
        expr = expr.replace(/\s+/g, '');
        let matches = [...expr.matchAll(regex)];
        let result = matches
          .map(match => !Evaluator.multiargFunctions.includes(match[1]))
          .reduce((acc, curr) => acc = acc && curr, true);

        if (result) bulkEvalIterations = Math.max(bulkEvalIterations, data.length);
      }

      node.props.evaluator.variables[inTerminal.name] = (typeof data !== 'undefined' && data !== null) ? data : 0;
    }
    try {
      let result: number[] | number;
      if (bulkEvalIterations !== -1) {
        let resultArr = [];
        for (let i = 0; i < bulkEvalIterations; i += 1) {
          resultArr.push(node.props.evaluator.evaluate(node.props.expression, i));
        }
        result = resultArr;
      } else {
        result = node.props.evaluator.evaluate(node.props.expression);
      }
      node.setOutputs(0, result);
    } catch (error) {
      Log.error('Error while evaluating the expression: ', node.props.expression, error);
    }
  }
  let lowerCase = (input: Input) => {
    if (/[A-Z]/g.test(input.inputEl.value)) input.inputEl.value = input.inputEl.value.toLowerCase();
  }

  let exprInput = node.createInput({
    propName: 'expression', input: true, output: true, height: 20, style: { type: InputType.Text, grow: .9 }
  });
  exprInput.on('input', lowerCase);
  let addVarButton = node.createButton('Add', false, false, 20, { grow: .4 } as any);
  node.ui.append([
    node.createHozLayout([
      node.createLabel('𝒇', { style: { grow: .1 } }),
      exprInput
    ], { spacing: 10 }),
    node.createHozLayout([
      node.createInput({ propName: 'newVar', height: 20, style: { type: InputType.Text, maxLength: 1, grow: .6 } }),
      addVarButton
    ], { spacing: 10 })
  ]);

  node.watch('expression', () => process);

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
