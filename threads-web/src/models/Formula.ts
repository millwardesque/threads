type TokenType = 'number' | 'word' | 'operator' | 'threadref' | undefined;
type CharType = 'number' | 'letter' | 'symbol' | 'threadmarker' | 'whitespace' | 'other' | 'empty';

const NUMBER_RANGE = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
const ALPHA_LOWER_RANGE = ['a'.charCodeAt(0), 'z'.charCodeAt(0)];
const ALPHA_UPPER_RANGE = ['A'.charCodeAt(0), 'Z'.charCodeAt(0)];
const SYMBOLS = ['*', '/', '+', '-', '(', ')'];

export interface FormulaToken {
    type: TokenType;
    value: string;
}

export class Formula {
    formula: string;

    constructor(formula: string) {
        this.formula = formula;
    }

    static charType(char: string): CharType {
        const charCode = char.charCodeAt(0);
        if (charCode >= ALPHA_LOWER_RANGE[0] && charCode <= ALPHA_LOWER_RANGE[1]) {
            return 'letter';
        } else if (charCode >= ALPHA_UPPER_RANGE[0] && charCode <= ALPHA_UPPER_RANGE[1]) {
            return 'letter';
        } else if (charCode >= NUMBER_RANGE[0] && charCode <= NUMBER_RANGE[1]) {
            return 'number';
        } else if (char[0] === '$') {
            return 'threadmarker';
        } else if (SYMBOLS.includes(char[0])) {
            return 'symbol';
        } else if (char[0] === ' ') {
            return 'whitespace';
        } else if (char === '') {
            return 'empty';
        } else {
            return 'other';
        }
    }

    static isUsefulChar(char: string) {
        return ['number', 'letter', 'symbol', 'threadmarker'].includes(Formula.charType(char));
    }

    static isNewToken(token: string[], nextChar: string): boolean {
        if (token.length === 0) {
            return false;
        }

        const lastChar = token[token.length - 1];
        const lastCharType = Formula.charType(lastChar);
        const nextCharType = Formula.charType(nextChar);

        if (nextCharType === 'empty') {
            return false;
        } else if (lastCharType === 'threadmarker' && nextCharType === 'number') {
            return false;
        } else if (lastCharType === 'symbol' && nextCharType === 'symbol') {
            return true;
        } else {
            return lastCharType !== nextCharType;
        }
    }

    static tokenType(token: string): TokenType {
        let typeSoFar: TokenType = undefined;
        for (const char of token) {
            let typeFromChar: TokenType = undefined;
            switch (Formula.charType(char)) {
                case 'number':
                    typeFromChar = 'number';
                    break;
                case 'letter':
                    typeFromChar = 'word';
                    break;
                case 'symbol':
                    typeFromChar = 'operator';
                    break;
                case 'threadmarker':
                    typeFromChar = 'threadref';
                    break;
                default:
                    return undefined;
            }

            if (typeSoFar === undefined) {
                typeSoFar = typeFromChar;
            } else if (typeSoFar === 'threadref' && typeFromChar === 'number') {
                continue;
            } else if (typeSoFar !== typeFromChar) {
                return undefined;
            }
        }

        if (typeSoFar === 'threadref' && token.length === 1) {
            return undefined;
        }
        return typeSoFar;
    }

    tokenize(): FormulaToken[] {
        let currentToken: string[] = [];
        const tokens: FormulaToken[] = [];
        for (const char of this.formula) {
            if (Formula.isNewToken(currentToken, char)) {
                const tokenValue = currentToken.join('');
                const tokenType = Formula.tokenType(tokenValue);
                if (tokenType !== undefined) {
                    tokens.push({
                        type: tokenType,
                        value: tokenValue,
                    });
                }
                currentToken = [];

                if (Formula.isUsefulChar(char)) {
                    currentToken.push(char);
                }
            } else {
                if (Formula.isUsefulChar(char)) {
                    currentToken.push(char);
                }
            }
        }

        if (currentToken.length) {
            const tokenValue = currentToken.join('');
            const tokenType = Formula.tokenType(tokenValue);
            if (tokenType !== undefined) {
                tokens.push({
                    type: tokenType,
                    value: tokenValue,
                });
            }
        }
        return tokens;
    }
}
