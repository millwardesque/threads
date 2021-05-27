import { Router } from 'express';
import DataSourceRouter from './datasource/DataSourceRouter';

class MasterRouter {
    private _router = Router();
    private _dataSourceRouter = DataSourceRouter;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.use('/datasource', this._dataSourceRouter );
    }
};

export = new MasterRouter().router;