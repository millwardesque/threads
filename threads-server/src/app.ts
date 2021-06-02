import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response, } from 'express';

import ErrorHandler from './models/ErrorHandler';
import MasterRouter from './routers/MasterRouter';

dotenv.config({
    path: '.env'
});

/**
 * Express server application class
 */
class Server {
    public app = express();   
    public router = MasterRouter; 
}

const server = new Server();

server.app.use(cors());
server.app.use('/api', server.router);

server.app.use((err: ErrorHandler, _req: Request, res: Response, next: NextFunction) => {
    res.status(err.statusCode || 500)
       .json({
        status: 'error',
        statusCode: err.statusCode,
        message: err.message
    });
    next();
});

((port = process.env.APP_PORT || 5000) => {
    server.app.listen(port, () => console.log(`> Listening on port ${port}`));
})();