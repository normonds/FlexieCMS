#!/bin/bash
byobu new-session -d -s "FlexieCMS2019" -n "webpack" "npm run webpackw"
byobu new-window -t "FlexieCMS2019" -n "server" "npm run server"
byobu new-window -t "FlexieCMS2019" -n "bash" "bash"
byobu attach -t "FlexieCMS2019"