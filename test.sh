#!/bin/sh

base=http://localhost:8080
make drop
make push

curl -H"Content-type: application/json" -d'{"_id":"gadget", "name":"gadget", "fields":["make", "model"]}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"inputdevice", "name":"input device", "fields":["port"], "parent":"gadget"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"mouse", "name":"mouse", "fields":["number of buttons"], "parent":"inputdevice"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"keyboard", "name":"keyboard", "fields":["number of keys"], "parent":"inputdevice"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"display", "name":"display", "fields":["size", "resolution"], "parent":"gadget"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"lcd", "name":"lcd", "fields":["dotpitch"], "parent":"display"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"crt", "name":"crt", "fields":["date of manufacture"], "parent":"display"}' $base/template


echo;echo
curl localhost:8080/template/mouse
echo
