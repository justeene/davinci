#!/bin/bash -e
cd webapp
#npm run build
rm -f ../davinci-ui/*
cp build/* ../davinci-ui/ 