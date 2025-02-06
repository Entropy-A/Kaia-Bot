import {ExpectedError} from "../utils/index.js";

export type Result<ReturnType> =
    | {success: true, data: ReturnType}
    | {success: false, error: Error | ExpectedError}
