import os
import json
import googlemaps
from florida_xlsx import OUTPUT_PATH as DATA_PATH

# DATA_PATH = "api/data/all-florida.json"

GEOCODE_PATH = os.path.join(
    "..", "raw_data", "all-florida-stage2.json"
)

FINAL_PATH = os.path.join(
    "..", "raw_data", "all-florida-stage3.json"
)

SECRETS_PATH = os.path.join(
    "..", "..", "..", "secrets.json"
    # "secrets.json"
)
SPECIAL_ADDR_FIXES = {
    "530 Whitehead St 101, Key West, FL": "530 Whitehead St #101, Key West, FL 33040, USA",
    "239 Spring Street": "239 N Spring St, Pensacola, FL 32502, USA",
    "105 E Monroe Street": "105 E Monroe St, Jacksonville, FL 32202, USA",
    "1000 Water Street": "1000 Water St, Jacksonville, FL 32204, USA",
    "304 NW 2nd St": "304 NW 2nd St #144, Okeechobee, FL 34972, USA",
    "102 Copeland Ave N": "102 Copeland Ave, Everglades City, FL 34139, USA",
    "600 3rd Street": "600 3rd Street, Neptune Beach, FL 32266, USA",
}


MANUAL_OVERRIDES = {
    "166 SW Onslow St Greenvile, FL 32059": {
        "formatted_address": "166 SW Onslow St, Greenville, FL 32331, USA",
        "address": "166 SW Onslow St",
        "city": "Greenville",
        "latitude": 30.468954,
        "longitude":  -83.631543,
    },
    "912 NW Ave A, Carrabelle, FL 32322": {
        "formatted_address": "Franklin County Courthouse Annex, FL 32322, USA",
        "address": "Franklin County Courthouse Annex",
        "city": "Franklin",
        "latitude": 29.8517521,
        "longitude": -84.6440801,
    }
}


def get_gmap_client():
    with open(SECRETS_PATH) as f:
        gmap_key = json.load(f)["GMAP_KEY"]
    return googlemaps.Client(key=gmap_key)


def get_geocode(gc, loc):
    addr = loc["raw_address"]
    if addr in SPECIAL_ADDR_FIXES:
        addr = SPECIAL_ADDR_FIXES[addr]
    elif addr in MANUAL_OVERRIDES.values():
        return []
    return gc.geocode(
        addr, 
        components={"administrative_area": "FL", "country": "US"}
    )[0]

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

def add_geocodes():
    with open(DATA_PATH) as f:
        data = json.load(f)
    gc = get_gmap_client()
    for d in data:
        d["geocode"] = get_geocode(gc, d)
    with open(GEOCODE_PATH, 'w') as f:
        json.dump(data, f, indent=2)


def finalize_data():
    with open(GEOCODE_PATH) as f:
        data = json.load(f)
    for d in data:
        if d["raw_address"] in MANUAL_OVERRIDES:
            d.update(MANUAL_OVERRIDES[d["raw_address"]])
        else:
            d["formatted_address"] = d["geocode"]["formatted_address"]
            d["address"] = get_street_address(d["geocode"])
            d["city"] = get_component(d["geocode"], "locality")
            d["latitude"] = d["geocode"]["geometry"]["location"]["lat"]
            d["longitude"] = d["geocode"]["geometry"]["location"]["lng"]
    for d in data:
        d.pop("geocode")
    with open(FINAL_PATH, "w") as f:
        json.dump(data, f, indent=2)

add_geocodes()
finalize_data()