import requests
from scrapy.selector import Selector
from datetime import date
import csv

def import_manual_data():
    # Hardcode data for this county
    state = 'Wisconsin'
    state_abbreviation = 'WI'

    data = []

    filepath = "./raw_data/wisconsin-manual.csv"
    with open(filepath, newline='') as csvfile:
        csvfile = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in csvfile:
            address_object = {
                "municipality": row[0].strip(),
                "address": row[2].strip(),
                "city": row[3].strip(),
                "county": row[1].strip(),
                "state": state,
                "zip": row[4].strip(),
                "stateAbbreviation": state_abbreviation,
                "notes": '',
                "source": row[10].strip(),
                "type": "dropbox",
                "phone": row[6].strip(),
                "schedule": row[5].strip(),
                # "dateUpdated": date.today().strftime("%Y-%m-%d")
            }
            data.append(address_object)
    
    return data
