const express = require('express');
const process = require('process');
const fs = require('fs');

module.exports = (port) => {
    const app = express();
    app.use(express.static(process.cwd()));
    app.listen(port || 3600, () => {
        console.log(`server is running at port http://localhost:${port || 3600}/index.html`);
    });

}