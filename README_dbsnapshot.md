
### SIS DATA <=> BlackBoard DATA

## SIS DATA DB 연동
```node
const oracledb = require("oracledb");
const oraConnection = await oracledb.getConnection('고객사 DB 정보')
```
## SIS DATA DB 조회
Course_Faculty, Course_Student 조회
```node
const selCorFacVb = `SELECT * FROM CRS_FACULTY_VW UNION ALL SELECT * FROM CRS_STUDENT_VW`;
const corFac = await oraConnection.execute(selCorFacVb)
```
## 조회한 SIS DATA 로컬 DB 저장
```node 
    if(oldTable[0] === undefined){
        for(let row = 0; corFac.rows.length>row; row++){
            await marconn.query(insertOldTb,[`${conTable[0].id}`,`${corFac.rows[row][0]}`,`${corFac.rows[row][1]}`,`${corFac.rows[row][2]}`,`${corFac.rows[row]			[3]}`,`${corFac.rows[row][4]}`,`${corFac.rows[row][5]}`,`${corFac.rows[row][6]}`,`${corFac.rows[row][7]}`]);
        }
    }
```
## SIS DATA ( C,U,D ) 에 따라 로컬 DB 변경
``` node
if(exiT1[0] !== undefined) {
        for(let row = 0; (Object.entries(exiT1).length-1)>row; row++){
            temTb = await marconn.query(`SELECT * FROM temp where EXTERNAL_COURSE_KEY='${exiT1[row].EXTERNAL_COURSE_KEY}' and        EXTERNAL_PERSON_KEY='${exiT1[row].EXTERNAL_PERSON_KEY}'`)
            const updateTmpTb = `UPDATE temp SET AVAILABLE_IND=?,ROW_STATUS=? WHERE EXTERNAL_COURSE_KEY='${exiT1[row].EXTERNAL_COURSE_KEY}' AND EXTERNAL_PERSON_KEY='${exiT1[row].EXTERNAL_PERSON_KEY}'`
            if (temTb[0]===undefined){
                await marconn.query(insertTemTb,[`${exiT1[row].config_id}`,`${exiT1[row].EXTERNAL_COURSE_KEY}`,`${exiT1[row].EXTERNAL_PERSON_KEY}`,`${exiT1[row].ROLE}`,`${exiT1[row].AVAILABLE_IND}`,`${exiT1[row].ROW_STATUS}`,`${exiT1[row].ROSTER_IND}`,`${exiT1[row].RECEIVE_EMAIL_IND}`,`${exiT1[row].DATA_SOURCE_KEY}`]);
            }
            if (temTb[0]!==undefined && temTb[0].AVAILABLE_IND!==exiT1[0].AVAILABLE_IND) {
                await marconn.query(updateTmpTb,[`${exiT1[0].AVAILABLE_IND}`,`${exiT1[0].ROW_STATUS}`])
            }
        }
    }
    
if(exiT2[0] !== undefined && newTable[0] !== undefined){
	for(let row = 0; (Object.entries(exiT2).length-1)>row; row++){
	    temTb = await marconn.query(`SELECT * FROM temp where EXTERNAL_COURSE_KEY='${exiT2[row].EXTERNAL_COURSE_KEY}' and EXTERNAL_PERSON_KEY='${exiT2[row].EXTERNAL_PERSON_KEY}'`)
	    const updateTmpTb = `UPDATE temp SET AVAILABLE_IND=?,ROW_STATUS=? WHERE EXTERNAL_COURSE_KEY='${exiT2[row].EXTERNAL_COURSE_KEY}' AND EXTERNAL_PERSON_KEY='${exiT2[row].EXTERNAL_PERSON_KEY}'`
	    if (temTb[0]===undefined){
		await marconn.query(insertTemTb,[`${exiT2[row].config_id}`,`${exiT2[row].EXTERNAL_COURSE_KEY}`,`${exiT2[row].EXTERNAL_PERSON_KEY}`,`${exiT2[row].ROLE}`,`${exiT2[row].AVAILABLE_IND}`,`${exiT2[row].ROW_STATUS}`,`${exiT2[row].ROSTER_IND}`,`${exiT2[row].RECEIVE_EMAIL_IND}`,`${exiT2[row].DATA_SOURCE_KEY}`]);
	    }
	    else if(exiT2[row].AVAILABLE_IND==='Y') await marconn.query(updateTmpTb,['N','Disabled'])
	}
}
```
## 비교된 최종 DATA 저장
```node
for(let row = 0; (Object.entries(temTb).length-1)>row; row++){
        await marconn.query(insertOldTb, [`${temTb[row].config_id}`,`${temTb[row].EXTERNAL_COURSE_KEY}`,`${temTb[row].EXTERNAL_PERSON_KEY}`,`${temTb[row].ROLE}`,`${temTb[row].AVAILABLE_IND}`,`${temTb[row].ROW_STATUS}`,`${temTb[row].ROSTER_IND}`,`${temTb[row].RECEIVE_EMAIL_IND}`,`${temTb[row].DATA_SOURCE_KEY}`])
    }
```
## 블랙보드에 보낼 FEED_DATA text화

```node
    let feeddata =''
    let headers =''
    let data = ''
    for(let row=0; colSeTb.length-1>row; row++){
        headers += colSeTb[row].COLUMN_NAME+','
    }
    oldTable = await marconn.query(selectOldTb);
    for(let row=0; oldTable.length-2>row; row++){
        for(let rowC=0; colSeTb.length-1>rowC; rowC++){
            data += Object.entries(oldTable[row])[rowC][1]+','
        }
        data += '\r\n'
    }
    feeddata = headers + '\r\n' + data
```

## 블랙보드에 보낼 Action이 refresh 인경우 url 변경후 전송
``` node
let reUrl = await conTable[0].url
let url
if (conTable[0].action === 'refresh') url =  reUrl.slice(0,reUrl.indexOf('refresh')) + 'store'
```
