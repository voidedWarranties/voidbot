require = require("esm")(module); // eslint-disable-line no-global-assign
require("dotenv").config();

module.exports = require("./src/web/index");