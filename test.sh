#!/bin/sh

base=http://localhost:8080/api
make drop
make push

curl -H"Content-type: application/json" -d'{"_id":"id_gadget", "name":"gadget", "fields":["make", "model"]}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"id_inputdevice", "name":"input device", "fields":["port"], "parent":"id_gadget"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"id_mouse", "name":"mouse", "fields":["number of buttons"], "parent":"id_inputdevice"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"id_keyboard", "name":"keyboard", "fields":["number of keys"], "parent":"id_inputdevice"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"id_display", "name":"display", "fields":["size", "resolution"], "parent":"id_gadget"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"id_lcd", "name":"lcd", "fields":["dotpitch"], "parent":"id_display"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"id_crt", "name":"crt", "fields":["date of manufacture"], "parent":"id_display"}' $base/template


echo;echo
curl localhost:8080/template/id_mouse
echo
