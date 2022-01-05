import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core/terminal";
import { Evaluator } from "../../utils/evaluator";
import { Log } from "../../utils/logger";
import { Parser } from "../../utils/parser";
import { Token, TokenType } from "../../utils/lexer";
import { Node } from "../../core/node";
import { InputType, Input, Button } from "../../ui/index";

export class Func extends Node {
  addVarButton: Button

  static DefaultState = { newVar: 'y' };

  constructor(flow: Flow, options: NodeCreatorOptions = {}, expression?: string) {
    super(flow, options.name || 'Function', options.position || new Vector2(50, 50), options.width || 200, [],
      [{ name: '𝒇', dataType: 'any' }],
      {
        state: options.state
          ? { ...Func.DefaultState, ...options.state, expression: (expression || 'a*sin(a^2)+cos(a*tan(a))'), evaluator: new Evaluator({}) }
          : { ...Func.DefaultState, expression: (expression || 'a*sin(a^2)+cos(a*tan(a))'), evaluator: new Evaluator({}) },
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

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

    vars.forEach(variable => this.addTerminal(new Terminal(this, TerminalType.IN, 'any', variable)));
    this.state.expression = expression;

    this.setupUI();

    this.watch('expression', () => this.process());

    this.addVarButton.on('click', () => {
      if (!this.state.newVar || this.state.newVar.trim() === '') return;
      if (this.inputs.map(input => input.name).includes(this.state.newVar.trim().toLowerCase())) {
        Log.error('Variable', this.state.newVar.trim(), 'already exists');
        return;
      }
      this.addTerminal(new Terminal(this, TerminalType.IN, 'any', this.state.newVar.trim()));
    });
    this.on('process', () => this.process());
  }

  process() {
    let bulkEvalIterations = -1;
    this.state.evaluator.variables = {};
    for (let inTerminal of this.inputs) {
      let data = inTerminal.getData();

      // Some checks to determine if the intention is to pass variables with array values to this function
      // Which should mean its a bulk evaluation (t=[2,5,6,8...], f(t)=cos(t)  ==>  f(t)=[cos(2),cos(5),cos(6),cos(8)...])
      if (Array.isArray(data)) {
        let expr = this.state.expression;
        let regex = new RegExp('([a-z]+)\\(' + inTerminal.name + '\\)', 'g');
        expr = expr.replace(/\s+/g, '');
        let matches = [...expr.matchAll(regex)];
        let result = matches
          .map(match => !Evaluator.multiargFunctions.includes(match[1]))
          .reduce((acc, curr) => acc = acc && curr, true);

        if (result) bulkEvalIterations = Math.max(bulkEvalIterations, data.length);
      }

      this.state.evaluator.variables[inTerminal.name] = (typeof data !== 'undefined' && data !== null) ? data : 0;
    }
    try {
      let result: number[] | number;
      if (bulkEvalIterations !== -1) {
        let resultArr = [];
        for (let i = 0; i < bulkEvalIterations; i += 1) {
          resultArr.push(this.state.evaluator.evaluate(this.state.expression, i));
        }
        result = resultArr;
      } else {
        result = this.state.evaluator.evaluate(this.state.expression);
      }
      this.setOutputs(0, result);
    } catch (error) {
      Log.error('Error while evaluating the expression: ', this.state.expression, error);
    }
  }
  lowerCase(input: Input) {
    if (/[A-Z]/g.test(input.inputEl.value)) input.inputEl.value = input.inputEl.value.toLowerCase();
  }
  setupUI() {
    let exprInput = this.createInput({
      propName: 'expression', input: true, output: true, height: 20, style: { type: InputType.Text, grow: .9 }
    });
    exprInput.on('input', this.lowerCase);
    this.addVarButton = this.createButton('Add', { height: 20, style: { grow: .4 } });
    this.ui.append([
      this.createHozLayout([
        this.createLabel('𝒇', { style: { grow: .1 } }),
        exprInput
      ], { style: { spacing: 10 } }),
      this.createHozLayout([
        this.createInput({ propName: 'newVar', height: 20, style: { type: InputType.Text, maxLength: 1, grow: .6 } }),
        this.addVarButton
      ], { style: { spacing: 10 } })
    ]);
  }
}
