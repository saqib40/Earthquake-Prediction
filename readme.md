## Step 1 : Install the following
- NodeJS

```bash
brew install node
```

- Python & Pip

```bash
brew install python
```

- Mongodb (compass for better visualisation)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew install --cask mongodb-compass
```

## Step 2 : Do the following
```bash
# 1- clone the repo
git clone https://github.com/saqib40/Earthquake-Prediction

# 2- in the same terminal (don't close the terminal)
cd frontend
npm install
npm run dev

# 3- wake your mongodb up
brew services start mongodb-community

# 4- in the new terminal (don't close this terminal either)
# get into backend directory
npm install
npm run start

# 5- get into another terminal (don't close this one either)
# get into Niranjans
# unzip the zipped files
unzip '*.zip'
pip install -r requirements.txt
python prediction.py

# 6- visit => http://localhost:3000/
```