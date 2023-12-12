#!/bin/bash

cd app
npm install json-server -g 
json-server --watch db.json -H ${HOST} --port ${PORT}
