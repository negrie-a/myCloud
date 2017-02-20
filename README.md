# myCloud

MyCloud is an application which allows you to host your own Cloud on your server.   
Thanks to this app, you can download, upload and manage your files.

Server is based on NodeJS  
Software is based on Qt/C++

## Motivation

Before beginning this project, I bought a personal cloud storage already created, but the software was very ugly and I cannot improve or modify anything. Because of that, I decided to create my own cloud to be very flexible

## Installation

In order to make the project work properly you have to install the server and the client.  
If you didn't install the client yet, you could find it [here](https://github.com/negrie-a/myCloud-client).

### Create database

First, you need to create the database on your server. I will interpret an example with mysql database

```
mysqld                    // Start mysql server
mysqld -u $USER_NAME -p   // Connect yourself to mysql

mysql> CREATE DATABASE $NAME_BASE ;

```

Set your database server config in the file config/database.json.

```
    "development": {
        "database": "$NAME_BASE", // Change the database name
        "dialect": "mysql",       // Set your dialect
        "host": "127.0.0.1",      // Database host
        "username": "root",       // User name
        "password": ""            // Password database
    }

```

Start migration

```
   npm run mycloud
```

### Install all dependencies

You have to install all libraries in order myCloud server work well.



```
   // ONLY on Linux
   sh ./script/linux-config.sh
   
   
   npm install
```

### Running the server
  MyCloud server use [grunt](http://gruntjs.com/) the JavaScript Task Runner to start the server.
  
  ```
   // ONLY on Linux
   sh ./script/linux-config.sh
   
   
   npm install
```
  
## Built With

* [Nodejs](https://nodejs.org/en/) - JavaScript runtime built
* [Express](http://expressjs.com/) - The web framework used
* [Sequelize](http://docs.sequelizejs.com/en/v3/) - ORM for Node.js

## Authors

[Negrier Aurelien](http://www.aurelien-negrier.me/) 
