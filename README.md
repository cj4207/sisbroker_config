# sisbroker_config

## 구현기능 순서
1. app routing
2. dbconnection (mariadb)
3. Job create API
4. Job list API
5. job update API
6. Job delete API
7. Job toggle On/Off API
8. Logger

## project architecture

<img width="253" alt="Screen Shot 2021-07-23 at 2 05 06 PM" src="https://user-images.githubusercontent.com/78840341/126747828-0954b092-e82a-454d-a97a-a494b19c1c53.png">

프로젝트 구성
- **app.js**로  user 기능과 endpoint 구분
- **route/config.js**로 세부 엔드포인트와 로직을 작성 
- **route/db_config.js**에서 DB정보 저장하여 git에 업로드하지 않도록 .gitignore에 저장 
- **config/winston.js** 에서 logger 모듈 작성log
- **log**에서 log기록 관리 + **log/error**에서 에러는 추가적으로 기록

## app.js routing

<img width="785" alt="Screen Shot 2021-07-23 at 2 04 35 PM" src="https://user-images.githubusercontent.com/78840341/126748296-8b50058b-3a48-47fc-a81a-49f50f8ebe4a.png">

import한 패키지
`express` : express 다루기 위해서
`router` : 모듈 파일 이용하기 위해서
`app.use(express.json())` : `body-parser` 대신에 express가 제공하는 post에 `body` 사용할 수 있게 하는 기능

```
app.get("/", function (req, res, next) {
  next();
});
```
middleware로 향후 전체적으로 적용할 로직이 필요한 경우 꼭 거치고 다음로직이 진행되도록 하는 기능

```
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
```
로컬환경  3000 port 로 설정





## dbconnection (mariadb) + mariaConnQuery function

<img width="545" alt="Screen Shot 2021-07-23 at 2 06 40 PM" src="https://user-images.githubusercontent.com/78840341/126748923-a04eac14-208e-414f-b468-2b2cc232ed15.png">


db_config에서 db 정보를 확인 
`const conmaria = require("./db_config.js");`

**query를 여러번 바꿔가며 날려야 하기 때문에** 별도의 함수(`mariaConnQuery`)로 구성하여 variable에 query만 입력하면 재사용가능하도록 사용

refresh ->store하는 로직에서도 재활용이 된다면 별도의 모듈파일로 만들어 import하는 방법이 좋음

query가 돌아갔을때 : `logger.info`

connect가 안되거나 query error 인 경우 : `logger.error`

## Job create API 

<img width="412" alt="Screen Shot 2021-07-23 at 4 25 48 PM" src="https://user-images.githubusercontent.com/78840341/126751178-192889b8-4f32-44c0-a6cf-d6351e7c950a.png">


`dbAccessLog` : 현재 임의의 값으로 설정 user에서 db connection이 끝나고 나면 db 정보가 저장되는 곳에 따라 참조

`clientKeyId`  : Job을 만들 떄 + Job list에 대해서 특정하여 query문 접근을 할 떄 사용


<img width="1054" alt="Screen Shot 2021-07-23 at 2 07 05 PM" src="https://user-images.githubusercontent.com/78840341/126749701-09cc540a-1239-4134-b38c-37fc745530cb.png">
front에서 crontab을 보내줄 때 `"* * * * *"`에서 초 부분은 제외되기 떄문에 해당하는 부분에 second를 추가해주기 위한 로직

**endpoint : POST http://localhost:3000/config**

```
try {
      let second = await mariaConnQuery(
        `SELECT crontab from config where client_key_id = ${clienKeyId}`
      );
    } catch {
      let second = undefined;
    }
```
로 crontab이 이미 존재하는지 확인 , 존재하지 않는다면 second = undefiend

second가 없다면 초기값은 "05" 

**second가 존재한다면 기존 joblist에서 제일 마지막 job의 초부분을 가져오고 그 값에 5초를 더하여 문자로 변환**


<img width="1065" alt="Screen Shot 2021-07-23 at 2 07 14 PM" src="https://user-images.githubusercontent.com/78840341/126749725-bbd37407-ec6e-480a-a549-d9bedf14413c.png">

insert 쿼리를 이용해서 직접 테이블에 데이터 삽입 

endpoint는 통신을 위해서 action 이 포함하여 기록

second는 미리 구한 second를 포함하여 crontab 양식으로 삽입

## Joblist API

<img width="541" alt="Screen Shot 2021-07-23 at 2 07 33 PM" src="https://user-images.githubusercontent.com/78840341/126751277-27a20cf0-20f7-42b6-aae1-3e723ee4bba2.png">


![Screen Shot 2021-07-23 at 4 39 19 PM](https://user-images.githubusercontent.com/78840341/126751395-4e1d7f15-10c0-4013-972d-896054a5bf93.png)

**endpoint : GET http://localhost:3000/config/list**


joblist는 포스트맨의 결과에서 보이는 것처럼 result에 대한 값으로 정보들이 들어가는 형태

## Job update

<img width="804" alt="Screen Shot 2021-07-23 at 2 08 01 PM" src="https://user-images.githubusercontent.com/78840341/126751596-ec77c411-431e-4dd8-b439-448beb2aa1d7.png">

**endpoint : POST http://localhost:3000/config/jobId**

job update는 front에서 변화된 정보와 유지되는 정보를 모두 합해서 보내준다는 것을 전제로 새로 받은 body값으로 기존 row를 덮어씌우는 방식으로 진행

path parameter 로 jobId를 지정해서 보내주면 해당하는 job만 업데이트 하는 방식

! path parameter를 구체적으로 무엇으로 할지 합의 필요

## Job delete

<img width="804" alt="Screen Shot 2021-07-23 at 2 08 09 PM" src="https://user-images.githubusercontent.com/78840341/126751990-2f2576f9-e0a0-43a2-897a-5a0dfa73cd7d.png">


**endpoint : DELETE http://localhost:3000/config/jobId**

Job delete는 update와 마찬가지로 지정해준 path parameter로 해당하는 job을 찾고 삭제 진행

bulk delete는 구현하지 않고 한번의 클릭의 한번 patch 보내는 식으로 진행



## Job toggle on/off

<img width="804" alt="Screen Shot 2021-07-23 at 2 08 16 PM" src="https://user-images.githubusercontent.com/78840341/126752178-a42df424-d5f3-4272-9265-cf1447e63ab9.png">

**endpoint : PATCH http://localhost:3000/config/jobId**

Job toggle을 클릭할 떄 DB config table의 toggle 값이 변화

기존에 toggle값을 확인 후에 update

toggle : 1 ==> toggle : 0  == Job is activated
toggle : 0 ==> toggle : 1  == Job is deactivated




## Logger

<img width="545" alt="Screen Shot 2021-07-23 at 2 06 30 PM" src="https://user-images.githubusercontent.com/78840341/126752494-f5067ffc-d5a3-4531-91ae-d906f8b246f9.png">

쿼리 조회하는 경우 + api가 실행되는 경우 두 번 로그를 남김

<img width="941" alt="Screen Shot 2021-07-23 at 2 05 36 PM" src="https://user-images.githubusercontent.com/78840341/126752503-d254f147-2f9f-43a7-850c-486e970e5679.png">

성공한 경우외에도 logger.error로 error 로깅을 별도로 확인할 수 있음. 

에러 및 로거 메시지는 해당 API를 특정할 수 있는 내용의 변수들을 같이 포함하여 출력






