const { json } = require("body-parser");
const express = require("express");
const app = express();
const router = express.Router();
const logger = require("../config/winston");

const conmaria = require("./db_config.js");

//! db connect!!
const dbAccessLog = "info";
//! clinetkey connect
const clienKeyId = 1;

const mariaConnQuery = async (query) => {
  let marconn;
  try {
    marconn = await conmaria.mariaDb.getConnection();
    const rows = await marconn.query(query);
    logger.info("query completed");
    return rows;
  } catch (e) {
    //요까지 promise pending 상태  resolve 해줘야 함
    logger.error(`${e}`);
    console.log(e);
  }
};

//*job create
router.post("/", async (req, res, next) => {
  try {
    const data = req.body;

    /// query result --> array --> array 마지막자료 크론탭에서 초부분 가져와서 +5 --> 새로운 크론탭에 더해주기
    // whether query results exist
    try {
      let second = await mariaConnQuery(
        `SELECT crontab from config where client_key_id = ${clienKeyId}`
      );
    } catch {
      let second = undefined;
    }

    if (!second) {
      second = "05";
    } else {
      second = (
        parseInt(second.slice(-1)[0]["crontab"].substring(0, 2)) + 5
      ).toString();
    }

    const result =
      await mariaConnQuery(`INSERT INTO config(db_access_log, endpoint,data_type,client_key_id,password,term,crontab,jobname,username,action) \
    values(
      "${dbAccessLog}",
      "${data.endpoint}/${data.action}",
      "${data.data_type}",
      ${clienKeyId},
      "${data.password}",
      "${data.term}",
      "${second + " " + data.crontab}",
      "${data.jobname}",
      "${data.username}",
      "${data.action}")`);

    res.status(200).json({
      data: data,
      success: true,
      message: "data inserted!",
    });
    logger.info(
      `${data.endpoint} ${data.term} ${data.data_type} ${data.jobname} ${data.username} ${data.action} created!`
    );
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job creation failed!`);
  }
});

//*job list --- done
router.get("/list", async (req, res, next) => {
  try {
    const result = await mariaConnQuery(
      `SELECT * FROM config WHERE client_key_id = ${clienKeyId}`
    );

    res.status(200).json({
      result: result,
      success: true,
    });
    logger.info(`clienKeyId : ${clienKeyId} list call`);
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job list call failed!`);
  }
});

//*job update -- 전체 자료 주는 경우 --done
router.post("/:jobId", async (req, res, next) => {
  try {
    const jobId = req.params["jobId"];
    const data = req.body;

    let second = await mariaConnQuery(
      `SELECT crontab from config where id = ${jobId}`
    );
    second = parseInt(
      second.slice(-1)[0]["crontab"].substring(0, 2)
    ).toString();

    const result = await mariaConnQuery(`UPDATE config SET
      endpoint  = "${data.endpoint}/${data.action}",
      data_type = "${data.data_type}",
      password  = "${data.password}",
      term      = "${data.term}",
      crontab   = "${second + " " + data.crontab}",
      jobname   = "${data.jobname}",
      username  = "${data.username}",
      action    = "${data.action}" where id = ${jobId} `);

    res.status(200).json({
      success: true,
      message: "updated!",
    });
    logger.info(
      `${data.term} ${data.data_type} ${data.jobname} ${data.username} ${data.action} has been updated! `
    );
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job list update failed`);
  }
});

//*job delete -- done
router.delete("/:jobId", async (req, res, next) => {
  try {
    const jobId = parseInt(req.params["jobId"]);
    const result = await mariaConnQuery(
      `DELETE FROM config where id = ${jobId}`
    );
    console.log(typeof jobId);

    res.status(200).json({
      success: true,
      message: "deleted!",
    });
    logger.info(`jobId : ${jobId} deleted!`);
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job deletion failed!`);
  }
});

//jod toogle on- patch 부분 수정 if on--> off / off--> on  -- done

router.patch("/:jobId", async (req, res, next) => {
  try {
    const jobId = req.params["jobId"];
    console.log(jobId);
    const result = await mariaConnQuery(
      `select * from config where id = ${jobId}`
    );
    const toggle = result[0].toggle;

    if (toggle === 1) {
      await mariaConnQuery(`UPDATE config SET toggle = 0 where id = ${jobId}`);
      logger.info(`jobId : ${jobId} toggle turned off `);
    } else {
      await mariaConnQuery(`UPDATE config SET toggle = 1 where id = ${jobId}`);
      logger.info(`jobId : ${jobId} toggle turned on `);
    }
    res.status(200).json({
      success: true,
      message: "toggle status changed",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - toggle control failed!`);
  }
});

module.exports = router;
