#!/bin/bash
docker build --platform linux/amd64 -t tripolskypetr/node-ccxt-dumper . -f Dockerfile
docker push tripolskypetr/node-ccxt-dumper:latest
