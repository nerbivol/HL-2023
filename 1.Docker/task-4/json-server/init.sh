#!/bin/bash


npm install -g json-server 
cd json-server
json-server --watch db.json -H ${HOST} --port ${PORT}
