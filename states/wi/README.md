# Wisconsin Mail-in Ballot Dropoff Location Code and Data

## Setup
You will need a google maps API key which you will need to provide in `/states/wi/src/update_geo.py`

## Running the scraper
```
$ docker build -t wisconsin . && docker run -v "$(pwd)/../../api/data:/output" wisconsin
```

## Data
* all county and municipal offices are included
* Milwaukee City Dropboxes
* Madison City Dropboxes
* Various Dropboxes from smaller municipalities