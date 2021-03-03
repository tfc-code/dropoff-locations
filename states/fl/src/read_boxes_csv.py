import os
import json
import googlemaps
import pandas as pd


SECRETS_PATH = os.path.join(
    "..", "..", "..", "secrets.json"
)

PBC_DADE_IN = os.path.join(
    '..', 'raw_data', 'pbc_dade_boxes.csv'
)
PBC_DADE_OUT = os.path.join(
    '..', 'raw_data', 'pbc_dade_boxes.json'
)
PIN_IN = os.path.join(
    '..', 'raw_data', 'pinellas_boxes.csv'
)
PIN_OUT = os.path.join(
    '..', 'raw_data', 'pinellas_boxes.json'
)
OFFICES_IN = os.path.join(
    '..', 'raw_data', 'fl_offices_plus.csv'
)
OFFICES_OUT = os.path.join(
    '..', 'raw_data', 'fl_offices_plus.json'
)
MANUAL_GEOCODE = {
    "13001 Starkey Road , Largo, FL 33773": {
        "address": "13001 Starkey Road",
        "latitude": 27.8900498,
        "longitude": -82.7584831,
    },
    "315 Court St., Room 117 , Clearwater, FL 33756": {
        "address": "315 Court Street Room 117",
        "latitude": 27.9619193,
        "longitude": -82.8013845,
    },
    "315 Court St #117 , Clearwater, FL 33756": {
        "address": "315 Court Street Room 117",
        "latitude": 27.9619193,
        "longitude": -82.8013845,
    },
    "7443 Forest Oaks Blvd , Spring Hill, FL 34606": {
        "address": "7443 Forest Oaks Blvd",
        "latitude": 28.4913649,
        "longitude": -82.5941707,
    },
    "10020 South U.S. Hwy. 301 , Riverview, FL 33578": {
        "address": "10020 South, US-301",
        "latitude": 27.8544371,
        "longitude": -82.3257493,
    },
    "600 301 Blvd W  Suite 108, Bradenton, FL 34205": {
        "address": "600 301 Blvd W",
        "latitude": 27.47004,
        "longitude": -82.5674089,
    },
    "13001 Starkey Rd , Largo, FL 33773": {
        "address": "13001 Starkey Rd",
        "latitude": 27.8900498,
        "longitude": -82.7584831,
    },
    "13640 Tamiami Trail , North Port, FL 13640": {
        "address": "13640 Tamiami Trail",
        "latitude": 27.0447115,
        "longitude":-82.2487432,
    },
    "7443 Forest Oaks Blvd , Spring Hill, FL 34606": {
        "address": "7443 Forest Oaks Blvd",
        "latitude": 28.4913649,
        "longitude": -82.5941707,
    }
}

def _addr_fix(addr):
    if addr == "Southeast PBC Administrative Complex, 345 S. Congress Ave , Delray Beach, FL 33445":
        return "345 S. Congress Ave , Delray Beach, FL 33445"
    return addr


def get_gmap_client():
    with open(SECRETS_PATH) as f:
        gmap_key = json.load(f)["GMAP_KEY"]
    return googlemaps.Client(key=gmap_key)

def get_raw_address(r):
    s = r['Address Line 1'] + ' '
    # if r['Address Line 2']:
    #     s = f'{s} {r["Address Line 2"]}'
    s = s + ', ' + r['City'] + ', FL ' + str(int(r['Zip']))
    return s

def get_type(ltype_str):
    if 'box' in ltype_str.lower():
        return 'dropbox'
    else:
        return 'other'

def get_geocode(addr):
    print(addr)
    gc = get_gmap_client()
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

def process_csv(in_path, out_path):
    sites = []
    
    data = pd.read_csv(in_path).fillna('')
    for r in data.to_dict(orient='records'):
        if r['County'].strip() == '':
            break
        sites.append({
            'raw_address': get_raw_address(r),
            'county': r['County'],
            # 'municipality': r['Municipality'],
            'municipality': r['County'],
            'name': r['Location Name'],
            'source': r['URL'],
            'state': 'Florida',
            'stateAbbreviation': 'FL',
            'type': get_type(r['Location Type']),
            'zip': str(int(r['Zip'])),
            'city': r['City'],
            'notes': r['Special Rules and Instructions'],
            'phone': '',
            'schedule': r['Voting Dates and Times'],
            'addr_2': r['Address Line 2'],
        })
    for s in sites:
        addr = s["raw_address"]
        if addr in MANUAL_GEOCODE:
            s.update(MANUAL_GEOCODE[addr])
            continue
        gc = get_geocode(_addr_fix(s['raw_address']))
        s["address"] = street_addr = " ".join([get_street_address(gc), s["addr_2"]])
        s["latitude"] = gc["geometry"]["location"]["lat"]
        s["longitude"] = gc["geometry"]["location"]["lng"]
    with open(out_path, 'w') as f:
        json.dump(sites, f, indent=2)

# process_csv(PBC_DADE_IN, PBC_DADE_OUT)
# process_csv(PIN_IN, PIN_OUT)
process_csv(OFFICES_IN, OFFICES_OUT)
