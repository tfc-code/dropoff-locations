# Florida Mail-in Ballot Dropoff Location Code and Data

Extract early voting locations and schedules from official spreadsheets.
Format/fix addresses using Google Maps API, with a few manual overrides
    where this process doesn't work.

From `/src/`: 
```
python florida_xlxs.py
python address_fixing.py
ptyhon location_fixing.py
```

You'll need a valid Google Maps API key in secrets.json (in the repo root)

## Legacy stuff

### JSON API
`json/getdata.sh` downloads the most recent location data from

    https://api.vls.vrswebapps.com/api/v1/election/{county}

where {county} is one of the counties in flcounties.txt.

`json/data` contains a recent snapshot of location data.
This is not currently being used.

### Running the scraper
```
$ docker build -t florida . && docker run -v "$(pwd)/output:/output" florida
```

### Counties
Currently, we have implemented the following county scrapers for Florida:
* Alachua County
