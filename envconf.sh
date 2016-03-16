#!/bin/bash -e

if [ -e "defaults.env" ]; then source 'defaults.env'; fi
if [ -e ".env" ]; then source '.env'; fi

read -p "Port [$PORT]: " N_PORT
PORT="${N_PORT:=$PORT}"

read -p "RTC signaling port [$RTC_PORT]: " N_RTC_PORT
PORT="${N_RTC_PORT:=$RTC_PORT}"

read -p "MySQL host [$DB_HOST]: " N_DB_HOST
DB_HOST="${N_DB_HOST:=$DB_HOST}"

read -p "MySQL username [$DB_USER]: " N_DB_USER
DB_USER="${N_DB_USER:=$DB_USER}"

read -p "MySQL password [$DB_PASS]: " N_DB_PASS
DB_PASS="${N_DB_PASS:=$DB_PASS}"

if [ -e "./.env" ]; then rm .env; fi

echo "PORT=$PORT" >> .env
echo "DB_HOST=$DB_HOST" >> .env
echo "DB_USER=$DB_USER" >> .env
echo "DB_PASS=$DB_PASS" >> .env

echo "Configuration complete. Rerun this script to change values."
