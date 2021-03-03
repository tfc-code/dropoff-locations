from scrape_from_api import scrape_api
import json

# grab data
data = json.dumps(scrape_api())

# write it to our output file
file = open("/output/all-florida.json","w") 
file.write(data) 
file.close() 
