DB?=dummy
COUCH=http://localhost:5984

server:
	node ./server.js $(DB)

push: db
	couchapp push app.js $(COUCH)/$(DB)

db:
	curl -XPUT $(COUCH)/$(DB)
drop:
	curl -XDELETE $(COUCH)/$(DB)

