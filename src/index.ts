import {ZodError} from "zod";
import {DynamicLogger, LoggerType} from "./utils/index.js";

export const syslog = new DynamicLogger(LoggerType.SYSTEM)

import("./text/loadText.js").catch(e => {
    // Check if text loads correctly.
    if (e instanceof ZodError) {
        syslog.error("Text validation", "Failed.")
        for (const err of e.errors) {
            syslog.error("Text validation", `${err.path.join(".")}: ${err.message}`);
        }
    } else {
        syslog.error("Text validation", "Unknown error occurred:", e);
    }
    process.exit(1);
}).then(() => {

})
