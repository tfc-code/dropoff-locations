import os
import json
import googlemaps

SECRETS_PATH = os.path.join(
    "..", "..", "..", "secrets.json"
    # "secrets.json"
)

# This script requires a Google Maps API key.
GMAP_KEY = 'INSERT_YOUR_KEY_HERE'

LOCATIONS_TO_SKIP = {
    "Wisconsin_Ashland County_Town Of Agenda_Butternut_73922 Agenda Rd_clerk": {},
    "Wisconsin_Buffalo County_Town Of Alma_Alma_S1445 County Road F_clerk": {
        "address": "S1445 Co Rd F"
    },
    "Wisconsin_Buffalo County_Town Of Nelson_Durand_W2164 County Rd D_clerk": {
        "address": "W2164 County Rd D"
    },
    "Wisconsin_Calumet County_Town Of Harrison_Menasha_W5298 State Road 114_clerk": {
        "address": "W5298 State Road 114"
    },
    "Wisconsin_Calumet County_Village Of Harrison Multiple Counties_Menasha_W5298 State Road 114_clerk": {
        "address": "W5298 State Road 114"
    },
    "Wisconsin_County_Town Of Blue Mounds_Blue Mounds_10566 Blue Vista Rd_clerk": {
        "address": "10566 Blue Vista Rd"
    },
    "Wisconsin_Dane County_Village Of Windsor_De Forest_4084 Mueller Rd_clerk": {
        "address": "4084 Muller Rd",
        "city": "De Forest"
    },
    "Wisconsin_County_Village Of Forestville_Forestville_123 S Forestville Ave_clerk": {
        "address": "123 S Forestville Ave"
    },
    "Wisconsin_Douglas County_Town Of Cloverland_Maple_2763 S State Road 13_clerk": {
        "address": "2763 S State Road 13"
    },
    "Wisconsin_Douglas County_Town Of Lakeside_Poplar_3196 S Poplar River Rd_clerk": {
        "address": "3196 S Poplar River Rd"
    },
    "Wisconsin_Dunn County_Town Of Menomonie_Menomonie_E4055 550Th Ave_clerk": {
        "address": "E4055 550Th Ave"
    },
    "Wisconsin_Dunn County_Town Of Tainter_Colfax_N8150 County Road Dg_clerk": {
        "addrses": "N8150 CTH DG"
    },
    "Wisconsin_Eau Claire County_Town Of Brunswick_Eau Claire_W5485 County Road Z_clerk": {
        "address": "W5485 County Road Z"
    },
    "Wisconsin_Grant County_Town Of Cassville_Cassville_515 Railroad Alley_clerk": {
        "address": "515 Railroad Alley"
    },
    "Wisconsin_Green Lake County_Town Of Kingston_Dalton_W6408 E Pine St_clerk": {
        "address": "W6408 E Pine St",
        "city": "Dalton"
    },
    "Wisconsin_Green Lake County_Town Of St. Marie_Princeton_W3393 County Road Cc_clerk": {
        "address": "W3393 Co Rd Cc"
    },
    "Wisconsin_Green Lake County_Town Of Seneca_Berlin_W3102 County Road F_clerk": {
        "address": "W3102 County Road F"
    },
    "Wisconsin_Jackson County_Town Of Alma_Alma Center_142 W Clark Street_clerk": {
        "address": "142 W Clark Street"
    },
    "Wisconsin_Jackson County_Town Of Melrose_Melrose_N1701 North Rd_clerk": {
        "address": "N1701 North Rd",
        "city": "Melrose"
    },
    "Wisconsin_Kewaunee County_Town Of Lincoln_Casco_N8016 Maple Rd_clerk": {
        "address": "N8016 Maple Rd",
        "city": "Casco"
    },
    "Wisconsin_La Crosse County_Town Of Farmington_Mindoro_N8309 County Road C_clerk": {
        "address": "N8309 County Road C",
        "city": "Mindoro",
    },
    "Wisconsin_La Crosse County_City Of La Crosse_La Crosse_400 La Crosse St_clerk": {
        "address": "400 La Crosse St"
    },
    "Wisconsin_County_Town Of Willow Springs_Mineral Point_17614 Ridge Street_clerk": {
        "address": "17614 Ridge Street"
    },
    "Wisconsin_Langlade County_Town Of Ainsworth_Deerbrook_N9299 County Road Tt_clerk": {
        "address": "N9299 County Road Tt",
    },
    "Wisconsin_Lincoln County_Town Of Harrison_Tomahawk_N10095 County Road B_clerk": {
        "address": "N10095 County Road B"
    },
    "Wisconsin_Lincoln County_Town Of Schley_Merrill_W1696 County Road C_clerk": {
        "address": "W1696 County Road C"
    },
    "Wisconsin_Marathon County_Village Of Maine_Wausau_6111 N 44Th Ave_clerk": {
        "address": "6111 N 44Th Ave"
    },
    "Wisconsin_Marinette County_Town Of Amberg_Amberg_N15035 Grant St_clerk": {
        "address": "N15035 Grant St"
    },
    "Wisconsin_Marinette County_Town Of Athelstane_Athelstane_N12244 County Road Ac_clerk": {
        "address": "N12244 County Road Ac"
    },
    "Wisconsin_Marinette County_Town Of Niagara_Niagara_N22380 Hansen Rd_clerk": {
        "address": "N22380 Hansen Rd"
    }, 
    "Wisconsin_Marquette County_Town Of Buffalo_Montello_W3205 County Road O_clerk": {
        "address": "W3205 County Road O"
    },
    "Wisconsin_Oconto County_Town Of Gillett_Gillett_10908 Town Hall Rd_clerk": {
        "address": "10908 Town Hall Rd"
    },
    "Wisconsin_Oneida County_Town Of Woodboro_Harshaw_8672 Old County K_clerk": {
        "address": "8672 Old County K"
    },
    "Wisconsin_Outagamie County_Village Of Kimberly_Kimberly_515 W Kimberly Ave_clerk": {
        "address": "515 W Kimberly Ave"
    },
    "Wisconsin_Outagamie County_City Of Appleton Multiple Counties_Appleton_100 N Appleton St_clerk": {
        "address": "100 N Appleton St"
    },
    "Wisconsin_Ozaukee County_Town Of Fredonia_Fredonia_242 Fredonia Ave_clerk": {
        "address": "242 Fredonia Ave"
    },
    "Wisconsin_Ozaukee County_Village Of Fredonia_Fredonia_242 Fredonia Ave_clerk": {
        "address": "242 Fredonia Ave"
    },
    "Wisconsin_Pierce County_Town Of Spring Lake_Spring Valley_N7717 County Road B_clerk": {
        "address": "N7717 County Road B"
    },
    "Wisconsin_Polk County_Village Of Clayton_Clayton_133 W Clayton Ave_clerk": {
        "address": "133 W Clayton Ave"
    },
    "Wisconsin_Racine County_Town Of Raymond_Franksville_2255 76Th St_clerk": {
        "city": "Franksville"
    },
    "Wisconsin_Racine County_Village Of Raymond_Franksville_2255 76Th St_clerk": {
        "city": "Franksville"
    },
    "Wisconsin_Rusk County_Town Of Murry_Bruce_W10625 Lone Pine Rd_clerk": {
        "address": "W10625 Lone Pine Rd"
    },
    "Wisconsin_County_Town Of Rusk  Rusk_Chetek_N704 County Road F_clerk": {
        "address": "N704 County Road F"
    },
    "Wisconsin_Rusk County_Village Of Sheldon_Sheldon_W5594 Main St_clerk": {
        "address": "W5594 Main St"
    },
    "Wisconsin_County_Village Of Rock Springs_Rock Springs_101 1St St_clerk": {
        "address": "101 1St St"
    },
    "Wisconsin_Sawyer County_Town Of Edgewater_Birchwood_1470 N Wooddale Rd_clerk": {
        "address": "1470 N Wooddale Rd"
    },
    "Wisconsin_Shawano County_Town Of Angelica_Pulaski_W3285 County Road C_clerk": {
        "address": "W3285 County Road C"
    },
    "Wisconsin_Taylor County_Town Of Grover_Medford_W11062 2Nd St_clerk": {
        "address": "W11062 2Nd St"
    },
    "Wisconsin_County_Town Of Chimney Rock_Strum_N43299 Church_clerk": {
        "address": "N43299 Church"
    },
    "Wisconsin_Vernon County_Town Of Greenwood_Hillsboro_S4105 County Highway C_clerk": {
        "address": "S4105 County Highway C",
        "city": "Hillsboro"
    },
    "Wisconsin_Vernon County_Town Of Sterling_Viroqua_E5498 Yanske Ave_clerk": {
        "address": "E5498 Yanske Ave",
        "city": "Viroqua"
    },
    "Wisconsin_Washburn County_Town Of Barronett_Shell Lake_N1608 S Heart Lake Rd_clerk": {
        "address": "N1608 S Heart Lake Rd",
        "city": "Shell Lake"
    },
    "Wisconsin_Washburn County_Town Of Stone Lake_Stone Lake_N6071 Stone Lake Rd_clerk": {
        "address": "N6071 Stone Lake Rd"    
    },
    "Wisconsin_Washington County_Village Of Richfield_Hubertus_4128 Hubertus Rd_clerk": {
        "address": "4128 Hubertus Rd"
    },
    "Wisconsin_Washington County_Village Of Slinger_Slinger_300 Slinger Rd_clerk": {
        "address": "300 Slinger Rd"
    },
    "Wisconsin_Waukesha County_City Of Pewaukee_Pewaukee_W240N3065 Pewaukee Rd_clerk": {
        "address": "W240N3065 Pewaukee Rd"
    },
    "Wisconsin_Waupaca County_Town Of Harrison_Iola_E1389 Cty C_clerk": {
        "address": "E1389 Cty C"
    },
    "Wisconsin_Waupaca County_Town Of Union_Bear Creek_E6592 State Road 22_clerk": {

    },
    "Wisconsin_Waushara County_Town Of Dakota_Wautoma_N1470 State Road 22_clerk": {
        "address": "N1470 State Road 22",
        "city": "Wautoma"
    },
    "Wisconsin_Racine County_Racine County_Racine_730 Wisconsin Ave_clerk": {
        "address": "730 Wisconsin Ave"
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
        if location["locationKey"] == key:
            return location


def update_geos(locations):
    gc = get_gmap_client()
    with open("/output/all-wisconsin.json") as f:
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
                d["county"] = past_location["county"]
            elif d["locationKey"] in LOCATIONS_TO_SKIP:
                new_locations.append(d)
                continue
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
                    d["county"] = get_component(geocode[0], "administrative_area_level_2")
            new_locations.append(d)
    return new_locations
