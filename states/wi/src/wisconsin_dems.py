from datetime import date
import requests
import json

def import_wisconsin_dems():
    # Hardcode data for this county
    state = 'Wisconsin'
    state_abbreviation = 'WI'
    data = []

    # URL where data was manaully copied from
    source_url = "https://vote.wisdems.org/_update-county-single-pages"
    response = requests.get(source_url)
    messy_string = response.text
    voting_locations_json = messy_string.split('"', 1)[1].split('string', 1)[0].strip().rsplit('"', 1)[0]
    ballot_dropbox_json = messy_string.split('string', 2)[2].split('"', 1)[1].rsplit('"', 1)[0]

    ev_locations = json.loads(voting_locations_json)
    for box in ev_locations['finalFormat']:
        clerk_phone = box.get('clerkPhone', '')
        zipcode = box.get('zip5', '')
        schedule = box.get('schedule','')
        exceptions = box.get('exceptions','')
        address_object = {
            "name": box['locationName'],
            "municipality": box['city'],
            "address": box['addressLine1'],
            "city": box['city'],
            "county": box['countyName'].title() + " County",
            "state": state,
            "zip": zipcode,
            "stateAbbreviation": state_abbreviation,
            "notes": "Dropoff at early voting location",
            "source": source_url,
            "phone": clerk_phone,
            "type": 'earlyVoting',
            "schedule": schedule + " " + exceptions,
            # "dateUpdated": date.today().strftime("%Y-%m-%d")
        }
        data.append(address_object)

    do_locations = json.loads(ballot_dropbox_json)
    clerk_phone = box.get('clerkPhone', '')
    zipcode = box.get('zip5', '')
    schedule = box.get('schedule','')
    exceptions = box.get('exceptions','')
    for box in do_locations['sheet1']:
        address_object = {
            "name": box['locationName'],
            "municipality": box['city'],
            "address": box['addressLine1'],
            "city": box['city'],
            "county": box['countyName'].title() + " County",
            "state": state,
            "zip": zipcode,
            "stateAbbreviation": state_abbreviation,
            "notes": "",
            "source": source_url,
            "phone": clerk_phone,
            "type": 'dropbox',
            "schedule": schedule + " " + exceptions,
            # "dateUpdated": date.today().strftime("%Y-%m-%d")
        }
        data.append(address_object)
    return data
