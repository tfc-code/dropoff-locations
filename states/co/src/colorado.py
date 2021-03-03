import requests
from scrapy.selector import Selector
from datetime import date
from update_geo import update_geos
import csv
import json

def import_colorado_data():
    # Hardcode data for this county
    state = 'Colorado'
    state_abbreviation = 'CO'

    data = []

    filepath = "./raw_data/colorado-dropoffs.csv"
    with open(filepath, newline='') as csvfile:
        csvfile = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in csvfile:
            
            location_type = ''
            if row[3] == 'TRUE':
                location_type = 'dropbox'
            elif row[4] == 'TRUE':
                location_type = 'earlyVoting'
            else:
                location_type = 'pollingPlace'

            address_object = {
                "name": row[1].strip(),
                "municipality": row[7].strip(),
                "address": row[5].strip(),
                "city": row[7].strip(),
                "county": row[0].strip(),
                "state": state,
                "zip": row[9].strip(),
                "stateAbbreviation": state_abbreviation,
                "notes": row[2].strip(),
                "source": "https://docs.google.com/spreadsheets/d/11k6Y5lmQmw_QWXDyrOjc9A6MkB2B1sHb/edit#gid=143829493",
                "type": location_type,
                "phone": "",
                "startTime": row[10].strip(),
                "endTime": row[11].strip(),
                "startDate": row[12].strip(),
                "endDate": row[13].strip()
            }
            data.append(address_object)
        
        locations = []
        currentLocation = {
            'address': '',
            'city': '',
            'type': ''
        }
        for item in data:
            if currentLocation['address'] != item['address'] or currentLocation['city'] != item['city'] or currentLocation['type'] != item['type']:
                if 'schedule' in currentLocation:
                    locations.append(currentLocation)
                currentLocation = item
                currentLocation['schedule'] = []
            
            currentLocation['schedule'].append({
                "startTime": item["startTime"],
                "endTime": item["endTime"],
                "startDate": item["startDate"],
                "endDate": item["endDate"]
            })
            currentLocation.pop('startDate', None)
            currentLocation.pop('endDate', None)
            currentLocation.pop('startTime', None)
            currentLocation.pop('endTime', None)
            currentLocation['schedule'].sort(key=lambda x: x['startDate'] + x['startTime'], reverse=True)
    locations.sort(key=lambda x: x['type']+x['schedule'][0]['startDate'], reverse=False)
    return locations

# grab data
data = []
data = data + import_colorado_data()
data = update_geos(data)
print("dropoff locations: " + str(len(data)))
print(json.dumps(data[1], indent=4, sort_keys=True))

# write it to our output file
file = open("/output/all-colorado.json","w") 
file.write(json.dumps(data, indent=4, sort_keys=True)) 
file.close()