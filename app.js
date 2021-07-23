var express = require("express");
var app = express();
const configRouter = require("./routes/config.js");

const cors = require("cors");
app.use(express.json()); //body- parser 필요 없다// + 앞에서 소환해주면 app.js 거치면서 다음 모듈에도 적용 됌

app.get("/", function (req, res, next) {
  next();
});
app.use("/config", configRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
