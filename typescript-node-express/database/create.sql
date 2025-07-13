drop schema if exists ccca;

create schema ccca;

create table ccca.account (
    account_id uuid primary key,
    name text,
    email text unique,
    document text,
    password text
);
