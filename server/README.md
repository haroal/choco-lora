# Choco-LoRa server

This part is in charge of the back-end part of the project. It is connected to *The Things Network* server to gather the messages
exchanged by the nodes. It stores them and resend them to the appropriate receiver. It also displays an admin dashboard to check the messages
and to send admin ones.


We are using :

 - an Amazon Web Service EC2 instance (t2.micro), based on Ubuntu 18.04 64bits
 - Node-RED to build our logic (with `pm2` to automatically restart it on startup). We also use it to display an admin
dashboard, thanks to `node-red-dashboard` package.
 - Nginx to proxy the Node-RED server to the port 80 to bypass the school firewall...
 - InfluxDB as a timeseries database to store the messages, with the sender and the receiver ids.

## Amazon Web Service EC2 instance

 - Open input port 80 ("Custom TCP rule")
 - Create SSH keys, and convert them with Putty if you're on Windows
 - Connect to the instance and run :
 
```bash
 $ curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
 $ sudo apt install -y nodejs npm build-essential
 $ sudo npm install -g node-red pm2

 $ pm2 start node-red
 $ pm2 startup
 $ sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
 $ pm2 save
```

## Node-RED

From [Node-RED official website](https://nodered.org/) : 
> Node-RED is a programming tool for wiring together hardware devices, APIs and online services in new and interesting ways.
> It provides a browser-based editor that makes it easy to wire together flows using the wide range of nodes in the palette
> that can be deployed to its runtime in a single-click.

We need to install some extra packages (to interact with **The Things Network**, display a dashboard or communicate with the
InfluxDB database) : 

```bash
 $ cd ~/.node-red
 $ npm install node-red-contrib-ttn
 $ npm install node-red-dashboard
 $ npm install node-red-contrib-influxdb
 
 $ pm2 restart node-red
```

Node-RED flow can be found in this repository (**node_red_flow.json**).

## Nginx

To forward port `80` to `localhost:1880` (the Node-RED server), we use Nginx.
 
```bash
 $ sudo apt install nginx
 $ cd /etc/nginx/sites-available/
 $ sudo cp default node-red
 $ sudo ln -s /etc/nginx/sites-available/node-red node-red
 $ sudo nginx -t  # to test if configuration is ok
 $ sudo service nginx restart
```

Then, edit this file (as `sudo`) to configure the server : **/etc/nginx/sites-available/node-red**.

```
server {
    listen 80 default_server;

    location / {
        proxy_pass http://127.0.0.1:1880;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## InfluxDB

To store the messages exchanges on the Choco-LoRa network, we use InfluxDB, a timeseries database.

```
 $ sudo echo "deb https://repos.influxdata.com/ubuntu bionic stable" > /etc/apt/sources.list.d/influxdb.list
 $ sudo curl -sL https://repos.influxdata.com/influxdb.key | sudo apt-key add -
 $ sudo apt update
 $ sudo apt install influxdb
 $ sudo service influxdb restart
```

Then, we need to create our database. To do so, simply run `influx` to enter into InfluxDB command line, and type :

```
 CREATE DATABASE <db_name>
 SHOW DATABASES
 CREATE RETENTION POLICY "one_year" ON <db_name> DURATION 365d REPLICATION 1 DEFAULT
 SHOW RETENTION POLICIES ON <db_name>
 CREATE USER <username> WITH PASSWORD '<password>'
 GRANT ALL ON <db_name> TO <username>
```
