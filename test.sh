#!/bin/sh

base=http://localhost:8080/api
make drop
make push

curl -H"Content-type: application/json" -d'{"_id":"id_gadget", "name":"gadget", "fields":["make", "model"]}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"id_storage", "name":"storage", "fields":["capacity"], "parent_id":"id_gadget"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"id_harddrive", "name":"hard drive", "fields":[], "parent_id":"id_storage"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"id_thumbdrive", "name":"usb thumb drive", "fields":[], "parent_id":"id_storage"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"id_ssd", "name":"solid state disk", "fields":[], "parent_id":"id_storage"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"id_inputdevice", "name":"input device", "fields":["port"], "parent_id":"id_gadget"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"id_mouse", "name":"mouse", "fields":["number of buttons"], "parent_id":"id_inputdevice"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"id_keyboard", "name":"keyboard", "fields":["number of keys"], "parent_id":"id_inputdevice"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"id_display", "name":"display", "fields":["size", "resolution"], "parent_id":"id_gadget"}' $base/template

curl -H"Content-type: application/json" -d'{"_id":"id_lcd", "name":"lcd", "fields":["dotpitch"], "parent_id":"id_display"}' $base/template
curl -H"Content-type: application/json" -d'{"_id":"id_crt", "name":"crt", "fields":["date of manufacture"], "parent_id":"id_display"}' $base/template


echo;echo
curl localhost:8080/template/id_mouse
echo
