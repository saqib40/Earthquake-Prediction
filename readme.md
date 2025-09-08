## To run this project :
```bash
# Install the docker desktop
# Clone the repo
cd Earthquake-Prediction
docker-compose up --build

# visit => http://localhost:3000/
```

## To check the data
```bash
# to get into your mongo container
docker-compose exec mongo mongosh

# Show all databases
show dbs

# Switch to the application's database
use quake-predict

# See all the users that have signed up
db.users.find()

# See all the prediction data that has been saved
db.datas.find()
```