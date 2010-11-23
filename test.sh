#!/bin/sh

base=http://localhost:8080/api
make drop
make push

curl -H"Content-type: application/json" -d'{"_id":"id_widget", "name":"widget", "fields":["make", "model"]}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_storage", "name":"storage", "fields":["capacity"], "parent_id":"id_widget"}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_harddrive", "name":"hard drive", "fields":[], "parent_id":"id_storage"}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_thumbdrive", "name":"usb thumb drive", "fields":[], "parent_id":"id_storage"}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_ssd", "name":"solid state disk", "fields":[], "parent_id":"id_storage"}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_inputdevice", "name":"input device", "fields":["port"], "parent_id":"id_widget"}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_mouse", "name":"mouse", "fields":["number of buttons"], "parent_id":"id_inputdevice"}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_keyboard", "name":"keyboard", "fields":["number of keys"], "parent_id":"id_inputdevice"}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_monitor", "name":"monitor", "fields":["size", "resolution"], "parent_id":"id_widget"}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_lcd", "name":"lcd", "fields":["dotpitch"], "parent_id":"id_monitor"}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_crt", "name":"crt", "fields":["date of manufacture"], "parent_id":"id_monitor"}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_system", "name":"system", "fields":[], "parent_id":"id_widget"}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_laptop", "name":"laptop", "fields":[], "parent_id":"id_system"}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_cellphone", "name":"cellphone", "fields":[], "parent_id":"id_widget"}' $base/category

echo;echo "---- types/kinds/classes/forms"
curl -H"Content-type: application/json" -d'{"_id":"my_crt", "parent_id":"id_crt", "fields":{"make":"NEC", "model":"AccuSync 700", "size":"17\"", "resolution":"1280x1024", "date of manufacture":"2001"}}' $base/form
curl -H"Content-type: application/json" -d'{"_id":"my_lcd", "parent_id":"id_lcd", "fields":{"make":"Samsung", "model":"SyncMaster 930B", "size":"19\"", "resolution":"1600x1200", "date of manufacture":"2006"}}' $base/form
curl -H"Content-type: application/json" -d'{"_id":"my_keyboard", "parent_id":"id_keyboard", "fields":{"make":"PFU", "model":"Happy Hacking", "port":"ps/2", "number of keys":"60"}}' $base/form
curl -H"Content-type: application/json" -d'{"_id":"my_laptop", "parent_id":"id_laptop", "fields":{"make":"Fujitsu", "model":"Lifebook A Series"}}' $base/form
curl -H"Content-type: application/json" -d'{"_id":"my_thumb", "parent_id":"id_thumbdrive", "fields":{"make":"Alcor", "model":"Transcend JetFlash", "capacity":"2 Gig"}}' $base/form
curl -H"Content-type: application/json" -d'{"_id":"my_cell", "parent_id":"id_cellphone", "fields":{"make":"LG", "model":"LG230"}}' $base/form


# items/stock items/inventory

echo;echo
curl localhost:8080/api/form/my_crt
echo
