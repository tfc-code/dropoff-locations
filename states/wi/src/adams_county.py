import requests
from scrapy.selector import Selector
from datetime import date
import csv

def import_municipal_offices():
    # Hardcode data for this county
    county = 'Adams'
    state = 'Wisconsin'
    state_abbreviation = 'WI'

    start_date = '2020-10-20'
    end_date = '2020-11-01'

    data = []

    # URL where data was manaully copied to CSV from
    # url is no longer available, but does not include sensitive info
    source_url = "https://doc-00-4s-docs.googleusercontent.com/docs/securesc/5ljikpk8dnko3p0s02453lr0bp7laq7v/571c8vv398bjssscumqgjn2r56q6s424/1600016400000/15107969484419669194/07019630394872503834/1VTPWwOQRQHHwNDqajkS7F3zXVLUbEP9k?e=download&authuser=0&nonce=0i2v1ku80sukm&user=07019630394872503834&hash=ia4unj7s44ha2hdu6frhet1c35kud7h2"

    filepath = "./raw_data/adams-county/adams-county-municipal-clerks.csv"
    with open(filepath, newline='') as csvfile:
        csvfile = csv.reader(csvfile, delimiter=',', quotechar='"')
        for row in csvfile:

            city = row[3].split(',')[0]
            zipcode = row[3].split(',')[1].replace(' WI ', '')

            address_object = {
                "municipality": row[1],
                "address": row[2],
                "city": city,
                "county": county,
                "state": state,
                "zip": zipcode,
                "stateAbbreviation": state_abbreviation,
                "source": source_url,
                "startDate": start_date,
                "endDate": end_date,
                "phone": row[4],
                "hours": row[5],
                "dateUpdated": date.today().strftime("%Y-%m-%d")
            }
            data.append(address_object)
    
    return data


def import_adams_county():
    data = []
    data = data + import_municipal_offices()
    return data