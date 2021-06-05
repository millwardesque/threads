import path from 'path';
import { loadSourcesFromJson, LoadSourcesReturn } from '../DataSourceDefinition';

/**
 * @todo
 * Source doesn't fit shape of types
 */

test('loadSourcesFromJson missing file', () => {
    const result: LoadSourcesReturn = loadSourcesFromJson('fkldflifjlie');
    expect(result.hasError === true);
    expect(result.sources).toBeUndefined();
});

test('loadSourcesFromJson happy path', () => {
    const sourceFile = path.join(__dirname, '__data__', 'HappyPath.json');
    const result: LoadSourcesReturn = loadSourcesFromJson(sourceFile);
    expect(result.hasError === false);
    expect(Object.keys(result.sources ?? {}).length).toBe(1);
});

test('loadSourcesFromJson empty file', () => {
    const sourceFile = path.join(__dirname, '__data__', 'EmptyFile.json');
    const result: LoadSourcesReturn = loadSourcesFromJson(sourceFile);
    expect(result.hasError === false);
    expect(Object.keys(result.sources ?? {}).length).toBe(0);
});

test('loadSourcesFromJson empty JSON array in file', () => {
    const sourceFile = path.join(__dirname, '__data__', 'EmptyJson.json');
    const result: LoadSourcesReturn = loadSourcesFromJson(sourceFile);
    expect(Object.keys(result.sources ?? {}).length).toBe(0);
});

test('loadSourcesFromJson malformed JSON', () => {
    const sourceFile = path.join(__dirname, '__data__', 'MalformedFile.json');
    const result: LoadSourcesReturn = loadSourcesFromJson(sourceFile);
    expect(result.hasError === true);
    expect(result.sources).toBeUndefined();
});
