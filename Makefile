DB=foo

push:
	couchapp push app.js http://localhost:5984/$(DB)

# couchapp sync doesnt work
sync:
	couchapp sync app.js http://localhost:5984/$(DB)

server:
	node ./server.js $(DB)
