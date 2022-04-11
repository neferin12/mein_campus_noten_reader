import {Logger} from "tslog";


// @ts-ignore
export const log: Logger = new Logger({minLevel: process.env.LOG_LEVEL || "info", displayFilePath: "hidden", displayFunctionName: false});
