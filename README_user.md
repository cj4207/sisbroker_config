
### Sisbroker signup/login/dbconnect
### 사용한 기술:
nodeJS, express, prisma, mariaDB, oDbCon, bcrypt, jwt, uuid
백엔드 로그인/회원가입/DB연동 기능은 nodeJS+express 기반이며, 
기능 특성상 DB를 많이 다루므로 prisma 기반 ORM을 사용하였다.
sisbroker의 DB는 mariaDB가 사용되었으며, 고객사(학사) DB는 oDbCon 이다.
비밀번호 암호화에 bcrypt, 토큰발행에 jwt, 고유 id 발행에 uuid가 사용되었다.
## 회원가입
```node
const {email, password, institution, department, position, name } =  req.body
```
회원가입 하는데에는 이메일(.edu 만 가능), 비밀번호(8자이상 대소특수문자), 기관명, 부서명, 직책, 이름 여섯가지가 필요하다.
이메일, 비밀번호에는 정규식 검사가 걸려있으며, 여섯가지 값중 한 값이라도 들어오지 않았을땐 에러, 이메일의 경우 이미 가입이 된 이메일이 들어와도 에러.
```node
 const hashedPassword = await bcrypt.hash(password, 10)
```
비밀번호는 bcrypt를 이용하여 안전하게 암호화한다.
```node 
    const institutionExists = await prisma.clients.findFirst({
    	where: { institution: { endsWith: institution }},
    })
   if (institutionExists === null) 
   	institutionKey = uuid4()
   else 
     	institutionKey = institutionExists.institutionKey
```
기관마다 고유ID가 사용된다고 하여서 UUID를 사용하였다. 한 기관마다 하나의 고유ID 가 사용된다고 하는데, 한 기관에 여러 계정이 가입할 수도 있으므로, 이때는 기존에 발급되었던 고유ID를 재사용 한다. 만약 신규 기관이 첫 가입하는 계정이면 새로운 고유 ID를 발급하여 institutionKey에 저장한다. 기관의 기존 가입여부는 prisma의 findFirst를 이용해서 (UUID는 어차피 한가지 이기 때문에) mariaDB의 clients 테이블에 해당 기관의 가입여부를 조회한다. 
![](https://images.velog.io/images/slamhit98/post/443fac51-f1ba-42cb-a447-48c06201d4d9/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202021-07-27%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%201.52.53.png)
Postman에 회원가입 결과를 띄워보았다.
![](https://images.velog.io/images/slamhit98/post/0b40f1f6-c71c-4766-a727-f674a07b4a06/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202021-07-27%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%201.54.20.png)
동일한 UUID가 출력되었다.
![](https://images.velog.io/images/slamhit98/post/80bc12cb-0c09-46c6-99b2-a308521c6b3d/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202021-07-27%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%202.02.09.png)
다른 UUID가 출력되었다.
## 로그인
``` node
const { email, password: inputPassword } = req.body
```
로그인 하는데에는 회원가입시 사용되었던 이메일과 비밀번호를 입력받는다.
``` node
const foundUser = await prisma.clients.findUnique({ where: {email}})
```
Prisma를 이용해 DB clients 테이블에 해당 계정이 존재하는지 확인, 존재하지 않으면 에러 발생한다. 존재하면 해당 객체를 foundUser 변수에 저장한다.
``` node
const { password: hashedPassword} = foundUser
const isValidPassword = await bcrypt.compare(inputPassword, hashedPassword)
```
foundUser에 저장된 객체의 비밀번호를 hashedPassword이라고 지정한다. (회원가입때 이미 비밀번호 암호화 되어있기 때문) Bcrypt를 이용하여 사용자가 입력한 inputPassword이랑 DB에 저장되어있는 hashedPassword가 일치한지 확인하여 isValidPassword에 결과를 저장한다.
만약 false면 에러 발생.
```
const token = jwt.sign({ clientKeyID: foundUser.id, email }, process.env.JWT_SECRET_KEY)
```
JWT를 이용하여 JWT SECRET KEY, founduser.id (clients 테이블 id 값), email 3가지를 사용하여 토큰 발행.
```
const endpointExists = await prisma.configs.findFirst({ where: {client_key : foundUser.id}})
if (endpointExists) loginstatus = 'RETURNING USER' 
else loginstatus = 'NEW USER'
```
최초 로그인 판별하기.
DB에 clients 테이블을 외래키로 참조하고 있는 configs 테이블을 clients 테이블의 id 값으로 참조를 해서 endpoint(url) 존재여부를 확인하여 결과값을 endpointExists에 저장한다. 만약 endpoint(url)가 존재하면 loginstatus 는 NEW USER, 존재하지 않으면 RETURNING USER가 loginstatus 변수에 저장된다.
## 학사 DB 연동 (oDbCon)
``` node
const { email, dbIP, dbType, dbPort, dbID, dbPW } = req.body
ORACLE_CONNECT = {
	user : dbID,
    	password : dbPW,
        connectString :`(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${dbIP})(PORT=${dbPort}))(CONNECT_DATA=(SERVICE_NAME=${dbType})))`
}
```
만약 앞에서 한 로그인이 최초 로그인이라면, 프론트엔드에서 이 학사DB연동 하는 기능을 호출해줄 것이다. 이때 앞에서 회원가입/로그인에 사용된 이메일, 학사 DB IP, 학사 DB Type, 학사 DB Port, 학사 DB ID, 학사 DB PW 총 6가지를 입력받는다. Sisbroker의 이메일을 입력받는 이유는 후술하겠지만 우리 mariaDB에 오라클 학사 DB로그인 정보를 기존 회원가입한 정보에 업데이트 해야하는데, 그 올바른 저장 위치를 이메일로 조회하기 때문이다.
``` node
    await oDbCon.getConnection(ORACLE_CONNECT).catch(err => {
                const error = new Error(err.message)
                error.statusCode = 400
                throw error
            }
        )
```
오라클 학사 DB랑 연동하는 코드. 만약 연동 실패하면 에러가 출력될 것이다.
``` node
 await prisma.clients.updateMany({
            where: {
            email: {
                contains: email
            },
            },
            data: {
            dbIP, dbType, dbPort, dbID, dbPW
            },
        }
        )
```
만약 학사 DB랑 연동 성공하면, 학사 DB 연동에 쓰였던 다섯가지 항목들을 우리 mariaDB에 저장된 정보에 업데이트 (추가) 해야하는데, 그 저장 위치를 이메일로 조회한다.
