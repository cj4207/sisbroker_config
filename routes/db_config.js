const mDbCon = require("mariadb");

module.exports = {
  oraDb: {
    user: "hr",
    password: "hr",
    connectString:
      "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=3.35.217.210)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=xe)))",
  },
  mariaDb: mDbCon.createPool({
    host: "127.0.0.1",
    port: 3308,
    user: "root",
    password: "1234",
    database: "sisbroker",
    connectTimeout: 10,
  }),
};
