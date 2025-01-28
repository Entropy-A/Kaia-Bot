// Better error catching.
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

import("./utils/log/logger.js")
import("./text/loadText.js")
import("./bootstrap/client.js")
import("./bootstrap/database.js")