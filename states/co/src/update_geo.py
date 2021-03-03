import os
import json
import googlemaps

SECRETS_PATH = os.path.join(
    "..", "..", "..", "secrets.json"
    # "secrets.json"
)

# This script requires a Google Maps API key.
GMAP_KEY = 'INSERT_YOUR_KEY_HERE'

OVERRIDES = {
    "Colorado_Montezuma_Towaoc_Towaoc_124 Mike Wash Road_dropbox": {
        "address": "124 Mike Wash Road"
    },
    "Colorado_Weld_Greeley_Greeley_1051 22nd St_pollingPlace": {
        "zip": "80631"
    }
}

def get_gmap_client():
    return googlemaps.Client(key=GMAP_KEY)


def get_geocode(gc, addr, state):
    return gc.geocode(
        addr, 
        components={"administrative_area": state, "country": "US"}
    )


def get_components(geocode, component):
    return list(filter(
        lambda x: component in x["types"],
        geocode["address_components"]
    ))

def get_component(geocode, component, short=True):
    if short:
        version = "short_name"
    else:
        version = "long_name"
    components = get_components(geocode, component)
    if len(components) >= 1:
        return components[0].get(version)
    else:
        return None
    
def get_street_address(geocode):
    # define street address as formatted address up to city
    formatted_address = geocode["formatted_address"]
    end_of_street_marker = get_component(geocode, "locality")
    if end_of_street_marker is None or end_of_street_marker not in formatted_address:
        end_of_street_marker = get_component(geocode, "administrative_area_level_1")
    if end_of_street_marker not in formatted_address:
        return ""
    addr = formatted_address.split(end_of_street_marker)[0].strip()
    if addr != "" and addr[-1] == ",":
        addr = addr[:-1]
    return addr

def get_location_by_key(locations, key):
    for location in locations:
        if "locationKey" in location and location["locationKey"] == key:
            return location


def update_geos(locations):
    gc = get_gmap_client()
    with open("/output/all-colorado.json") as f:
        past_locations = json.load(f);
        new_locations = []
        for d in locations:
            d["rawAddress"] = d["address"] + " " + d["city"] + " " + d["state"] + " " + str(d["zip"])
            d["locationKey"] = d['state'] + "_" + d['county'] + "_" + d['municipality'] + "_" + d['city'] + '_' + d['address'] + '_' + d['type']
            past_location = get_location_by_key(past_locations, d["locationKey"])
            if past_location and 'placeId' in past_location:
                d["formattedAddress"] = past_location["formattedAddress"]
                d["address"] = past_location["address"]
                d["city"] = past_location["city"]
                d["zip"] = past_location["zip"]
                d["latitude"] = past_location["latitude"]
                d["longitude"] = past_location["longitude"]
                d["placeId"] = past_location["placeId"]
            else:    
                geocode = get_geocode(gc, d["rawAddress"], d["stateAbbreviation"])
                if len(geocode) > 0:
                    d["formattedAddress"] = geocode[0]["formatted_address"]
                    d["address"] = get_street_address(geocode[0])
                    d["city"] = get_component(geocode[0], "locality")
                    d["zip"] = get_component(geocode[0], "postal_code")
                    d["latitude"] = geocode[0]["geometry"]["location"]["lat"]
                    d["longitude"] = geocode[0]["geometry"]["location"]["lng"]
                    d["placeId"] = geocode[0]["place_id"]
            if d["locationKey"] in OVERRIDES:
                d['address'] =  OVERRIDES[d["locationKey"]].get('address', d['address'])
                d['zip'] =  OVERRIDES[d["locationKey"]].get('zip', d['zip'])
            new_locations.append(d)
    return new_locations
