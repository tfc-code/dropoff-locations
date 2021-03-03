import requests
from scrapy.selector import Selector
from datetime import date

def scrape_alachua_county():
    # Hardcode data for this county
    county = 'Alachua'
    state = 'Florida'
    state_abbreviation = 'FL'

    # data manually grabbed from the page
    # was much easier than scraping
    hours = '9 a.m. to 6 p.m'
    start_date = '2020-10-19'
    end_date = '2020-10-31'

    # URL where ballot box locations are listed
    url = "https://www.votealachua.com/Voters/Vote-by-Mail/Vote-by-Mail-Ballot-Drop-Boxes"
    
    # Grab the page
    response = requests.get(url)

    # Extract the elements that hold the locations
    locations = Selector(text=response.text).css('#dnn_ctr36941_HtmlModule_lblContent ul li span span')
    
    data = []

    #iterate through each location
    for location in locations:
        # get the test from the element
        location_string = location.css('::text').extract()[0]

        # grab the placename
        location_name = location_string.split('(')[0].strip('\xa0')
        location_string = location_string.split('(', 1)[1]

        # grab the address
        address_number = location_string.split(' ')[0]
        location_string = location_string.split(' ', 1)[1]

        # grab the street
        address_street = location_string.split(',')[0]
        location_array = location_string.split(', ')
        location_string = location_array[1]
        address_extra = ''

        # check if address has two items
        if len(location_array) > 2:
            address_extra = location_array[1]
            location_string = location_array[2]

        # grab the city
        address_city = location_string.split(')')[0]

        address_object = {
            "name":  location_name,
            "address": address_number,
            "street": address_street,
            "extra": address_extra,
            "city": address_city,
            "county": county,
            "state": state,
            "stateAbbreviation": state_abbreviation,
            "source": url,
            "startDate": start_date,
            "endDate": end_date,
            "hours": hours,
            "dateUpdated": date.today().strftime("%Y-%m-%d")
        }
        data.append(address_object)

    # add in Aluchua County Office which has a 24/7 box
    # manually added here as scrapinig would be ineffecient and
    # it is unlikely to change
    address_object = {
        "name":  "Alachua County Supervisor of Elections Office",
        "address": "515",
        "street": "N. Main Street",
        "extra": "",
        "city": "Gainesville",
        "zip": "32601",
        "county": county,
        "state": state,
        "stateAbbreviation": state_abbreviation,
        "source": url,
        "startDate": start_date,
        "endDate": end_date,
        "hours": "24/7",
        "dateUpdated": date.today().strftime("%Y-%m-%d")
    }
    data.append(address_object)

    return data

