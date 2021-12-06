import { Lexer, Token, TokenType } from "./lexer";

export class Parser {
    lexer: Lexer;

    constructor() { this.lexer = new Lexer(); }

    private peek(arr: any[]) { return arr.slice(-1)[0]; };

    parse(expression: string) {
        let tokens = this.lexer.tokenize(expression);
        let stack: Token[] = [];
        let output: Token[] = [];
        let were: boolean[] = [];
        let argCount: number[] = [];

        tokens.forEach(token => {
            if (token.type === TokenType.Literal || token.type === TokenType.Variable) {
                output.push(token);
                if (typeof this.peek(were) !== 'undefined') {
                    were.pop();
                    were.push(true);
                }
            } else if (token.type === TokenType.Function) {
                stack.push(token);
                argCount.push(0);
                if (typeof this.peek(were) !== 'undefined') {
                    were.pop();
                    were.push(true);
                }
                were.push(false);
            } else if (token.type === TokenType.ArgSeperator) {
                while (this.peek(stack) && this.peek(stack).type !== TokenType.LParenthesis) {
                    output.push(stack.pop());
                }
                let w = were.pop();
                if (w) { argCount.push(argCount.pop() + 1); }
                were.push(false);
            } else if (token.type == TokenType.Operator) {
                while (this.peek(stack) && (this.peek(stack).type === TokenType.Operator)
                    && (
                        (token.associativity === "left" && token.precedence <= this.peek(stack).precedence)
                        || (token.associativity === "right" && token.precedence < this.peek(stack).precedence)
                    )
                ) {
                    output.push(stack.pop());
                }
                stack.push(token);
            } else if (token.type === TokenType.LParenthesis) {
                stack.push(token);
            } else if (token.type === TokenType.RParenthesis) {
                while (this.peek(stack) && this.peek(stack).type !== TokenType.LParenthesis) {
                    output.push(stack.pop());
                }
                stack.pop();

                if (this.peek(stack) && this.peek(stack).type === TokenType.Function) {
                    let funcToken = stack.pop();
                    let a = argCount.pop();
                    let w = were.pop();
                    if (w) { a += 1; }
                    funcToken.count = a;
                    output.push(funcToken);
                }
            }
        });
        while (this.peek(stack)) { output.push(stack.pop()); }

        return output;
    }
}
