import requests
from scrapy.selector import Selector
from datetime import date
import csv

def import_municipal_offices():
    # Hardcode data for this county
    county = 'Ashland'
    state = 'Wisconsin'
    state_abbreviation = 'WI'

    start_date = '2020-10-20'
    end_date = '2020-11-01'

    data = []

    # page listing all municipalities in the county
    source_url = "https://co.ashland.wi.us/index.asp?SEC=B6B31CF4-1CD5-4B83-97F3-E26D4ABBE387&Type=B_BASIC"
    response = requests.get(source_url)

    # Extract the list of municipalities
    municipality_urls = Selector(text=response.text).css('.mainTable .subsections li a')

    # loop through each one to extract address
    for municipality_url in municipality_urls:
        # build a url for the municipal page
        url = 'https:' + municipality_url.attrib['href']

        # load the url
        municipal_response = requests.get(url)

        # parse the page
        municipal_selector = Selector(text=municipal_response.text).css('.mainTable .centerColumn .sectionIntro')

        # extract the data
        city = municipal_selector.css('h1::text').extract()[0]
        name =  municipal_selector.css('.body div::text').extract()[0]

        # peeksville has a slightly different format
        if city == 'Town of Peeksville':
            address = municipal_selector.css('.body div::text').extract()[1].split(',')[0]
            zipcode = municipal_selector.css('.body div::text').extract()[1].split(',', 1)[1].split(',')[1].replace(' WI\xa0 ', '')
        else:
            name =  municipal_selector.css('.body div::text').extract()[0]
            address = municipal_selector.css('.body div::text').extract()[1]
            zipcode = municipal_selector.css('.body div::text').extract()[2].split(',')[1].replace(' WI\xa0 ', '')
            phone = municipal_selector.css('.body div::text').extract()[3]

        address_object = {
            "municipality": city,
            "address": address,
            "city": city,
            "county": county,
            "state": state,
            "zip": zipcode,
            "stateAbbreviation": state_abbreviation,
            "source": source_url,
            "startDate": start_date,
            "endDate": end_date,
            "phone": phone,
            # "hours": row[5],
            "dateUpdated": date.today().strftime("%Y-%m-%d")
        }
        data.append(address_object)
    return data

def import_ashland_county():
    data = []
    data = data + import_municipal_offices()
    return data
