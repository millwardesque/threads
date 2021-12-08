import { Formula } from '../Formula';

describe('Formula charType', () => {
    it('Letter when character in a-z range', () => {
        expect(Formula.charType('a')).toBe('letter');
        expect(Formula.charType('z')).toBe('letter');
    });

    it('Letter when character in A-Z range', () => {
        expect(Formula.charType('A')).toBe('letter');
        expect(Formula.charType('Z')).toBe('letter');
    });

    it('Number when character in 0-9 range', () => {
        expect(Formula.charType('0')).toBe('number');
        expect(Formula.charType('9')).toBe('number');
    });

    it('Symbol when character is *, +, -, /, (, )', () => {
        expect(Formula.charType('*')).toBe('symbol');
        expect(Formula.charType('+')).toBe('symbol');
        expect(Formula.charType('-')).toBe('symbol');
        expect(Formula.charType('/')).toBe('symbol');
        expect(Formula.charType('(')).toBe('symbol');
        expect(Formula.charType(')')).toBe('symbol');
    });

    it('threadmarker when character is $', () => {
        expect(Formula.charType('$')).toBe('threadmarker');
    });

    it('Whitespace when character is a space', () => {
        expect(Formula.charType(' ')).toBe('whitespace');
    });

    it('Empty when character is empty string', () => {
        expect(Formula.charType('')).toBe('empty');
    });

    it('Other when character is anything else', () => {
        expect(Formula.charType('#')).toBe('other');
        expect(Formula.charType('!')).toBe('other');
    });
});

describe('Formula isUsefulChar', () => {
    it('true for number, letter, threadmarker, symbol', () => {
        expect(Formula.isUsefulChar('a')).toBe(true);
        expect(Formula.isUsefulChar('3')).toBe(true);
        expect(Formula.isUsefulChar('$')).toBe(true);
        expect(Formula.isUsefulChar('*')).toBe(true);
    });
    it('false for empty, whitespace, other', () => {
        expect(Formula.isUsefulChar('')).toBe(false);
        expect(Formula.isUsefulChar(' ')).toBe(false);
        expect(Formula.isUsefulChar('_')).toBe(false);
    });
});

describe('Formula isNewToken', () => {
    it('False when number transitions to number', () => {
        expect(Formula.isNewToken(['1'], '2')).toBe(false);
    });
    it('False when letter transitions to letter', () => {
        expect(Formula.isNewToken(['a'], 'd')).toBe(false);
    });
    it('True when symbol transitions to symbol', () => {
        expect(Formula.isNewToken(['/'], '*')).toBe(true);
    });
    it('False when thread-marker transitions to number', () => {
        expect(Formula.isNewToken(['$'], '3')).toBe(false);
    });
    it('True when thread-marker transitions to non-number', () => {
        expect(Formula.isNewToken(['$'], ' ')).toBe(true);
        expect(Formula.isNewToken(['$'], '*')).toBe(true);
        expect(Formula.isNewToken(['$'], 'a')).toBe(true);
        expect(Formula.isNewToken(['$'], 'Z')).toBe(true);
    });
    it('False when string is empty', () => {
        expect(Formula.isNewToken(['1'], '')).toBe(false);
    });
    it('True when number transitions to letter', () => {
        expect(Formula.isNewToken(['1'], 'a')).toBe(true);
    });
    it('True when number transitions to symbol', () => {
        expect(Formula.isNewToken(['1'], '/')).toBe(true);
    });
    it('True when letter transitions to number', () => {
        expect(Formula.isNewToken(['a'], '3')).toBe(true);
    });
    it('True when letter transitions to symbol', () => {
        expect(Formula.isNewToken(['N'], '+')).toBe(true);
    });
    it('True when symbol transitions to letter', () => {
        expect(Formula.isNewToken(['*'], 'a')).toBe(true);
    });
    it('True when symbol transitions to number', () => {
        expect(Formula.isNewToken(['-'], '3')).toBe(true);
    });
    it('True when anything transitions to space', () => {
        expect(Formula.isNewToken(['7'], ' ')).toBe(true);
        expect(Formula.isNewToken(['D'], ' ')).toBe(true);
        expect(Formula.isNewToken([')'], ' ')).toBe(true);
    });
    it('False when an empty token transitions to anything', () => {
        expect(Formula.isNewToken([], 'R')).toBe(false);
        expect(Formula.isNewToken([], '3')).toBe(false);
        expect(Formula.isNewToken([], '+')).toBe(false);
        expect(Formula.isNewToken([], ' ')).toBe(false);
        expect(Formula.isNewToken([], ' ')).toBe(false);
        expect(Formula.isNewToken([], '')).toBe(false);
        expect(Formula.isNewToken([], '_')).toBe(false);
    });
});

describe('Formula tokenType', () => {
    it('number is number', () => {
        expect(Formula.tokenType('123')).toBe('number');
    });
    it('word is word', () => {
        expect(Formula.tokenType('abc')).toBe('word');
        expect(Formula.tokenType('XYZ')).toBe('word');
    });
    it('single symbol is operator', () => {
        expect(Formula.tokenType('+')).toBe('operator');
    });
    it('$ is undefined', () => {
        expect(Formula.tokenType('$')).toBe(undefined);
    });
    it('$### is a thread reference', () => {
        expect(Formula.tokenType('$12')).toBe('threadref');
    });
});

describe('Formula tokenize', () => {
    it("Doesn't split inside numbers or words", () => {
        expect(new Formula('123').tokenize()).toEqual([{ type: 'number', value: '123' }]);
        expect(new Formula('abcd').tokenize()).toEqual([{ type: 'word', value: 'abcd' }]);
    });

    it('Ignores empty chars', () => {
        expect(new Formula('').tokenize()).toEqual([]);
        expect(new Formula('   ').tokenize()).toEqual([]);
        expect(new Formula(' 123 ').tokenize()).toEqual([{ type: 'number', value: '123' }]);
    });

    it('Splits when space is read', () => {
        expect(new Formula('123 abc').tokenize()).toEqual([
            { type: 'number', value: '123' },
            { type: 'word', value: 'abc' },
        ]);
    });

    it('Splits when number ends', () => {
        expect(new Formula('123abc').tokenize()).toEqual([
            { type: 'number', value: '123' },
            { type: 'word', value: 'abc' },
        ]);
        expect(new Formula('123+').tokenize()).toEqual([
            { type: 'number', value: '123' },
            { type: 'operator', value: '+' },
        ]);
    });

    it('Splits when symbol ends', () => {
        expect(new Formula('-123').tokenize()).toEqual([
            { type: 'operator', value: '-' },
            { type: 'number', value: '123' },
        ]);
    });
});
