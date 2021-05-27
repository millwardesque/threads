import { NextFunction, Request, Response, Router } from 'express';
import DataSourceController from '../../controllers/DataSourceController';
import { DataSourceDefinition } from '../../models/DataSourceDefinition';

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
        });

        this._router.get('/:sourceId/dimension-values/:dimensionId', (req: Request, res: Response, next: NextFunction) => {
            const sourceId: string = req.params['sourceId'];
            const dimensionId: string = req.params['dimensionId'];
            const dimensionValues: string[] | undefined = this._controller.getSourceDimensionValues(sourceId, dimensionId);
            if (dimensionValues) {
                res.status(200).json(dimensionValues);
            }
            else {
                res.status(404).json({
                    message: `No source / dimension found with source id ${sourceId} and dimension id ${dimensionId}`,
                });
            }
        });
    }
}

export default new DataSourceRouter().router;