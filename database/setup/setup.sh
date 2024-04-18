#!/bin/bash

echo *************************************************************************
echo Starting the replicas
echo *************************************************************************

docker compose up -d

sleep 5

docker exec mongo1 /scripts/replicatSet.sh