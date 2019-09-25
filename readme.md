# Important Note #
- ### NodeJS version that supports async or higher is required ###

# Install dependencies #
- ## To install dependencies from package-lock.json instead of package.json (ci: continuos integration)
   - npm ci

# Dev Environment #

- ## To run dev server ##
   - npm run dev

# Production Environment #

- ## To run mongodb via pm2 ##
   - pm2 start mongod.sh

- ## To run production server via pm2 ##
   - pm2 start server.sh

- ## List of pm2 commands ##
   - pm2 list
   - pm2 kill
   - pm2 stop
   - pm2 restart
   - pm2 delete
   - pm2 logs [optional:appName]

- ## List of mongoshell commands ##
   - show dbs
   - use [dbName]
   - show collections
   - db.[collectionName].find().pretty()

   - ## To import database ##
   - mongoimport --db pandorapc --collection items --file ./db/items.json
    
   - ## To export database ##
   - mongoexport --db pandorapc --collection items --out ./db/items.json   

- ## Nginx server ##
   - Config file location: /etc/nginx/sites-available/default
   - To apply config changes: sudo service nginx restart

# Git Commands #
- ## To revert back to previous commit without saving new changes ##
   - git reset --hard HEAD
