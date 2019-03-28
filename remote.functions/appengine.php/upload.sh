#!/bin/bash
start=$SECONDS
gcloud app deploy --project flexi-cms --version 1 --promote
end=$SECONDS
echo "duration: $((end-start)) seconds"