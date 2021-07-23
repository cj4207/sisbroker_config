CREATE TABLE client(
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(45) NOT NULL ,
    institution VARCHAR(45) NOT NULL,
    department VARCHAR(45) NOT NULL,
    position VARCHAR(45) NOT NULL,
    client_key VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(45) NOT NULL,
    CONSTRAINT PK_clent PRIMARY KEY (id)
    )



CREATE TABLE config(
    id INT NOT NULL AUTO_INCREMENT,
    db_access_log LONGTEXT NOT NULL ,
    endpoint VARCHAR(200) NOT NULL,
    data_type VARCHAR(45) NOT NULL,
    client_key_id INT NOT NULL,
    password VARCHAR(45) NOT NULL,
    term VARCHAR(45) NOT NULL,
    crontab VARCHAR(45) NOT NULL,
    jobname VARCHAR(45) NOT NULL,
    username VARCHAR(45) NOT NULL,
    action VARCHAR(45) NOT NULL,
    toggle TINYINT(1) NOT NULL DEFAULT 0, 
    CONSTRAINT PK_config PRIMARY KEY (id),
    FOREIGN KEY (client_key_id) REFERENCES client(id)
    )


INSERT INTO client(id,email,institution,department,position,client_key,password,name) values(1,"mail@naver.com","wecode","maintenanace","master","dsdfsfsdfq3921","password1234","kim")

INSERT INTO config(id,db_access_log, endpoint ,data_type,client_key_id,password,term,crontab,jobname,username,action) \
values(1,"dbaccesslog","http://ajuuniv....","user/faculty",1,"passwod1","20210101","10 * * * * *","jobname1","kimmusan","store")



INSERT INTO config(db_access_log, endpoint ,data_type,client_key_id,password,term,crontab,jobname,username,action) values("dbaccesslog","http://ajuuniv....","user/staff",1,"passwod2","20210301","20 * * * * *","jobname2","kimmusan","store")
