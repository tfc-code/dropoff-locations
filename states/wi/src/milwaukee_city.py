import requests
from scrapy.selector import Selector
from datetime import date
import csv

def import_milwaukee_dropboxes():
    # Hardcode data for this county
    county = 'Multiple Counties'
    state = 'Wisconsin'
    state_abbreviation = 'WI'

    data = []

    # URL where data was manaully copied to CSV from
    source_url = "https://city.milwaukee.gov/election/Voter-Info/Absentee-Ballot-Drop-Off-Sites"

    filepath = "./raw_data/milwaukee-city-dropoff-sites.html"
    with open(filepath, newline='') as htmlfile:
        # Extract the list of locations
        boxes = Selector(text=htmlfile.read()).css('#contentArea ul li span')
        for box in boxes:
            string = box.css('span::text').extract()[0]

            address = string.split(',',1)[1]
            extra = ""
            if "(" in address:
                extra = address.split('(')[1]
                extra = extra.replace(')', '').strip()
                address = address.split('(')[0]

            address_object = {
                "municipality": "City of Milwaukee",
                "address": address,
                "city": "Milwaukee",
                "county": county,
                "state": state,
                "stateAbbreviation": state_abbreviation,
                "notes": extra,
                "source": source_url,
                "phone": '414-286-3491',
                "type": 'dropbox',
                "schedule": "24/7",
                "zip": "",
                # "dateUpdated": date.today().strftime("%Y-%m-%d")
            }
            data.append(address_object)
            
    return data
