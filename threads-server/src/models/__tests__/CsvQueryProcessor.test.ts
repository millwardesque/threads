import path from 'path';
import { CsvQueryProcessor } from '../CsvQueryProcessor';
import { loadSourcesFromJson, QueryRequest } from '../DataSourceDefinition';

/***
 * TODO
 * Test coverage: queryByQueryRequest calls canQuery
 * Test coverage: sum, count, and average call filterData
 * Test coverage: sum, count, and average handle exploding
 * Test CSV file data doesn't match structure in source
 * Refactor common pre/post functionality out of aggregates?
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
    const query: QueryRequest = {
        plotId: 'sum_test_metric'
    };
    const results = processor.canQuery(query);

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("No datasource is loaded");
});

test('can-query: measure does not exist', () => {
    const query: QueryRequest = {
        plotId: 'sum_test_metric'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvSumNoSuchMeasure.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.canQuery(query);

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("doesn't exist on this source");
});

test('can query data with sum', () => {
    const query: QueryRequest = {
        plotId: 'sum_test_metric'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvSum.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(false);
    expect(results.data['*']['data']['2021-05-13']).toBe(7);
    expect(results.data['*']['data']['2021-05-14']).toBe(5);
});

test('can query data with count', () => {
    const query: QueryRequest = {
        plotId: 'count_test_metric'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvCount.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(false);
    expect(results.data['*']['data']['2021-05-13']).toBe(1);
    expect(results.data['*']['data']['2021-05-14']).toBe(4);
});

test('can query data with average', () => {
    const query: QueryRequest = {
        plotId: 'average_test_metric'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvAverage.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();

    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(false);
    expect(results.data['*']['data']['2021-05-13']).toBe(1.5);
    expect(results.data['*']['data']['2021-05-14']).toBe(6);
});

test('row measure is not numeric', () => {
    const query: QueryRequest = {
        plotId: 'sum_test_metric'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvSumNonNumeric.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("Measure is not a number: 'abc'");
});

test('can query data by QueryRequest', () => {
    const query: QueryRequest = {
        plotId: 'sum_test_metric'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvQueryByQueryRequest.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(false);
    expect(results.data['*']['data']['2021-05-13']).toBe(7);
    expect(results.data['*']['data']['2021-05-14']).toBe(5);
});

test("query fails because plot doesn't exist", () => {
    const query: QueryRequest = {
        plotId: 'fakfjkle'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvQueryByPlot.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("Plot");
    expect(results.error).toContain("doesn't exist on this source");
});

test("filter data - passes", () => {
    const processor = new CsvQueryProcessor();
    const testRow = {
        date: '2021-05-03',
        test_dimension: 'dimension 1',
    };
    const filters = {
        test_dimension: ['dimension 1']
    };
    expect(processor.filterData(testRow, filters)).toBeTruthy();
});

test("filter data - doesn't pass", () => {
    const processor = new CsvQueryProcessor();
    const testRow = {
        date: '2021-05-03',
        test_dimension: 'dimension 1',
    };
    const filters = {
        test_dimension: ['dimension 2']
    };
    expect(processor.filterData(testRow, filters)).toBeFalsy();
});

test("filter data - multiple filters", () => {
    const processor = new CsvQueryProcessor();
    const testRow = {
        date: '2021-05-03',
        test_dimension: 'dimension 1',
    };
    const filters = {
        test_dimension: ['dimension 1', 'dimension 3'],
    };
    expect(processor.filterData(testRow, filters)).toBeTruthy();
});


test("filter doesn't exist in source", () => {
    const query: QueryRequest = {
        plotId: 'sum_test_metric',
        dimensionFilters: {
            flibbertygibbets: ['dimension 1'],
        },
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvQueryFiltered.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("Filter dimension doesn't exist on this source: 'flibbertygibbets'");
});

test('can filter query data', () => {
    const query: QueryRequest = {
        plotId: 'sum_test_metric',
        dimensionFilters: {
            test_dimension: ['dimension 1', 'dimension 3'],
        },
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvQueryFiltered.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(false);
    expect(results.data['*']['data']['2021-05-13']).toBe(6);
    expect(results.data['*']['data']['2021-05-14']).toBe(13);
});

test("dimesion exploder doesn't exist in source", () => {
    const query: QueryRequest = {
        plotId: 'sum_test_metric',
        dimensionExploder: 'flibbertygibbets'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvQueryExploded.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(true);
    expect(results.error).toContain("Dimension exploder doesn't exist on this source: 'flibbertygibbets'");
});

test('can aggregate query data', () => {
    const query: QueryRequest = {
        plotId: 'sum_test_metric',
        dimensionExploder: 'test_dimension'
    };
    const sourceFile = path.join(__dirname, '__data__', 'CsvQueryExploded.json');
    const sources = Object.values(loadSourcesFromJson(sourceFile).sources!);
    const processor = new CsvQueryProcessor();
    processor.load(sources[0]);
    const results = processor.queryByQueryRequest(query);

    expect(results.hasError).toBe(false);
    expect(results.data['dimension 1']['data']['2021-05-13']).toBe(5);
    expect(results.data['dimension 2']['data']['2021-05-13']).toBe(2);
    expect(results.data['dimension 1']['data']['2021-05-14']).toBe(4);
    expect(results.data['dimension 2']['data']['2021-05-14']).toBe(1);
});