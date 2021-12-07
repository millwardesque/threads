import { Md5 } from 'ts-md5/dist/md5';
import { LineData, QueryRequest } from './DataSourceDefinition';

export interface CacheData {
    [dimension: string]: LineData;
}

export interface CacheEntry {
    createdAt: Date;
    data: CacheData;
}

export class Cache {
    cache: { [key: string]: CacheEntry };

    constructor() {
        this.cache = {};
    }

    computeCacheKey(sourceId: string, query: QueryRequest): string {
        const key = Md5.hashStr(sourceId + '--' + JSON.stringify(query));
        return key;
    }

    exists(sourceId: string, query: QueryRequest): boolean {
        const key = this.computeCacheKey(sourceId, query);
        return key in this.cache;
    }

    get(sourceId: string, query: QueryRequest): CacheData | undefined {
        const key = this.computeCacheKey(sourceId, query);
        if (!(key in this.cache)) {
            return undefined;
        } else {
            return this.cache[key].data;
        }
    }

    set(sourceId: string, query: QueryRequest, dataToCache: CacheData) {
        const key = this.computeCacheKey(sourceId, query);
        this.cache[key] = {
            createdAt: new Date(),
            data: dataToCache,
        };
    }
}
