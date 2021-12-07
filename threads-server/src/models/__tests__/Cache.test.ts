import { Md5 } from 'ts-md5/dist/md5';

import { Cache, CacheData } from '../Cache';
import { QueryRequest } from '../DataSourceDefinition';

describe('Cache', () => {
    let cache: Cache = new Cache();
    let sourceId: string = 'test-source-id';
    const queryRequest: QueryRequest = {
        plotId: 'test-plot-it',
        dimensionExploder: 'test-exploder',
    };
    const testData: CacheData = {
        testDimension: {
            '2021-01-01': 5,
        },
    };

    beforeEach(() => {
        cache = new Cache();
    });

    it('should compute a hashkey using MD5', () => {
        const expectedKey = Md5.hashStr(sourceId + '--' + JSON.stringify(queryRequest));
        expect(cache.computeCacheKey(sourceId, queryRequest)).toEqual(expectedKey);
    });

    it("exists() returns false if the cached key doesn't exist", () => {
        expect(cache.exists(sourceId, queryRequest)).toEqual(false);
    });

    it("get() returns undefined if the cached key doesn't exist", () => {
        expect(cache.get(sourceId, queryRequest)).toBeUndefined();
    });

    it('set() stores new data in the cache', () => {
        expect(cache.get(sourceId, queryRequest)).toEqual(undefined);
        cache.set(sourceId, queryRequest, testData);
        expect(cache.get(sourceId, queryRequest)).toEqual(testData);
    });

    it("exists() returns true if the cached key does exist and the time hasn't expired", () => {
        cache.set(sourceId, queryRequest, testData);
        expect(cache.exists(sourceId, queryRequest)).toEqual(true);
    });

    it('get() returns the cached data if the cached key does exist', () => {
        cache.set(sourceId, queryRequest, testData);
        expect(cache.get(sourceId, queryRequest)).toEqual(testData);
    });

    it.todo('exists returns false if the key exists but the file timestamp is later than the cache timestamp');
    it.todo('get() calls exists()');
});
