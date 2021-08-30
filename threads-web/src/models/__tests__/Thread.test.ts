import { AdhocThread } from '../Thread';

describe('AdhocThreads', () => {
    test('cleanAdhocData strips out empty lines', () => {
        const testData = ['', '2021-05-06,19', '', '2021-05-07,20', ''];
        const cleanedData = AdhocThread.cleanAdhocDataFromStrings(testData);
        expect(cleanedData.length).toBe(2);
        expect(cleanedData[0]).toEqual({ date: '2021-05-06', rawValue: '19' });
        expect(cleanedData[1]).toEqual({ date: '2021-05-07', rawValue: '20' });
    });

    test('cleanAdhocData trims both ends of both fields', () => {
        const testData = ['  2021-05-06   ,       19   '];
        const cleanedData = AdhocThread.cleanAdhocDataFromStrings(testData);
        expect(cleanedData.length).toBe(1);
        expect(cleanedData[0]).toEqual({ date: '2021-05-06', rawValue: '19' });
    });

    test('cleanAdhocData accepts bad data', () => {
        const testData = ['2021-05-,test', ',', 'fdasdf'];
        const cleanedData = AdhocThread.cleanAdhocDataFromStrings(testData);
        expect(cleanedData.length).toBe(3);
        expect(cleanedData[0]).toEqual({ date: '2021-05-', rawValue: 'test' });
        expect(cleanedData[1]).toEqual({ date: undefined, rawValue: undefined });
        expect(cleanedData[2]).toEqual({ date: 'fdasdf', rawValue: undefined });
    });

    test('isValidAdhocData returns false if one line has undefined date', () => {
        const testData = [
            { date: '2021-02-01', rawValue: '5.0' },
            { date: undefined, rawValue: '6' },
            { date: '2021-02-03', rawValue: '9' },
        ];
        expect(AdhocThread.isValidAdhocData(testData)).toBe(false);
    });

    test('isValidAdhocData returns false if one line has malformed date', () => {
        const testData = [
            { date: '2021-02-01', rawValue: '5.0' },
            { date: '-02-03', rawValue: '6' },
            { date: '2021-02-03', rawValue: '9' },
        ];
        expect(AdhocThread.isValidAdhocData(testData)).toBe(false);
    });

    test('isValidAdhocData returns false if one line has missing value', () => {
        const testData = [
            { date: '2021-02-01', rawValue: '5.0' },
            { date: '2021-02-02', rawValue: undefined },
            { date: '2021-02-03', rawValue: '9' },
        ];
        expect(AdhocThread.isValidAdhocData(testData)).toBe(false);
    });

    test('isValidAdhocData returns false if one line has malformed value', () => {
        const testData = [
            { date: '2021-02-01', rawValue: '5.0' },
            { date: '2021-02-02', rawValue: 'test-string' },
            { date: '2021-02-03', rawValue: '9' },
        ];
        expect(AdhocThread.isValidAdhocData(testData)).toBe(false);
    });

    test('isValidAdhocData returns true if data is good', () => {
        const testData = [
            { date: '2021-02-01', rawValue: '5.0' },
            { date: '2021-02-02', rawValue: '13.9' },
            { date: '2021-02-03', rawValue: '9' },
        ];
        expect(AdhocThread.isValidAdhocData(testData)).toBe(true);
    });

    test('isValidAdhocData returns true if data is empty', () => {
        expect(AdhocThread.isValidAdhocData([])).toBe(true);
    });
});
