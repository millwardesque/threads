import { NextFunction, Request, Response, Router } from 'express';
import DataSourceController from '../../controllers/DataSourceController';
import { DataSourceDefinition, DataSourceMap, GetFilterResults, QueryRequest } from '../../models/DataSourceDefinition';

class DataSourceRouter {
    private _router = Router();
    private _controller = DataSourceController;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.get('/', (_req: Request, res: Response, next: NextFunction) => {
            const sourceDefinitions: DataSourceMap = this._controller.getAllSourceDefinitions();
            res.status(200).json(sourceDefinitions);
            next();
        });
        
        this._router.get('/:sourceId', (req: Request, res: Response, next: NextFunction) => {
            const sourceId: string = req.params['sourceId'];
            const sourceDefinition: DataSourceDefinition | undefined = this._controller.getSourceDefinition(sourceId);
            if (sourceDefinition) {
                res.status(200).json(sourceDefinition);
            }
            else {
                res.status(404).json({
                    message: `No source found with id ${sourceId}`,
                });
            }

            next();
        });

        this._router.post('/:sourceId/query', (req: Request, res: Response, next: NextFunction) => {
            const sourceId: string = req.params['sourceId'];
            const sourceDefinition: DataSourceDefinition | undefined = this._controller.getSourceDefinition(sourceId);
            if (!sourceDefinition) {
                res.status(404).json({
                    message: `No source found with id ${sourceId}`,
                });
            }
            else {
                const query: QueryRequest = req.body as QueryRequest;
                const results = this._controller.query(sourceId, query);
                res.status(200).json(results);
            }

            next();
        });

        this._router.get('/:sourceId/filters', (req: Request, res: Response, next: NextFunction) => {
            const sourceId: string = req.params['sourceId'];
            const filterValues: GetFilterResults | undefined = this._controller.getSourceFilterValues(sourceId);
            if (filterValues) {
                res.status(200).json(filterValues);
            }
            else {
                res.status(404).json({
                    message: `No source found with id ${sourceId}`,
                });
            }

            next();
        });
    }
}

export default new DataSourceRouter().router;