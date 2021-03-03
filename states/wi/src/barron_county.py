import requests
from scrapy.selector import Selector
from datetime import date
import csv

def import_municipal_offices():
    # Hardcode data for this county
    county = 'Barron'
    state = 'Wisconsin'
    state_abbreviation = 'WI'

    # these are statewide dates, not specific to this county
    start_date = '2020-10-20'
    end_date = '2020-11-01'

    data = []

    # page listing all municipalities in the county
    source_url = "https://www.co.barron.wi.us/municipal.cfm"
    # load cached page
    filepath = "./raw_data/barron-county/barron-county-offices.html"
    with open(filepath, newline='') as htmlfile:
        # Extract the list of municipalities
        municipalities = Selector(text=htmlfile.read()).css('table table tr td.style5:nth-child(1)')

        # loop through each one to extract address
        for municipality in municipalities:
            # get city name from top table
            city = municipality.css('strong::text').extract()[0].strip()

            # navigate to the next table which will hold the data for the city
            city_data_node = municipality.xpath('parent::*').xpath('parent::*').xpath('parent::*').xpath('parent::*').xpath('following-sibling::*').xpath('following-sibling::*').css('td.style2')
            # grab the row that usually holds the city clerk data
            clerk_node = city_data_node.css('td::text').extract()
            # sometimes if the city doesn't have a website row the clerk is next, so account for this
            if len(clerk_node) < 2:
                city_data_node = municipality.xpath('parent::*').xpath('parent::*').xpath('parent::*').xpath('parent::*').xpath('following-sibling::*').css('td.style2')
                clerk_node = city_data_node.css('td::text').extract()
            
            # get phone number
            phone = clerk_node[3]

            # address is always the third (index 2) column
            address = clerk_node[2]

            # sometimes there is a PO Box and and address, if so strip out the PO Box
            if len(address.split(',')) > 2:
                address = address.split(',', 1)[1]
            
            # if we still have "PO Box" in the address then there is no physical addrress here
            # and we should not count this as a location
            if "PO Box" in address:
                continue
    
            address_object = {
                "municipality": city,
                "address": address.split(',')[0],
                "city": address.split(',')[1],
                "county": county,
                "state": state,
                "stateAbbreviation": state_abbreviation,
                "source": source_url,
                # "startDate": start_date,
                # "endDate": end_date,
                "phone": phone,
                # "hours": row[5],
                "dateUpdated": date.today().strftime("%Y-%m-%d")
            }
            data.append(address_object)
    return data

def import_barron_county():
    data = []
    data = data + import_municipal_offices()
    return data
