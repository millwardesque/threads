import path from 'path';
import { CsvQueryProcessor } from '../CsvQueryProcessor';
import { loadSourcesFromJson } from '../DataSourceDefinition';

/***
 * TODO
 * Plot is not found
 * Aggregate unfiltered / unsegmented via plot definition
 * Assert aggregation calls use canQuery
 * File data doesn't match structure in source
 * Date reformat to Y-m-d
 */

test('can open a file given a source', () => {
    const sourceFile = path.join(__dirname, '__data__', 'HappyPath.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    const result = processor.load(sources[0]);
    expect(result.error).toBeUndefined();
    expect(result.hasError).toBe(false);
});

test("file in source doesn't exist", () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvFileInSourceDoesntExist.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    const result = processor.load(sources[0]);
    expect(result.hasError).toBe(true);
    expect(result.error).toContain("wasn't found");
});

test("file not specified in source doesn't exist", () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvFileInSourceNotProvided.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    const result = processor.load(sources[0]);
    expect(result.hasError).toBe(true);
    expect(result.error).toContain("doesn't have a file specified");
});

test("csv processor: source isn't a csv", () => {
    const sourceFile = path.join(__dirname, '__data__', 'SourceIsntACsv.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    const result = processor.load(sources[0]);
    expect(result.hasError).toBe(true);
    expect(result.error).toContain("isn't a CSV file");
});

test('can-query: no source loaded', () => {
    const processor = new CsvQueryProcessor();
    const results = processor.canQuery('fadfasdfasf');

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("No datasource is loaded");
});

test('can-query: measure does not exist', () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvSum.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.canQuery('fadfasdfasf');

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("doesn't exist on this source");
});

test('can-query: measure is undefined', () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvSum.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.canQuery();

    expect(results.hasError).toBe(false);
});

test('can query data with sum', () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvSum.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.querySum('test_metric');

    expect(results.hasError).toBe(false);
    expect(results.data['2021-05-13']).toBe(7);
    expect(results.data['2021-05-14']).toBe(5);
});

test('can query data with count', () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvCount.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryCount();

    expect(results.hasError).toBe(false);
    expect(results.data['2021-05-13']).toBe(1);
    expect(results.data['2021-05-14']).toBe(4);
});

test('can query data with average', () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvAverage.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryAverage('test_metric');

    expect(results.hasError).toBe(false);
    expect(results.data['2021-05-13']).toBe(1.5);
    expect(results.data['2021-05-14']).toBe(6);
});

test('row measure is not numeric', () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvSumNonNumeric.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.querySum('test_metric');

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("Measure is not a number: 'abc'");
});

test('can query data by plot definition', () => {
    const sourceFile = path.join(__dirname, '__data__', 'CsvQueryByPlot.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByPlot('sum_test_metric')

    expect(results.hasError).toBe(false);
    expect(results.data['2021-05-13']).toBe(7);
    expect(results.data['2021-05-14']).toBe(5);
});