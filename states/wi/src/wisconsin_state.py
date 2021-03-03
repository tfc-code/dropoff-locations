import requests
from scrapy.selector import Selector
from datetime import date
import csv

def import_municipal_offices():
    # Hardcode data
    state = 'Wisconsin'
    state_abbreviation = 'WI'

    ignored_strings = [
        'STATE OF WISCONSIN',
        'Municipality',
        'Printed 8/7/2020 10:35:34 AM'
    ]

    data = []
    # URL where data was manaully copied to CSV from
    source_url = "https://elections.wi.gov/sites/elections.wi.gov/files/2020-08/WI%20Municipal%20Clerks%20Updated%208-7-20.pdf"

    filepath = "./raw_data/municipal-clerks.csv"

    current_city = ""
    current_county = ""
    current_address = ""
    current_phone = ""

    has_seen_blank_city_line = False;
    expecting_second_address_line = False;
    with open(filepath, newline='') as csvfile:
        csvfile = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in csvfile:
            # check if this is a new section
            # if so grab city and/or county name
            if row[0] != "" and row[0] not in ignored_strings:
                if "COUNTY" in row[0]:
                    current_county = row[0].replace('-', '').strip()

                elif has_seen_blank_city_line:
                    current_city = row[0].replace('-', '').strip()
                    has_seen_blank_city_line = False
                else:
                    current_city += " " + row[0]
            elif row[0] == "":
                has_seen_blank_city_line = True;
        
            # check if this is address row one or two
            if 'Municipal Address' in row[2]:
                current_address = row[2].replace('Municipal Address:', '').replace('Municipal Address :', '').strip()
                if row[3] != "":
                    current_address += " " + row[3].strip()
                expecting_second_address_line = True
            elif expecting_second_address_line:
                current_address += " " + row[2].strip()
                # sometimez zipcode ends up in the next column
                if row[3] != "":
                    current_address += " " + row[3].strip()
                expecting_second_address_line = False
            
            # check if this is a phone row
            # also phone is the last piece of data so push the full location unto the list
            if 'Phone 1' in row[2]:
                current_phone = row[2].replace('Phone 1:', '').strip()
                address_object = {
                    "municipality": current_city.split('-')[0].replace(current_county, '').strip().title(),
                    "address": current_address.split(',')[0].title().strip(),
                    "city": current_address.split(',')[1].title().strip(),
                    "county": current_county.title().strip(),
                    "state": state,
                    "zip": current_address.split(',')[2].replace(state_abbreviation, '').strip(),
                    "stateAbbreviation": state_abbreviation,
                    "source": source_url,
                    "notes": "",
                    "phone": current_phone,
                    "schedule": "Municipal office, please call for open hours.",
                    "type": 'clerk',
                    # "dateUpdated": date.today().strftime("%Y-%m-%d")
                }
                data.append(address_object)
    return data

def import_county_offices():
    # Hardcode data
    state = 'Wisconsin'
    state_abbreviation = 'WI'

    start_date = '2020-10-20'
    end_date = '2020-11-01'

    ignored_strings = [
        'STATE OF WISCONSIN',
        'County',
        'Printed 8/7/2020 10:34:36 AM',
        'Printed 8/7/2020 10:35:34 Am'
    ]

    data = []
    # URL where data was manaully copied to CSV from
    source_url = "https://elections.wi.gov/sites/elections.wi.gov/files/2020-08/WI%20County%20Clerks%20Updated%208-7-20.pdf"

    filepath = "./raw_data/county-clerks.csv"

    current_county = ""
    current_address = ""
    current_phone = ""

    expecting_second_address_line = False;
    with open(filepath, newline='') as csvfile:
        csvfile = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in csvfile:
            # check if this is a new section
            # if so grab city and/or county name
            if row[0] != "" and row[0].strip() not in ignored_strings:
                current_county = row[0].split('-')[0].strip()
                has_seen_blank_county_line = False
        
            # check if this is address row one or two
            if 'MUNICIPAL ADDRESS' in row[1]:
                current_address = row[1].replace('MUNICIPAL ADDRESS:', '').replace('MUNICIPAL ADDRESS :', '').strip()
                if row[2] != "":
                    current_address += " " + row[2].strip()
                expecting_second_address_line = True
            elif expecting_second_address_line:
                current_address += " " + row[1].strip()
                # sometimez zipcode ends up in the next column
                if row[2] != "":
                    current_address += " " + row[2].strip()
                expecting_second_address_line = False
            
            # check if this is a phone row
            # also phone is the last piece of data so push the full location unto the list
            if 'Phone 1' in row[1]:
                current_phone = row[1].replace('Phone 1:', '').strip()
                address_object = {
                    "municipality": current_county.title(),
                    "address": current_address.split(',')[0].title().strip(),
                    "city": current_address.split(',')[1].title().strip(),
                    "county": current_county.title().strip(),
                    "state": state,
                    "zip": current_address.split(',')[2].replace(state_abbreviation, '').strip(),
                    "stateAbbreviation": state_abbreviation,
                    "source": source_url,
                    "notes": "",
                    "phone": current_phone,
                    "schedule": "County office, please call for hours.",
                    "type": 'clerk',
                    # "dateUpdated": date.today().strftime("%Y-%m-%d")
                }
                data.append(address_object)
    return data



