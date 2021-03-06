module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = replace;
/**
 * replace - visit all nodes in the tree with the ability to replace them.
 *
 * This function return a new AST and does not mutate any nodes in the original
 * AST.  If neither 'enter' nor 'leave' return a value, the node is unchanged.
 * If 'enter' returns a new node, the children of the new node will be traversed
 * instead of the old one.  If both 'enter' and 'leave' return values, the
 * value returned by 'leave' is the node that will end up in the new AST.
 */

function replace(node, _ref) {
    var enter = _ref.enter,
        leave = _ref.leave;

    var rep = enter(node) || _extends({}, node);

    switch (node.type) {
        // regular non-leaf nodes
        case 'Relation':
        case 'Operation':
        case 'Function':
            rep = _extends({}, rep, {
                args: rep.args.map(function (arg) {
                    return replace(arg, { enter: enter, leave: leave });
                })
            });
            break;

        // skip leaf nodes
        case 'Identifier':
        case 'Number':
            rep = _extends({}, rep);
            break;

        // irregular non-leaf nodes
        case 'Brackets':
            rep = _extends({}, rep, {
                content: replace(rep.content, { enter: enter, leave: leave })
            });
            break;

        case 'List':
        case 'Sequence':
            rep = _extends({}, rep, {
                items: rep.items.map(function (item) {
                    return replace(item, { enter: enter, leave: leave });
                })
            });
            break;

        case 'System':
            rep = _extends({}, rep, {
                relations: rep.relations.map(function (rel) {
                    return replace(rel, { enter: enter, leave: leave });
                })
            });
            break;

        default:
            throw new Error('unrecognized node');
    }

    return leave(rep) || rep;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.relationNode = relationNode;
exports.operationNode = operationNode;
exports.functionNode = functionNode;
exports.identifierNode = identifierNode;
exports.numberNode = numberNode;
exports.bracketsNode = bracketsNode;
function relationNode(rel, args) {
    return {
        type: 'Relation',
        rel: rel,
        loc: {
            start: args[0].loc.start,
            end: args[args.length - 1].loc.end
        },
        args: args
    };
}

// TODO(kevinb) handle post fix operators
function operationNode(op, args, options) {
    var result = _extends({
        type: 'Operation',
        op: op,
        loc: {
            start: args[0].loc.start,
            end: args[args.length - 1].loc.end
        }
    }, options, {
        args: args
    });

    return result;
}

function functionNode(fn, args, start, end) {
    return {
        type: 'Function',
        fn: fn, // TODO: switch this out to be an Identifier
        loc: { start: start, end: end },
        args: args
    };
}

function identifierNode(name, start, end) {
    return {
        type: 'Identifier',
        name: name,
        loc: { start: start, end: end }
    };
}

function numberNode(value, start, end) {
    return {
        type: 'Number',
        value: value,
        loc: { start: start, end: end }
    };
}

function bracketsNode(content, start, end) {
    return {
        type: 'Brackets',
        loc: { start: start, end: end },
        content: content
        // TODO: add left, right
    };
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = evaluate;
/**
 * evaluate -
 */

var operations = {
    'add': function add(args) {
        return args.reduce(function (sum, val) {
            return sum + val;
        }, 0);
    },
    'neg': function neg(args) {
        if (args.length === 1) {
            return -args[0];
        } else {
            throw new Error('\'-\' can\'t be performed on ' + args.length + ' arguments');
        }
    },
    'mul': function mul(args) {
        return args.reduce(function (prod, val) {
            return prod * val;
        }, 1);
    },
    'div': function div(args) {
        if (args.length !== 2) {
            throw new Error('\'/\' can only be performed with 2 arguments');
        }
        return args[0] / args[1];
    },
    'pow': function pow(args) {
        return Math.pow(args[0], args[1]);
    }
};

// TODO: check the number of args
var relations = {
    'eq': function eq(_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            left = _ref2[0],
            right = _ref2[1];

        return left === right;
    },
    'lt': function lt(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            left = _ref4[0],
            right = _ref4[1];

        return left < right;
    },
    'le': function le(_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            left = _ref6[0],
            right = _ref6[1];

        return left <= right;
    },
    'ge': function ge(_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            left = _ref8[0],
            right = _ref8[1];

        return left >= right;
    },
    'gt': function gt(_ref9) {
        var _ref10 = _slicedToArray(_ref9, 2),
            left = _ref10[0],
            right = _ref10[1];

        return left > right;
    },
    'ne': function ne(_ref11) {
        var _ref12 = _slicedToArray(_ref11, 2),
            left = _ref12[0],
            right = _ref12[1];

        return left !== right;
    }
};

// TODO: add context parm to hold variables, functions, operations, and relations
function evaluate(node) {
    switch (node.type) {
        // regular non-leaf nodes
        case 'Relation':
            if (node.rel in relations) {
                return relations[node.rel](node.args.map(evaluate));
            } else {
                throw new Error('\'$node.op\' is not a valid relation in this context');
            }
        case 'Operation':
            if (node.op in operations) {
                return operations[node.op](node.args.map(evaluate));
            } else {
                throw new Error('\'' + node.op + '\' is not a valid operation in this context');
            }
        case 'Function':
            if (!Math[node.fn]) {
                throw new Error('\'' + node.fn + '\' does not exist on Math global');
            }
            if (Math[node.fn].length !== node.args.length) {
                throw new Error('\'' + node.fn + '\' takes ' + Math[node.fn].length + ' parameters, ' + node.args.length + ' was provided');
            }
            return Math[node.fn].apply(null, node.args.map(evaluate));

        // leaf nodes
        case 'Identifier':
            throw new Error('\'' + node.name + ' does not exist in this context');
        case 'Number':
            return parseFloat(node.value);

        // irregular non-leaf nodes
        case 'Brackets':
            return evaluate(node.content);

        default:
            throw new Error('unrecognized node');
    }
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Evaluate a flattened mathjs AST produced by mathjs-transform.js.
 */

var ops = {
    add: function add() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return args.reduce(function (sum, val) {
            return sum + val;
        }, 0);
    },
    unaryMinus: function unaryMinus(arg) {
        return -arg;
    },
    multiply: function multiply() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return args.reduce(function (prod, val) {
            return prod * val;
        }, 1);
    },
    divide: function divide(num, den) {
        return num / den;
    },
    pow: function pow(base, exp) {
        return Math.pow(base, exp);
    }
};

var evaluate = function evaluate(node) {
    switch (node.type) {
        case 'FunctionNode':
            if (node.fn in Math) {
                return Math[node.fn].apply(Math, _toConsumableArray(node.args.map(evaluate)));
            } else {
                throw new Error('Undefined function ' + node.fn);
            }
        case 'SymbolNode':
            throw new Error('Undefined symbol ' + node.name);
        case 'ConstantNode':
            return parseFloat(node.value);
        case 'OperatorNode':
            return ops[node.fn].apply(ops, _toConsumableArray(node.args.map(evaluate)));
        case 'ParenthesisNode':
            return evaluate(node.content);
        default:
            throw new Error('Unrecognized node of type \'' + node.type + '\'');
    }
};

exports.default = evaluate;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = transform;

var _replace = __webpack_require__(0);

var _replace2 = _interopRequireDefault(_replace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var opFns = {
    neg: 'unaryMinus',
    add: 'add',
    mul: 'multiply',
    div: 'divide',
    pow: 'pow'
}; /**
    * Transform a math-ast tree to a mathjs expression tree.
    */

var ops = {
    neg: '-',
    add: '+',
    mul: '*',
    div: '/',
    pow: '^'
};

function transform(ast) {
    return (0, _replace2.default)(ast, {
        enter: function enter() {},
        leave: function leave(node) {
            switch (node.type) {
                case 'Function':
                    return {
                        type: 'FunctionNode',
                        fn: node.fn,
                        args: node.args
                    };
                case 'Identifier':
                    return {
                        type: 'SymbolNode',
                        name: node.name
                    };
                case 'Number':
                    return {
                        type: 'ConstantNode',
                        value: node.value,
                        valueType: 'number'
                    };
                case 'Operation':
                    return {
                        type: 'OperatorNode',
                        op: ops[node.op],
                        fn: opFns[node.op],
                        implicit: !!node.implicit,
                        args: node.args
                    };
                case 'Brackets':
                    return {
                        type: 'ParenthesisNode',
                        content: node.content
                    };
                default:
                    throw new Error('\'' + node.type + '\' node cannot be transformed');
            }
        }
    });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
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


exports.default = parse;

var _nodes = __webpack_require__(1);

var nodes = _interopRequireWildcard(_nodes);

var _replace = __webpack_require__(0);

var _replace2 = _interopRequireDefault(_replace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function isIdentifierToken(token) {
    return token && /[a-zA-Z][a-zA-Z0-9]*/.test(token.value);
}

function isNumberToken(token) {
    return token && /\d*\.\d+|\d+\.\d*|\d+/.test(token.value);
}

var tokenPattern = /([a-zA-Z][a-zA-Z0-9]*)|[\<\>\!]\=|([\(\)\+\-\/\*\^\=\<\>|\,])|(\d*\.\d+|\d+\.\d*|\d+)/;

var relationTokens = ['=', '<', '<=', '>', '>=', '!='];

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

var Parser = function () {
    function Parser() {
        _classCallCheck(this, Parser);
    }

    _createClass(Parser, [{
        key: 'consume',
        value: function consume(expectedValue) {
            var token = this.currentToken();
            if (expectedValue !== undefined) {
                if (!matches(token, expectedValue)) {
                    throw new Error('expected \'' + expectedValue + '\' received \'' + token.value + '\'');
                }
            }
            this.i++;
            return token;
        }
    }, {
        key: 'currentToken',
        value: function currentToken() {
            return this.tokens[this.i];
        }
    }, {
        key: 'parse',
        value: function parse(input) {
            this.i = 0;
            this.tokens = [];
            // TODO: switch from 'match' to 'exec' so that an invalid input raises an error
            // TODO: add 'END_OF_STREAM' token

            var regex = new RegExp(tokenPattern, 'g');

            var match = void 0;
            while ((match = regex.exec(input)) != null) {
                this.tokens.push({
                    value: match[0],
                    start: match.index,
                    end: match.index + match[0].length
                });
            }

            return this.list();
        }
    }, {
        key: 'list',
        value: function list() {
            var items = [this.relationsOrRelationOrExpression()];

            while (true) {
                var token = this.currentToken();

                if (matches(token, ',')) {
                    this.consume(',');
                    items.push(this.relationsOrRelationOrExpression());
                } else {
                    break;
                }
            }

            if (items.length > 1) {
                if (items.every(function (item) {
                    return item.type === 'Relation';
                })) {
                    return {
                        type: 'System', // of equations
                        relations: items
                    };
                } else if (items.every(isExpression)) {
                    return {
                        type: 'Sequence',
                        items: items
                    };
                } else {
                    return {
                        type: 'List',
                        items: items
                    };
                }
            } else {
                return items[0];
            }
        }
    }, {
        key: 'relationsOrRelationOrExpression',
        value: function relationsOrRelationOrExpression() {
            var relations = [];

            var left = void 0;
            var right = void 0;

            left = this.expression();

            while (true) {
                var token = this.currentToken();

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
                    relations: relations
                };
            } else if (relations.length > 0) {
                return relations[0];
            } else {
                return left;
            }
        }
    }, {
        key: 'expression',
        value: function expression() {
            var args = [];

            args.push(this.explicitMul());

            while (true) {
                var token = this.currentToken();

                if (matches(token, '-')) {
                    this.consume('-');
                    args.push(nodes.operationNode('neg', [this.explicitMul()], { wasMinus: true }));
                } else if (matches(token, '+')) {
                    this.consume('+');
                    args.push(this.explicitMul());
                } else {
                    break;
                }
            }

            return args.length > 1 ? nodes.operationNode('add', args) : args[0];
        }
    }, {
        key: 'explicitMul',
        value: function explicitMul() {
            var factors = [];

            factors.push(this.implicitMul());

            while (true) {
                if (matches(this.currentToken(), '*')) {
                    this.consume('*');
                    factors.push(this.implicitMul());
                } else {
                    break;
                }
            }

            return factors.length > 1 ? nodes.operationNode('mul', factors) : factors[0];
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

    }, {
        key: 'implicitMul',
        value: function implicitMul() {
            var factors = [];

            factors.push(this.division());

            while (true) {
                var token = this.currentToken();

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

            return factors.length > 1 ? nodes.operationNode('mul', factors, { implicit: true }) : factors[0];
        }
    }, {
        key: 'division',
        value: function division() {
            var numerator = void 0;
            var denominator = void 0;
            var frac = void 0;

            numerator = this.factor();

            while (true) {
                var token = this.currentToken();

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

    }, {
        key: 'factor',
        value: function factor() {
            var token = this.currentToken();
            var signs = [];

            // handle multiple unary operators
            while (matches(token, '+') || matches(token, '-')) {
                signs.push(token);
                this.consume(token.value);
                token = this.currentToken();
            }

            var base = void 0,
                exp = void 0;

            var start = token.start;

            if (isIdentifierToken(token)) {
                var name = token.value;
                this.consume(name);

                if (matches(this.currentToken(), '(')) {
                    this.consume('(');
                    var args = this.argumentList();
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

            var factor = base;

            // TODO handle exponents separately
            if (matches(this.currentToken(), '^')) {
                this.consume('^');
                exp = this.factor();
                var loc = {
                    start: base.loc.start,
                    end: exp.loc.end
                };
                factor = nodes.operationNode('pow', [base, exp], { loc: loc });
            }

            // Reverse the signs so that we process them from the sign nearest
            // to the factor to the furthest.
            signs.reverse();

            signs.forEach(function (sign) {
                if (isNumber(factor) && factor.value > 0) {
                    factor.value = '' + sign.value + factor.value;
                    factor.loc.start = sign.start;
                } else {
                    var _loc = {
                        start: sign.start,
                        end: factor.loc.end
                    };
                    if (sign.value === '+') {
                        factor = nodes.operationNode('pos', [factor], { loc: _loc });
                    } else {
                        factor = nodes.operationNode('neg', [factor], { loc: _loc });
                    }
                }
            });

            return factor;
        }
    }, {
        key: 'argumentList',
        value: function argumentList() {
            var args = [this.expression()];
            while (true) {
                var token = this.currentToken();
                if (!matches(token, ',')) {
                    break;
                }
                this.consume(',');
                args.push(this.expression());
            }
            return args;
        }
    }]);

    return Parser;
}();

var postProcess = function postProcess(ast) {
    return (0, _replace2.default)(ast, {
        enter: function enter() {},
        leave: function leave(node) {
            if (node.type === 'Operation' && node.op === 'mul' && node.args.length === 2) {
                if (node.args[0].type === 'Number' && node.args[1].type === 'Operation' && node.args[1].op === 'div') {
                    var _node$args$1$args = _slicedToArray(node.args[1].args, 2),
                        numerator = _node$args$1$args[0],
                        denominator = _node$args$1$args[1];

                    if (numerator.type === 'Identifier') {
                        return {
                            type: 'Operation',
                            op: 'div',
                            args: [{
                                type: 'Operation',
                                op: 'mul',
                                args: [node.args[0], numerator],
                                implicit: node.implicit
                            }, denominator]
                        };
                    }
                }
            }
        }
    });
};

var parser = new Parser();

function parse(math) {
    return postProcess(parser.parse(math));
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = print;
/**
 * print - return a string representation of the nodes.
 */

var isNeg = function isNeg(node) {
    return node.type === 'Operation' && node.op === 'neg';
};

var isAdd = function isAdd(node) {
    return node.type === 'Operation' && node.op === 'add';
};

var isMul = function isMul(node) {
    return node.type === 'Operation' && node.op === '*' && node.args.length > 1;
};

function printOperation(node) {
    var result = void 0;

    switch (node.op) {
        case 'add':
            result = print(node.args[0]);
            for (var i = 1; i < node.args.length; i++) {
                var arg = node.args[i];
                if (isNeg(arg) && arg.wasMinus) {
                    result += ' - ' + print(arg.args[0]);
                } else {
                    result += ' + ' + print(arg);
                }
            }
            return result;
        case 'neg':
            return '-' + print(node.args[0]);
        case 'pos':
            return '+' + print(node.args[0]);
        case 'pn':
            throw new Error('we don\'t handle \'pn\' operations yet');
        case 'np':
            throw new Error('we don\'t handle \'np\' operations yet');
        case 'mul':
            if (node.implicit) {
                return node.args.map(print).join(' ');
            } else {
                return node.args.map(print).join(' * ');
            }
        case 'div':
            result = '';
            if (isAdd(node.args[0]) || isMul(node.args[0])) {
                result += '(' + print(node.args[0]) + ')';
            } else {
                result += print(node.args[0]);
            }
            result += ' / ';
            if (isAdd(node.args[1]) || isMul(node.args[1])) {
                result += '(' + print(node.args[1]) + ')';
            } else {
                result += print(node.args[1]);
            }
            return result;
        case 'pow':
            return print(node.args[0]) + '^' + print(node.args[1]);
        case 'fact':
            throw new Error('we don\'t handle \'fact\' operations yet');
        default:
            throw new Error('unrecognized operation');
    }
}

function print(node) {
    switch (node.type) {
        // regular non-leaf nodes
        case 'Relation':
            return node.args.map(print).join(' ' + node.rel + ' ');
        case 'Operation':
            return printOperation(node);
        case 'Function':
            return node.fn + '(' + node.args.map(print).join(', ') + ')';

        // leaf nodes
        case 'Identifier':
            return node.name;
        case 'Number':
            return node.value;

        // irregular non-leaf nodes
        case 'Brackets':
            return '(' + print(node.content) + ')';

        default:
            console.log(node);
            throw new Error('unrecognized node');
    }
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = traverse;
/**
 * traverse - walk all of the nodes in a tree.
 */

function traverse(node, _ref) {
    var enter = _ref.enter,
        leave = _ref.leave;

    switch (node.type) {
        // regular non-leaf nodes
        case 'Relation':
        case 'Operation':
        case 'Function':
            enter(node);
            node.args.forEach(function (arg) {
                return traverse(arg, { enter: enter, leave: leave });
            });
            leave(node);
            break;

        // leaf nodes
        case 'Identifier':
        case 'Number':
            enter(node);
            leave(node);
            break;

        // irregular non-leaf nodes
        case 'Brackets':
            enter(node);
            traverse(node.content, { enter: enter, leave: leave });
            leave(node);
            break;

        case 'List':
        case 'Sequence':
            enter(node);
            node.items.forEach(function (item) {
                return traverse(item, { enter: enter, leave: leave });
            });
            leave(node);
            break;

        case 'System':
            enter(node);
            node.relations.forEach(function (rel) {
                return traverse(rel, { enter: enter, leave: leave });
            });
            leave(node);
            break;

        default:
            throw new Error('unrecognized node: ' + node.type);
    }
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.traverse = exports.transformMathJS = exports.replaceMathJS = exports.replace = exports.print = exports.parse = exports.nodes = exports.evaluateMathJS = exports.evaluate = undefined;

var _evaluate = __webpack_require__(2);

var _evaluate2 = _interopRequireDefault(_evaluate);

var _mathjsEvaluate = __webpack_require__(3);

var _mathjsEvaluate2 = _interopRequireDefault(_mathjsEvaluate);

var _nodes = __webpack_require__(1);

var nodes = _interopRequireWildcard(_nodes);

var _parse = __webpack_require__(5);

var _parse2 = _interopRequireDefault(_parse);

var _print = __webpack_require__(6);

var _print2 = _interopRequireDefault(_print);

var _replace = __webpack_require__(0);

var _replace2 = _interopRequireDefault(_replace);

var _mathjsReplace = __webpack_require__(9);

var _mathjsReplace2 = _interopRequireDefault(_mathjsReplace);

var _mathjsTransform = __webpack_require__(4);

var _mathjsTransform2 = _interopRequireDefault(_mathjsTransform);

var _traverse = __webpack_require__(7);

var _traverse2 = _interopRequireDefault(_traverse);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.evaluate = _evaluate2.default;
exports.evaluateMathJS = _mathjsEvaluate2.default;
exports.nodes = nodes;
exports.parse = _parse2.default;
exports.print = _print2.default;
exports.replace = _replace2.default;
exports.replaceMathJS = _mathjsReplace2.default;
exports.transformMathJS = _mathjsTransform2.default;
exports.traverse = _traverse2.default;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = replace;
/**
 * Traverse and optionally replace nodes in a mathjs AST.
 */

function replace(node, _ref) {
    var enter = _ref.enter,
        leave = _ref.leave;

    var rep = enter(node) || _extends({}, node);

    switch (node.type) {
        // regular non-leaf nodes
        case 'FunctionNode':
        case 'OperatorNode':
            rep = _extends({}, rep, {
                args: rep.args.map(function (arg) {
                    return replace(arg, { enter: enter, leave: leave });
                })
            });
            break;

        // skip leaf nodes
        case 'SymbolNode':
        case 'ConstantNode':
            rep = _extends({}, rep);
            break;

        // irregular non-leaf nodes
        case 'ParenthesisNode':
            rep = _extends({}, rep, {
                content: replace(rep.content, { enter: enter, leave: leave })
            });
            break;

        default:
            throw new Error('unrecognized node');
    }

    return leave(rep) || rep;
}

/***/ })
/******/ ]);