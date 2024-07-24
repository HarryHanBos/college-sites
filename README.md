## REST API Server

# To build
```bash
npm install
npm run build
```

# To run locally
First ensure the mongo database is deployed locally, then run: 
```bash
npm run start
```

# To run in the cloud
1.  First get the latest Ubuntu instance you can find.
2.  Update the instance packages
```bash
  sudo apt-get update
  sudo apt-get upgrade
```

3.  Install NodeJS
```bash
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install nodejs
```

4.  Install the repo
```bash
  git clone https://github.com/WilliamRClark/college-demo-api.git
  npm install
  npm run build
```

5.  TODO: Configure the repo
```bash
    export DB_CONNECT_STRING="mongodb+srv://<username>:<password>@cluster0.2xjwj.mongodb.net/<dbname>?retryWrites=true&w=majority"
```

6.  Start the app under PM2
```bash
sudo npm install pm2 -g
pm2 start npm --name college-demo-api -- run start
```

