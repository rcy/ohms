DB?=dummy
COUCH=http://localhost:5984

server:
	node ./server.js $(DB)

push: create
	couchapp push db/_design/app.js $(COUCH)/$(DB)

create:
	curl -XPUT $(COUCH)/$(DB)
drop:
	curl -XDELETE $(COUCH)/$(DB)

test:
	sh ./test.sh
