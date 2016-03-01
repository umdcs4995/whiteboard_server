#source this in mysql to create the database by running command
#source setup.sql from mysql
drop database if exists hcc;
create database hcc;
use hcc;
create table if not exists user (
    id integer NOT NULL AUTO_INCREMENT,
    email varchar(80) unique ,
    name varchar(80),
    UNIQUE(email),
    PRIMARY KEY (id)
);

create table if not exists chat (
    id integer NOT NULL AUTO_INCREMENT,
    name varchar(80),
    public boolean,
    UNIQUE(name),
    PRIMARY KEY (id)
);

create table if not exists user_chat (
    id integer NOT NULL AUTO_INCREMENT,
    user_id integer NOT NULL,
    chat_id integer NOT NULL,
    created_at  date,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (chat_id) REFERENCES chat (id)
);

create table if not exists message (
    id integer NOT NULL AUTO_INCREMENT,
    user_id integer NOT NULL,
    chat_id integer NOT NULL,
    message text,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (chat_id) REFERENCES chat (id)
);
#test stuff (when we have chats and users actually working remove this code)
insert into chat values(1, 'test', 1);
insert into user values(1, 'test@test.com', 'test');
