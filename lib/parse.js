/**
 * Parses a math string to an AST.
 *
 * Notes:
 * - The output AST tries to conform to the math-ast spec, but some aspects may
 *   be a little off.  This will be fixed in future versions.
 * - The input syntax covers the parts of the mathjs syntax being used by
 *   mathsteps
 *
 * TODO:
 * - Better adherence to and more comprehensive coverage of the math-ast spec.
 * - Specify what the syntax is, e.g. operator precedence, implicit multiplication,
 *   etc.
 */
import * as nodes from './nodes';
import replace from './replace';

function isIdentifierToken(token) {
    return token && /[a-zA-Z][a-zA-Z0-9]*/.test(token.value);
}

function isNumberToken(token) {
    return token && /\d*\.\d+|\d+\.\d*|\d+/.test(token.value);
}

const tokenPattern =
    /([a-zA-Z][a-zA-Z0-9]*)|[\<\>\!]\=|([\(\)\+\-\/\*\^\=\<\>|\,])|(\d*\.\d+|\d+\.\d*|\d+)/;

const relationTokens = ['=', '<', '<=', '>', '>=', '!='];

function isSymbol(node) {
    return node.type === 'Symbol';
}

function isNumber(node) {
    return node.type === 'Number';
}

function isExpression(node) {
    return ['Relation', 'System', 'List', 'Sequence'].indexOf(node.type) === -1;
}

function matches(token, value) {
    return token && token.value === value;
}

class Parser {
    consume(expectedValue) {
        const token = this.currentToken();
        if (expectedValue !== undefined) {
            if (!matches(token, expectedValue)) {
                throw new Error(
                    `expected '${expectedValue}' received '${token.value}'`);
            }
        }
        this.i++;
        return token;
    }

    currentToken() {
        return this.tokens[this.i];
    }

    parse(input) {
        this.i = 0;
        this.tokens = [];
        // TODO: switch from 'match' to 'exec' so that an invalid input raises an error
        // TODO: add 'END_OF_STREAM' token

        const regex = new RegExp(tokenPattern, 'g');

        let match;
        while ((match = regex.exec(input)) != null) {
            this.tokens.push({
                value: match[0],
                start: match.index,
                end: match.index + match[0].length,
            });
        }

        return this.list();
    }

    list() {
        const items = [this.relationsOrRelationOrExpression()];

        while (true) {
            const token = this.currentToken();

            if (matches(token, ',')) {
                this.consume(',');
                items.push(this.relationsOrRelationOrExpression());
            } else {
                break;
            }
        }

        if (items.length > 1) {
            if (items.every((item) => item.type === 'Relation')) {
                return {
                    type: 'System', // of equations
                    relations: items,
                };
            } else if (items.every(isExpression)) {
                return {
                    type: 'Sequence',
                    items,
                };
            } else {
                return {
                    type: 'List',
                    items,
                };
            }
        } else {
            return items[0];
        }
    }

    relationsOrRelationOrExpression() {
        const relations = [];

        let left;
        let right;

        left = this.expression();

        while (true) {
            const token = this.currentToken();

            if (relationTokens.indexOf(token && token.value) !== -1) {
                this.consume();
                right = this.expression();
                relations.push(nodes.relationNode(token.value, [left, right]));
                left = right;
            } else {
                break;
            }
        }

        if (relations.length > 1) {
            return {
                type: 'System',
                collapsed: true,
                relations: relations,
            };
        } else if (relations.length > 0) {
            return relations[0];
        } else {
            return left;
        }
    }

    expression() {
        const args = [];

        args.push(this.explicitMul());

        while (true) {
            const token = this.currentToken();

            if (matches(token, '-')) {
                this.consume('-');
                args.push(nodes.operationNode('neg', [this.explicitMul()], {wasMinus: true}));
            } else if (matches(token, '+')) {
                this.consume('+');
                args.push(this.explicitMul());
            } else {
                break;
            }
        }

        return args.length > 1
            ? nodes.operationNode('add', args)
            : args[0];
    }

    explicitMul() {
        const factors = [];

        factors.push(this.implicitMul());

        while (true) {
            if (matches(this.currentToken(), '*')) {
                this.consume('*');
                factors.push(this.implicitMul());
            } else {
                break;
            }
        }

        return factors.length > 1
            ? nodes.operationNode('mul', factors)
            : factors[0];
    }

