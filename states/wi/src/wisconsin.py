from wisconsin_state import import_municipal_offices
from wisconsin_state import import_county_offices
from milwaukee_city import import_milwaukee_dropboxes
from manual_data_import import import_manual_data
from madison_city import import_madison_dropboxes
from wisconsin_dems import import_wisconsin_dems
from audit import count_duplicate_addresses
from update_geo import update_geos
import json

# grab data
data = []
data = data + import_municipal_offices()
print("municipal offices: " + str(len(data)))
county_offices = import_county_offices()
data = data + county_offices
print("county offices: " + str(len(county_offices)))
milwaukee_dropboxes = import_milwaukee_dropboxes()
data = data + milwaukee_dropboxes
print("milwaukee dropboxes: " + str(len(milwaukee_dropboxes)))
manual_data = import_manual_data()
print("manual data: " + str(len(manual_data)))
data = data + manual_data
madison_dropboxes = import_madison_dropboxes()
print("madison dropboxes: " + str(len(madison_dropboxes)))
data = data + madison_dropboxes

print("total data: " + str(len(data)))

wisconsin_dems = import_wisconsin_dems()
print ("wisconsin dems: " + str(len(wisconsin_dems)))
data = data + wisconsin_dems

#print(json.dumps(data))
print("Total data after wisdem: " + str(len(data)))

count_duplicate_addresses(data)

data = update_geos(data)

# write it to our output file
file = open("/output/all-wisconsin.json","w") 
file.write(json.dumps(data, indent=4, sort_keys=True)) 
file.close()