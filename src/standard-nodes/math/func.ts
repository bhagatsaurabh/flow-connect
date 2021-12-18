import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { Terminal, TerminalType } from "../../core/terminal";
import { Evaluator } from "../../utils/evaluator";
import { Log } from "../../utils/logger";
import { Parser } from "../../utils/parser";
import { Token, TokenType } from "../../utils/lexer";

export const Func = (flow: Flow, options: NodeCreatorOptions = {}, expressions?: string[] | number) => {

  if (typeof expressions === 'number') {
    expressions = expressions < 1 ? 1 : expressions;
    let exprStrings = [];
    for (let i = 0; i < expressions; i += 1) exprStrings.push('a*sin(a^2)+cos(a*tan(a))');
    expressions = exprStrings;
  } else {
    expressions = expressions.length < 1 ? ['a*sin(a^2)+cos(a*tan(a))'] : expressions;
  }
  let vars = new Set<string>();
  let parser = new Parser();
  let tokensArr: Token[][] = [];
  try {
    expressions.forEach(expr => tokensArr.push(parser.parse(expr)));
  } catch (error) {
    Log.error('Error while parsing expressions: ', expressions, error);
    return;
  }
  try {
    tokensArr.forEach(tokens => tokens.forEach(token => {
      if (token.type === TokenType.Variable) {
        if ((token.value as string).length > 1) throw new Error('Only single character variables are allowed: ' + token.value);
        else vars.add(token.value as string);
      }
    }));
  } catch (error) { Log.error(error); return; }

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
  let fChangedTerminal = new Terminal(node, TerminalType.OUT, 'event', '𝒇 changed');
  node.addTerminal(fChangedTerminal);

  let process = () => {
    let bulkEvalIterations = -1;
    node.props.evaluator.variables = {};
    for (let i = 0; i < node.inputs.length; i += 1) {
      let data = (node.inputs[i] as any).getData();

      // Some checks to determine if the intention is to pass variables to this function which are arrays
      // Which should mean its a bulk evaluation (t=[2,5,6,8...], f(t)=cos(t)  ==>  f(t)=[cos(2),cos(5),cos(6),cos(8)...])
      if (Array.isArray(data)) {
        node.props.expressions.map((expr: string) => {
          let regex = new RegExp('([a-z]+)\\(' + node.inputs[i].name + '\\)', 'g');
          expr = expr.replace(/\s+/g, '');
          let matches = [...expr.matchAll(regex)];
          let result = matches
            .map(match => !Evaluator.multiargFunctions.includes(match[1]))
            .reduce((acc, curr) => acc = acc && curr, true);

          if (result) bulkEvalIterations = Math.max(bulkEvalIterations, data.length);
        });
      }

      node.props.evaluator.variables[node.inputs[i].name] = (typeof data !== 'undefined' && data !== null) ? data : 0;
    }
    try {
      let result: any = {};
      node.props.expressions.forEach((expr: string, index: number) => {
        if (bulkEvalIterations !== -1) {
          let resultArr = [];
          for (let i = 0; i < bulkEvalIterations; i += 1) {
            resultArr.push(node.props.evaluator.evaluate(expr, i));
          }
          result[node.outputs[index + 1].name] = resultArr;
        } else {
          result[node.outputs[index + 1].name] = node.props.evaluator.evaluate(expr);
        }
      });
      node.setOutputs(result);
    } catch (error) {
      Log.error('Error while evaluating one of the expressions: ', node.props.expressions, error);
    }
  }
  let lowerCase = (input: Input) => {
    if (/[A-Z]/g.test(input.inputEl.value as string)) input.inputEl.value = (input.inputEl.value as string).toLowerCase();
  }

  vars.forEach(variable => node.addTerminal(new Terminal(node, TerminalType.IN, 'any', variable)));
  node.props.expressions = expressions;

  let exprStack = node.createStack([], { spacing: 10 });
  let addExprInputs = () => {
    for (let i = 0; i < node.props.expressions.length; i += 1) {
      let exprInput = node.createInput(
        node.props.expressions[i], `expressions[${i}]`, true, true,
        20, { type: InputType.Text, grow: .9 } as any
      );
      exprInput.on('change', () => { fChangedTerminal.emit(null); process(); });
      exprInput.on('input', lowerCase);
      exprStack.append(
        node.createHozLayout([
          node.createLabel('𝒇' + (i + 1), null, false, false, { grow: .1 } as any),
          exprInput
        ], { spacing: 10 })
      );
      node.addTerminal(new Terminal(node, TerminalType.OUT, 'number', `𝒇${i + 1}`));
    }
  }
  addExprInputs();

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

  node.watch('expressions', () => {
    exprStack.children = [];
    addExprInputs();
  });

  addExprButton.on('click', () => {
    let index = exprStack.children.length;
    let newState = [...node.props.expressions];
    newState[index] = 'a*sin(a^2)+cos(a*tan(a))';
    node.props.expressions = newState;

    let exprInput = node.createInput(
      node.props.expressions[index], 'expressions[' + index + ']', true, true,
      20, { type: InputType.Text, grow: .9 } as any
    );
    exprInput.on('change', () => { fChangedTerminal.emit(null); process(); });
    exprInput.on('input', lowerCase);
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
