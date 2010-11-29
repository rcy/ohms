#!/bin/sh

base=http://localhost:8080/api
make drop
make push

curl -H"Content-type: application/json" -d'{"_id":"id_device", "name":"device", "attrs":["make", "model"], "parent_ids":[]}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_storage", "name":"storage", "attrs":["capacity"], "parent_ids":["id_device"]}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_harddrive", "name":"hard drive", "attrs":[], "parent_ids":["id_storage","id_device"]}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_thumbdrive", "name":"usb thumb drive", "attrs":[], "parent_ids":["id_storage","id_device"]}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_ssd", "name":"solid state disk", "attrs":[], "parent_ids":["id_storage","id_device"]}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_inputdevice", "name":"input device", "attrs":["port"], "parent_ids":["id_device"]}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_mouse", "name":"mouse", "attrs":["number of buttons"], "parent_ids":["id_inputdevice"]}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_keyboard", "name":"keyboard", "attrs":["number of keys"], "parent_ids":["id_inputdevice"]}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_monitor", "name":"monitor", "attrs":["size", "resolution"], "parent_ids":["id_device"]}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_lcd", "name":"lcd", "attrs":["dotpitch"], "parent_ids":["id_monitor"]}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_crt", "name":"crt", "attrs":["date of manufacture"], "parent_ids":["id_monitor"]}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_system", "name":"system", "attrs":[], "parent_ids":["id_device"]}' $base/category
curl -H"Content-type: application/json" -d'{"_id":"id_laptop", "name":"laptop", "attrs":[], "parent_ids":["id_system"]}' $base/category

curl -H"Content-type: application/json" -d'{"_id":"id_cellphone", "name":"cellphone", "attrs":[], "parent_ids":["id_device"]}' $base/category

echo;echo "---- types/kinds/classes/objs/things"
curl -H"Content-type: application/json" -d'{"_id":"my_crt", "parent_ids":["id_crt"], "attrs":{"make":"NEC", "model":"AccuSync 700", "size":"17\"", "resolution":"1280x1024", "date of manufacture":"2001"}}' $base/thing
curl -H"Content-type: application/json" -d'{"_id":"my_lcd", "parent_ids":["id_lcd"], "attrs":{"make":"Samsung", "model":"SyncMaster 930B", "size":"19\"", "resolution":"1600x1200", "date of manufacture":"2006"}}' $base/thing
curl -H"Content-type: application/json" -d'{"_id":"my_keyboard", "parent_ids":["id_keyboard"], "attrs":{"make":"PFU", "model":"Happy Hacking", "port":"ps/2", "number of keys":"60"}}' $base/thing
curl -H"Content-type: application/json" -d'{"_id":"my_laptop", "parent_ids":["id_laptop"], "attrs":{"make":"Fujitsu", "model":"Lifebook A Series"}}' $base/thing
curl -H"Content-type: application/json" -d'{"_id":"my_thumb", "parent_ids":["id_thumbdrive"], "attrs":{"make":"Alcor", "model":"Transcend JetFlash", "capacity":"2 Gig"}}' $base/thing
curl -H"Content-type: application/json" -d'{"_id":"my_cell", "parent_ids":["id_cellphone"], "attrs":{"make":"LG", "model":"LG230"}}' $base/thing


# # items/stock items/inventory

echo;echo
curl localhost:8080/api/thing/my_crt
echo
