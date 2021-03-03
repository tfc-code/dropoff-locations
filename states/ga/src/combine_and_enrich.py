# Combine registrar and dropbox data, and refine w/ Google Locations API
import os
import json
import re
import pandas as pd
import googlemaps

DROPBOX_PATH = os.path.join(
    "..", "raw_data", "dropboxes_raw.csv",
)

REGISTRARS_PATH = os.path.join(
    "..", "raw_data", "registrars_raw.json"
)

GEOCODED_PATH = os.path.join(
    "..", "raw_data", "combined_geocoded.json",
)

OUT_PATH = os.path.join(
    "..", "..", "..", "api", "data", "all-georgia.json",
)

SECRETS_PATH = os.path.join(
    "..", "..", "..", "secrets.json"
    # "secrets.json"
)
SPECIAL_ADDR_FIXES = {
    "45 FOREST AVE,": "45 FOREST AVE ELBERTON, GA 30635-1807",
    "OFFICE IN BASEMENT OF THE BUILDING FACING CHURCH.": "12 EAST FOURTH AVENUE SUITE 20ROME, GA 30161-9313",
    "1201 SAWNEE DRIVE CUMMING, GA 30040": "1201 Sawnee Dr, Cumming, GA 30040",
    "    1201 Sawnee Drive, Cumming GA 30040": "1201 Sawnee Dr, Cumming, GA 30040", 
    "SAME AS ABOVE": "130 JACOB'S WAY SUITE 101CLARKESVILLE, GA 30523",
    "38 WEST MAIN ST.COUNTY ADMINISTRATION BUILDING": "38 W Main St, Forsyth, GA 31029",
    "46 OLD SCHOOL RD.": "46 Old School Rd., Georgetown, GA 39854",
    "125 W LINCOLN AVE POST OFFICE BOX 897LYONS, GA 30436-1370": "125 W LINCOLN AVE, LYONS, GA 30436-1370",
    "2525 Pio Nono Avenue, Suite 1200 Macon, Georgia 31206": "2525 Pio Nono Avenue #1200, Macon, GA 31206",
    "423 College Street, Room 302, Carrollton GA 30112": "423 College St. Carrollton, GA 30117",
    "2025 Baxter Street; Athens, GA 30601 ": "2025 Baxter St, Athens, GA 30606",
    "640 GA HWY 128 POST OFFICE BOX 732ROBERTA, GA 31078-0739": "640 GA-128, Roberta, GA 31078",
    "101 S. PIEDMONT STREETCALHOUN, GA  30701": "101 S Piedmont St,  Adairsville, GA 30103",
    "455 GRAYSON HWY 200LAWRENCEVILLE, GA 30046": "455 Grayson Hwy, Lawrenceville, GA 30046",
    "PO BOX 1435 GAINESVILLE, GA 30503": "2875 Browns Bridge Road (Lower Level), Gainesville, GA 30504",
    "337 MAIN ST SUITE 101P O BOX 600THOMSON, GA 30824-0600": "337 Main St, Thomson, GA 30824", 
    "222 PINE AVENUE, SUITE 220POST OFFICE BOX 1827ALBANY, GA 31702-1827":
        "222 Pine Avenue, 2nd Floor, Room 220, Albany, Georgia 31702",
}

# skip sanity checks when already manually verified
ZIP_CHECK_SKIPS = {
    "14097 Abercorn St Savannah",
    "2808 N. Oak St, Valdosta GA 31601",
    "101 S. PIEDMONT STREETCALHOUN, GA  30701",
    "455 Grayson Hwy, Lawrenceville, GA 30046",
    "4640 Dallas Hwy, Marietta, GA 30064",
    "5605 ROCKBRIDGE ROAD, STONE MOUNTAIN, GA 30087",
    "14 Jeff Davis Street, Fayetteville GA 30214"
    "222 Pine Avenue, 2nd Floor, Room 220, Albany, Georgia 31702",
    "222 PINE AVENUE, SUITE 220POST OFFICE BOX 1827ALBANY, GA 31702-1827",
    "423 College Street, Room 302, Carrollton GA 30112",
    "4800 Ashford Dunwoody Rd., Dunwoody, GA 30038",
    "14 Jeff Davis Street, Fayetteville GA 30214",
    "2380 Cobb Pkwy NW, Kennesaw, GA 30152",

}

MANUAL_OVERRIDES = {
    # "166 SW Onslow St Greenvile, FL 32059": {
    #     "formatted_address": "166 SW Onslow St, Greenville, FL 32331, USA",
    #     "address": "166 SW Onslow St",
    #     "city": "Greenville",
    #     "latitude": 30.468954,
    #     "longitude":  -83.631543,
    # },
}

def get_gmap_client():
    with open(SECRETS_PATH) as f:
        gmap_key = json.load(f)["GMAP_KEY"]
    return googlemaps.Client(key=gmap_key)


def get_geocode(gc, loc):
    if loc["raw_address"] in SPECIAL_ADDR_FIXES:
        loc["raw_address"] = SPECIAL_ADDR_FIXES[loc["raw_address"]]
    elif loc["raw_address"] in MANUAL_OVERRIDES.values():
        return []
    addr = loc["raw_address"]
    gcode = gc.geocode(
        addr, 
        components={"administrative_area": "GA", "country": "US"}
    )
    if len(gcode) > 0:
        return gcode[0]
    else:
        return None

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

def read_data():
    dropbox_data = pd.read_csv(DROPBOX_PATH).rename(columns={
        "County": "county", 
        "Raw Address": "raw_address",
        "Notes": "notes",
        "Name": "name",
    })
    dropbox_data["type"] = "dropbox"
    dropbox_data["schedule"] = "24/7"

    registrar_data = pd.read_json(
        REGISTRARS_PATH
    ).rename(columns={
        "stateAbbreviation": "state_abbreviation",
    }).drop(["raw_mail_address", ], axis=1)
    registrar_data["type"] = "clerk"

    combined = pd.concat([dropbox_data, registrar_data], axis=0)
    combined["state"] = "Georgia"
    combined["state_abbreviation"] = "GA"
    combined["timezone"] = "Eastern"
    combined["municipality"] = combined.county
    combined.fillna("", inplace=True)
    return combined.to_dict(orient="records")

def add_geocodes():
    data = read_data()
    gc = get_gmap_client()
    for d in data:
        d["geocode"] = get_geocode(gc, d)
        if not d["geocode"]:
            print(f"failure: {d['raw_address']}")
    with open(GEOCODED_PATH, 'w') as f:
        json.dump(data, f, indent=2)


def sanity_check():
    ZIP_RE = re.compile(r'\d{5}')
    with open(GEOCODED_PATH) as f:
        data = json.load(f)
    for d in data:
        raw = d["raw_address"]
        if raw in ZIP_CHECK_SKIPS:
            continue
        raw_zips = set(re.findall(ZIP_RE, raw))
        geo_zip = get_component(d["geocode"], "postal_code")
        if geo_zip not in raw_zips and len(raw_zips) > 0:
            print(f"ZIP MISMATCH: {geo_zip} NOT IN {raw}")


def finalize_data():
    with open(GEOCODED_PATH) as f:
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
        for k, v in d.items():
            if v == float("nan"):
                d[k] = None
            elif isinstance(v, str):
                d[k] = v.strip()
    with open(OUT_PATH, "w") as f:
        json.dump(data, f, indent=2)

add_geocodes()
sanity_check()
finalize_data()