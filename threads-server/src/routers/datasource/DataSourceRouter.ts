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

            next();
        });
    }
}

export default new DataSourceRouter().router;