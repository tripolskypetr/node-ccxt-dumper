@echo off
call docker build --platform linux/amd64 -t tripolskypetr/node-ccxt-dumper . -f Dockerfile
call docker push tripolskypetr/node-ccxt-dumper:latest