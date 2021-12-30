import { Evaluator } from "./evaluator";

export class Lexer {
  static operators = ['+', '-', '*', '/', '^', '%', '&', '|'];
  private result: Token[] = [];
  private numberBuffer: string[] = [];
  private letterBuffer: string[] = [];

  constructor() { /**/ }

  tokenize(expr: string) {
    this.result = [];
    this.numberBuffer = [];
    this.letterBuffer = [];

    // Replace all variable spread operators with their equivalent capital letter
    let index;
    while ((index = expr.indexOf('...')) !== -1) {
      expr = expr.substring(0, index) + expr.charAt(index + 3).toUpperCase() + expr.substring(index + 4);
    }

    expr = this.replaceConstants(expr);
    let chars = expr.replace(/\s+/g, "").split("");

    chars.forEach(char => {
      if (this.isDigit(char)) {
        this.numberBuffer.push(char);
      } else if (this.isDecimalPoint(char)) {
        this.numberBuffer.push(char);
      } else if (this.isLetter(char)) {
        if (this.numberBuffer.length) {
          this.processNumberBuffer();
          this.result.push(new Token(TokenType.Operator, '*'));
        }

        this.letterBuffer.push(char);
      } else if (this.isOperator(char)) {
        if (this.numberBuffer.length) this.processNumberBuffer();
        else if (this.letterBuffer.length) this.processLetterBuffer();

        this.result.push(new Token(TokenType.Operator, char));
      } else if (this.isLeftParenthesis(char)) {
        if (this.letterBuffer.length) {
          this.result.push(new Token(TokenType.Function, this.letterBuffer.join('')));
          this.letterBuffer = [];
        } else if (this.numberBuffer.length) {
          this.processNumberBuffer();
          this.result.push(new Token(TokenType.Operator, '*'));
        }

        this.result.push(new Token(TokenType.LParenthesis, char));
      } else if (this.isRightParenthesis(char)) {
        if (this.letterBuffer.length) this.processLetterBuffer();
        if (this.numberBuffer.length) this.processNumberBuffer();

        this.result.push(new Token(TokenType.RParenthesis, char));
      } else if (this.isComma(char)) {
        if (this.numberBuffer.length) this.processNumberBuffer();
        if (this.letterBuffer.length) this.processLetterBuffer();

        this.result.push(new Token(TokenType.ArgSeperator, char));
      } else throw Error('Unknown character: ' + char);
    });
    if (this.numberBuffer.length) this.processNumberBuffer();
    if (this.letterBuffer.length) this.processLetterBuffer();

    return this.result;
  }
  private replaceConstants(expr: string) {
    return expr
      .replace(/pi/g, Evaluator.constants.pi.toString())
      .replace(/tau/g, Evaluator.constants.tau.toString())
      .replace(/phi/g, Evaluator.constants.phi.toString())
      .replace(/ln2/g, Evaluator.constants.ln2.toString())
      .replace(/ln10/g, Evaluator.constants.ln10.toString())
      .replace(/log2e/g, Evaluator.constants.log2e.toString())
      .replace(/log10e/g, Evaluator.constants.log10e.toString());
  }
  private processNumberBuffer() {
    let literal = parseFloat(this.numberBuffer.join(''));
    this.numberBuffer = [];
    if (!isNaN(literal)) { this.result.push(new Token(TokenType.Literal, literal)); }
  }
  private processLetterBuffer() {
    for (var i = 0; i < this.letterBuffer.length; i++) {
      this.result.push(new Token(TokenType.Variable, this.letterBuffer[i]));
      if (i < this.letterBuffer.length - 1) this.result.push(new Token(TokenType.Operator, '*'));
    }
    this.letterBuffer = [];
  }
  private isComma(char: string) { return (char === ","); }
  private isDigit(char: string) { return /\d/.test(char); }
  private isLetter(char: string) { return /[a-zA-Z]/.test(char); }
  private isOperator(char: string) { return Lexer.operators.includes(char); }
  private isLeftParenthesis(char: string) { return char === "(" }
  private isRightParenthesis(char: string) { return char == ")" }
  private isDecimalPoint(char: string) { return char === '.' }
}

export enum TokenType {
  Literal = 'Literal',
  Variable = 'Variable',
  Operator = 'Operator',
  LParenthesis = 'LParenthesis',
  RParenthesis = 'RParenthesis',
  Function = 'Function',
  ArgSeperator = 'ArgSeperator'
}

export class Token {
  static associativity = {
    '^': 'right',
    '*': 'left',
    '/': 'left',
    '+': 'left',
    '-': 'left',
    '%': 'left',
    '&': 'left',
    '|': 'left'
  };
  static precedence = {
    '|': 0,
    '&': 1,
    '+': 2,
    '-': 2,
    '*': 3,
    '/': 3,
    '%': 3,
    '^': 4
  };

  count: number;
  get precedence(): number { return (Token.precedence as any)[this.value]; }
  get associativity(): string { return (Token.associativity as any)[this.value]; }

  constructor(public type: TokenType, public value: string | number) { this.count = 0; }

  toString(): string { return this.type + '(' + this.value + ')'; }
}
