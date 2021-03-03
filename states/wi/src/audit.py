import requests
from scrapy.selector import Selector
from datetime import date
import csv
import json

def count_duplicate_addresses(data):
    hashtable = {};

    for location in data:
        # build unique key
        locationKey = location['state'] + "_" + location['county'] + "_" + location['municipality'] + "_" + location['city'] + '_' + location['address'] + '_' + location['type'] 
        # make everything lowercase
        locationKey = locationKey.lower()
        # replace road and street abbreviations
        locationKey = locationKey.replace('rd','').replace('road','')
        locationKey = locationKey.replace('st','').replace('street','')
        locationKey = locationKey.replace('wy','').replace('way','')
        locationKey = locationKey.replace('ave','').replace('avenue','')

        # remove spaces and special characters
        locationKey = locationKey.replace(' ','').replace('.', '').replace('-', '').replace("'", '')

        if locationKey not in hashtable:
            hashtable[locationKey] = {}
            hashtable[locationKey]['key'] = locationKey
            hashtable[locationKey]['locations'] = []
            hashtable[locationKey]['count'] = 0

        hashtable[locationKey]['locations'].append(location)
        hashtable[locationKey]['count'] = hashtable[locationKey]['count'] + 1
    
    list_of_locations = []
    for location in hashtable:
        if hashtable[location]['count'] > 1:
            list_of_locations.append(hashtable[location])

    list_of_locations.sort(key=lambda x: x['count'], reverse=True)

    print("unique addresses with multiple locations: " + str(len(list_of_locations)))
    #print(json.dumps(list_of_locations[1], indent=4, sort_keys=True))

    file = open("/output/wisconsin-duplicates.json","w") 
    file.write(json.dumps(list_of_locations, indent=4, sort_keys=True)) 
    file.close()