    /**
     * Parse the following forms of implicit multiplication:
     * - a b c
     * - (a)(b)(c)
     *
     * Note: (a)b(c) is actually: 'a' times function 'b' evaluated at 'c'
     *
     * If the multiplication was detected, a single parsed factor is returned.
     */
    implicitMul() {
        const factors = [];

        factors.push(this.division());

        while (true) {
            const token = this.currentToken();

            if (matches(token, '(')) {
                factors.push(this.division());
            } else if (isIdentifierToken(token) || isNumberToken(token)) {
                factors.push(this.division());
            } else {
                break;
            }

            if (this.i > this.tokens.length) {
                break;
            }
        }

        return factors.length > 1
            ? nodes.operationNode('mul', factors, {implicit: true})
            : factors[0];
    }

    division() {
        let numerator;
        let denominator;
        let frac;

        numerator = this.factor();

        while (true) {
            const token = this.currentToken();

            if (matches(token, '/')) {
                this.consume('/');
                denominator = this.factor();
                if (frac) {
                    frac = nodes.operationNode('div', [frac, denominator]);
                } else {
                    frac = nodes.operationNode('div', [numerator, denominator]);
                }
            } else {
                break;
            }
        }

        return frac || numerator;
    }

    /**
     * Parse any of the following:
     * - unary operations, e.g. +, -
     * - numbers
     * - identifiers
     * - parenthesis
     * - absolute value function, e.g. |x|
     * - exponents, e.g. x^2
     */
    factor() {
        let token = this.currentToken();
        let signs = [];

        // handle multiple unary operators
        while (matches(token, '+') || matches(token, '-')) {
            signs.push(token);
            this.consume(token.value);
            token = this.currentToken();
        }

        let base, exp;

        const start = token.start;

        if (isIdentifierToken(token)) {
            const name = token.value;
            this.consume(name);

            if (matches(this.currentToken(), '(')) {
                this.consume('(');
                const args = this.argumentList();
                token = this.consume(')');
                base = nodes.functionNode(name, args, start, token.end);
            } else {
                base = nodes.identifierNode(name, start, token.end);
            }
        } else if (isNumberToken(token)) {
            this.consume(token.value);
            base = nodes.numberNode(token.value, start, token.end);
        } else if (matches(token, '(')) {
            this.consume('(');
            base = this.expression();
            token = this.consume(')');
            if (isNumber(base) || isSymbol(base)) {
                base = nodes.bracketsNode(base, start, token.end);
            }
        } else if (matches(token, '|')) {
            this.consume('|');
            base = this.expression();
            token = this.consume('|');

            base = nodes.functionNode('abs', [base], start, token.end);
        }

        let factor = base;

        // TODO handle exponents separately
        if (matches(this.currentToken(), '^')) {
            this.consume('^');
            exp = this.factor();
            const loc = {
                start: base.loc.start,
                end: exp.loc.end,
            };
            factor = nodes.operationNode('pow', [base, exp], {loc});
        }

        // Reverse the signs so that we process them from the sign nearest
        // to the factor to the furthest.
        signs.reverse();

        signs.forEach((sign) => {
            if (isNumber(factor) && factor.value > 0) {
                factor.value = `${sign.value}${factor.value}`;
                factor.loc.start = sign.start;
            } else {
                const loc = {
                    start: sign.start,
                    end: factor.loc.end,
                };
                if (sign.value === '+') {
                    factor = nodes.operationNode('pos', [factor], { loc });
                } else {
                    factor = nodes.operationNode('neg', [factor], { loc });
                }
            }
        });

        return factor;
    }

    argumentList() {
        const args = [this.expression()];
        while (true) {
            const token = this.currentToken();
            if (!matches(token, ',')) {
                break;
            }
            this.consume(',');
            args.push(this.expression());
        }
        return args;
    }
}

const postProcess = (ast) => {
  return replace(ast, {
    enter() {},
    leave(node) {
      if (node.type === 'Operation' && node.op === 'mul' && node.args.length === 2) {
        if (node.args[0].type === 'Number' && node.args[1].type === 'Operation' && node.args[1].op === 'div') {
          const [numerator, denominator] = node.args[1].args;
          if (numerator.type === 'Identifier') {
            return {
              type: 'Operation',
              op: 'div',
              args: [
                {
                  type: 'Operation',
                  op: 'mul',
                  args: [node.args[0], numerator],
                  implicit: node.implicit,
                },
                denominator,
              ],
            }
          }
        }
      }
    }
  });
};

const parser = new Parser();

export default function parse(math) {
  return postProcess(parser.parse(math));
}
