// const mariadb = require("mariadb");
const oracledb = require("oracledb");
const conmaria = require("./mariadb_config.js");
// const conora = require("./oracledb_config.js");
const insertOldTb =
  "INSERT INTO old_enrullments(EXTERNAL_COURSE_KEY,EXTERNAL_PERSON_KEY,ROLL,AVAILABLE_IND,ROW_STATUS,ROSTER_IND,RECEIVE_EMAIL_IND,DATA_SOURCE_KEY) VALUES(?,?,?,?,?,?,?,?)";
const insertNewTb =
  "INSERT INTO new_enrullments(EXTERNAL_COURSE_KEY,EXTERNAL_PERSON_KEY,ROLL,AVAILABLE_IND,ROW_STATUS,ROSTER_IND,RECEIVE_EMAIL_IND,DATA_SOURCE_KEY) VALUES(?,?,?,?,?,?,?,?)";
const checkTable = async (e_c_k, e_p_k) => {
  // const pool = await conmaria.mariadb.createPool(conmaria);
  const conn = await oracledb.getConnection(conmaria.oraDb);
  const selectOraTb = `SELECT * FROM ENROLLMENT`;
  const selectOldTb = `SELECT * FROM old_enrullments WHERE EXTERNAL_COURSE_KEY='${e_c_k}' and EXTERNAL_PERSON_KEY='${e_p_k}'`;
  const selectNewTb = `SELECT * FROM new_enrullments WHERE EXTERNAL_COURSE_KEY='${e_c_k}' and EXTERNAL_PERSON_KEY='${e_p_k}'`;
  const marconn = await conmaria.mariaDb.getConnection();
  // const selQuery = 'CALL user()';
  // const oraconn = await conn.getConnection
  const newTable = await marconn.query(selectNewTb);
  const oldTable = await marconn.query(selectOldTb);
  const oraTable = await conn.execute(selectOraTb);
  if (newTable[0] === undefined)
    marconn.query(insertOldTb, [
      `${e_c_k}`,
      `${e_p_k}`,
      `${newTable[0].ROLL}`,
      `${newTable[0].AVAILABLE_IND}`,
      `${newTable[0].ROW_STATUS}`,
      `${newTable[0].ROSTER_IND}`,
      `${newTable[0].RECEIVE_EMAIL_IND}`,
      `${newTable[0].DATA_SOURCE_KEY}`,
    ]);
  if (oldTable[0] === undefined)
    marconn.query(insertOldTb, [
      `${e_c_k}`,
      `${e_p_k}`,
      `${newTable[0].ROLL}`,
      `${newTable[0].AVAILABLE_IND}`,
      `${newTable[0].ROW_STATUS}`,
      `${newTable[0].ROSTER_IND}`,
      `${newTable[0].RECEIVE_EMAIL_IND}`,
      `${newTable[0].DATA_SOURCE_KEY}`,
    ]);
  console.log(oldTable[0]);
  console.log(newTable[0]);
  // console.log(oraTable);
};
checkTable("C-1", "std1");
