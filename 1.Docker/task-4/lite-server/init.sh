#!/bin/bash

cd lite-server
npm install lite-server --save-dev
lite-server -c bs-config.json
npm start
