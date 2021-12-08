import { TokenType } from "./lexer";
import { Constant } from "../resource/constants";
import { Parser } from "./parser";

export class Evaluator {
  parser: Parser;
  static constants = {
    tau: Constant.TAU,
    pi: Math.PI,
    phi: Constant.PHI,
    ln2: Math.LN2,
    ln10: Math.LN10,
    log2e: Math.LOG2E,
    log10e: Math.LOG10E,
  };
  static functions = {
    cos: Math.cos,
    acos: Math.acos,
    acosh: Math.acosh,
    sin: Math.sin,
    asin: Math.asin,
    asinh: Math.asinh,
    tan: Math.tan,
    atan: Math.atan,
    atanh: Math.atanh,
    atan2: Math.atan2,
    abs: Math.abs,
    ceil: Math.ceil,
    round: Math.round,
    floor: Math.floor,
    exp: Math.exp,
    random: Math.random,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    log10: Math.log10,
    log2: Math.log2,
    log: (value: number, base?: number) => { return base ? (Math.log(value) / Math.log(base)) : Math.log(value); },
    dist: (x1: number, y1: number, x2: number, y2: number) => { return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); },
    gcd: (a: number, b: number) => { while (b !== 0) { const r = a % b; a = b; b = r; } return a < 0 ? -a : a; },
    max: (...args: any[]) => { return Array.isArray(args[0]) ? Math.max(...args[0]) : Math.max(...args) },
    min: (...args: any[]) => { return Array.isArray(args[0]) ? Math.min(...args[0]) : Math.min(...args) },
    hypot: (...args: number[]) => {
      let result = 0;
      let largest = 0;
      let input = Array.isArray(args[0]) ? args[0] : args;
      input.forEach(x => {
        const value = Math.abs(x);
        if (largest < value) {
          result = result * (largest / value) * (largest / value);
          result += 1;
          largest = value;
        } else {
          result = result + (value > 0 ? ((value / largest) * (value / largest)) : value);
        }
      });
      return largest * Math.sqrt(result);
    },
    lcm: (a: number, b: number) => {
      if (a === 0) return a;
      if (b === 0) return b;
      const prod = a * b;
      while (b !== 0) { const t = b; b = a % t; a = t; }
      return Math.abs(prod / a);
    },
    sum: (...args: any[]) => {
      let input = Array.isArray(args[0]) ? args[0] : args;
      return input.reduce((acc, curr) => acc += curr, 0);
    },
    mean: (...args: any[]) => {
      let input = Array.isArray(args[0]) ? args[0] : args;
      return Evaluator.functions.sum(input) / input.length
    },
    median: (...args: any[]) => {
      let input = Array.isArray(args[0]) ? args[0] : args;
      input.sort((a, b) => a - b);
      return input.length % 2 === 0 ? (input[input.length / 2 - 1] + input[input.length / 2]) / 2 : input[Math.floor(input.length / 2)];
    },
    std: (...args: any[]) => {
      let input = Array.isArray(args[0]) ? args[0] : args;
      return Math.sqrt(Evaluator.functions.var(input));
    },
    var: (...args: any[]) => {
      let input = Array.isArray(args[0]) ? args[0] : args;
      let mean = Evaluator.functions.mean(input);
      return input.reduce((acc, curr) => acc += Math.pow(curr - mean, 2), 0) / input.length;
    },
    fact: (n: number) => {
      let res = 1;
      for (let i = n; i > 1; i -= 1) res *= i;
      return res;
    }
  };

  constructor(public variables: { [name: string]: number }) { this.parser = new Parser(); }

  evaluate(expr: string) {
    let postFix = this.parser.parse(expr);
    let result: number[] = [];

    for (let token of postFix) {
      switch (token.type) {
        case TokenType.Literal: {
          result.push(token.value as number);
          break;
        }
        case TokenType.Variable: {
          result.push(this.variables[token.value]);
          break;
        }
        case TokenType.Operator: {
          let [left, right] = [result.pop(), result.pop()];
          if (typeof left !== 'number' || typeof right !== 'number') throw new Error('Only numbers are allowed for operators');

          switch (token.value) {
            case '+': { result.push(left + right); break; }
            case '*': { result.push(left * right); break; }
            case '-': { result.push(right - left); break; }
            case '/': { result.push(right / left); break; }
            case '%': { result.push(right % left); break; }
            case '^': { result.push(Math.pow(right, left)); break; }
            case '&': { result.push(right & left); break; }
            case '|': { result.push(right | left); break; }
            default: throw new Error('Unknow operator: ' + token.value);
          }
          break;
        }
        case TokenType.Function: {
          let args = [];
          for (let i = 0; i < token.count; i += 1) args.push(result.pop());
          result.push((Evaluator.functions as any)[token.value](...args));
          break;
        }
        default: throw new Error('Unknown token type: ' + token.type);
      }
    }

    return result[0];
  }
}
