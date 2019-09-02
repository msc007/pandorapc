# ***Note*** #
### NodeJS version that supports async or higher is required ###

# Dev Environment #

## To run dev server ##
   npm run dev

## To import database ##
   mongoimport --db pandorapc --collection items --file ./db/items.json
    
## To export database ##
   mongoexport --db pandorapc --collection items --out ./db/items.json   

# Production Environment #

## To run mongodb via pm2 ##
   pm2 start mongod.sh

## To run production server via pm2 ##
   pm2 start server.sh

## List of pm2 commands ##
   pm2 list
   pm2 kill
   pm2 stop
   pm2 restart
   pm2 delete

## List of mongoshell commands ##
   show dbs
   use [dbName]
   show collections
   db.[collectionName].find().pretty()

   
