#!/usr/bin/env bash
set -e

# move into the app folder and install dependencies then start
cd main
npm install --production
npm start
