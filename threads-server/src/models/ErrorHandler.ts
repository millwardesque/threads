import { SSL_OP_NO_QUERY_MTU } from "constants";

export default class ErrorHandler extends Error {
    constructor(
        public statusCode: number,
        public message: string
    ) {
        super();
    }
}