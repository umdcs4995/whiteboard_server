#!/bin/bash -e

if [ -e "./.env" ]; then source '.env'; fi

if [ -z ${PORT+x} ]; then
    read -p "Port: " PORT
fi

if [ -z ${DB_HOST+x} ]; then
    read -p "MySQL host (probably localhost): " DB_HOST
fi

if [ -z ${DB_USER+x} ]; then
    read -p "MySQL username: " DB_USER
fi

if [ -z ${DB_PASS+x} ]; then
    read -p "MySQL password: " DB_PASS
fi


if [ -e "./.env" ]; then rm .env; fi

echo "PORT=$PORT" >> .env
echo "DB_HOST=$DB_HOST" >> .env
echo "DB_USER=$DB_USER" >> .env
echo "DB_PASS=$DB_PASS" >> .env

echo "Configuration complete. Please edit .env if you need to change these values."
