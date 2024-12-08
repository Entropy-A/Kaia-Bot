import {ZodError} from "zod";

// Check if text loads correctly
import("./text/loadText.js").catch(e => {
    if (e instanceof ZodError) {
        console.error("Validation failed at the following paths:"); // TODO: better Log
        for (const err of e.errors) {
            console.error(`Path: ${err.path.join(".")} - Message: ${err.message}`);
        }
    } else {
        console.error("Unknown error occurred:", e);
    }
})
