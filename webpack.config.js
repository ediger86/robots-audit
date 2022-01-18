const path = require("path");

module.exports = {
    entry: "./cli/index.js",
    target: "core",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist")
    },
}