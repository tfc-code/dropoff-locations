import requests
from scrapy.selector import Selector
from datetime import date
import re
import csv

def import_madison_dropboxes():
    # Hardcode data for this county
    county = 'Dane County'
    state = 'Wisconsin'
    state_abbreviation = 'WI'   
    data = []

    # URL where data was manaully copied to CSV from
    source_url = "https://www.cityofmadison.com/clerk/elections-voting/voting/vote-absentee/ballot-drop-off-sites"

    filepath = "./raw_data/madison-city-dropoff-sites.html"
    with open(filepath, newline='') as htmlfile:
        html_content = htmlfile.read();
        # Extract the list of locations
        dream_buses = Selector(text=html_content).css('#block-system-main > div > div > div > div.col-md-8 > div > ul > li')
        for dream_bus in dream_buses:
            string = dream_bus.css('li::text').extract()[0]
            portions = string.split(',', 3)
            if len(portions) == 3:
                address_object = {
                    "name": "Library Dream Bus",
                    "municipality": "City Of Madison",
                    "address": portions[0].replace("\u00a0", ' ').strip(),
                    "city": "Madison",
                    "county": county,
                    "state": state,
                    "stateAbbreviation": state_abbreviation,
                    "notes": "Look for the poll worker alongside the Library Dream Bus at these locations",
                    "source": source_url,
                    "phone": '(608) 266-4601',
                    "type": 'other',
                    "zip": '',
                    "schedule": portions[1].strip().replace("\u00a0", ' ') + " " + portions[2].replace("\u00a0", ' ')
                    # "dateUpdated": date.today().strftime("%Y-%m-%d")
                }
            else:
                address_object = {
                    "name": "Library Dream Bus at " + portions[0].replace("\u00a0", ' ').strip(),
                    "municipality": "City Of Madison",
                    "address": portions[1].replace("\u00a0", ' ').strip(),
                    "city": "Madison",
                    "county": county,
                    "state": state,
                    "stateAbbreviation": state_abbreviation,
                    "notes": "A poll worker wearing a high visibility vest will be present outside the location to accept your absentee ballot and to serve as your witness, if needed, at the location (weather permitting)",
                    "source": source_url,
                    "phone": '(608) 266-4601',
                    "type": 'other',
                    "zip": '',
                    "schedule": portions[2].strip().replace("\u00a0", ' ') + " " + portions[3].replace("\u00a0", ' ')
                    # "dateUpdated": date.today().strftime("%Y-%m-%d")
                }
            data.append(address_object)

        parks = Selector(text=html_content).css('#block-system-main > div > div > div > div.col-md-8 > div > table > tbody > tr')
        for park in parks:
            address = park.css('td::text').extract()[1]
            name = park.css('td::text').extract()[0]
            address_object = {
                "name": name,
                "municipality": "City Of Madison",
                "address": address.replace("\u00a0", '').strip(),
                "city": "Madison",
                "county": county,
                "state": state,
                "stateAbbreviation": state_abbreviation,
                "notes": "Poll workers wearing high visibility vests will be present to accept your absentee ballot and to serve as your witness, if needed, at all City of Madison community, neighborhood, and mini parks from 9 a.m. to 3 p.m. on Saturday, September 26, and from 9 a.m. to 3 p.m. on Saturday, October 3.  Just look for the Vote yard sign at the park.  If we have inclement weather, the rain date will be the following day.",
                "source": source_url,
                "phone": '(608) 266-4601',
                "type": 'other',
                "schedule": "9 a.m. to 3 p.m. on Saturday, September 26, and from 9 a.m. to 3 p.m. on Saturday, October 3",
                # "dateUpdated": date.today().strftime("%Y-%m-%d")
                "zip": "",
            }
            if 'Cancelled' not in name:
                data.append(address_object)
    
    filepath = "./raw_data/madison-early-voting-locations.html"
    with open(filepath, newline='') as htmlfile:
        # Extract the list of locations
        early_voting_locations = Selector(text=htmlfile.read()).css('div.col-md-8 > div > p:nth-child(10)').extract()[0].split('<br>')
        
        expect_next_line_to_be_address = False
        expect_next_line_to_be_dates = False
        expect_next_line_to_be_hours = False
        extra = ""
        dates = ""
        for early_voting_location in early_voting_locations:

            if "<strong>" in early_voting_location:
                location_name = early_voting_location.replace('<strong>','').replace('</strong>','').replace('<p>','').strip()
                expect_next_line_to_be_address = True
            elif expect_next_line_to_be_address:
                address = early_voting_location.replace('</p>','').strip()
                expect_next_line_to_be_address = False
                expect_next_line_to_be_dates = True
            elif expect_next_line_to_be_dates:
                dates = early_voting_location.strip();
                expect_next_line_to_be_dates = False
                expect_next_line_to_be_hours = True
            elif expect_next_line_to_be_hours:
                hours =  early_voting_location.strip();
                expect_next_line_to_be_hours = False;
                
                # a few edge cases that need cleaning up
                if "Pearson Street" in address:
                    extra = address.split(',')[0].strip()
                    address = address.split(',')[1].strip()
                elif "Perry Street" in address:
                    extra = address.split(',')[1].strip()
                    address = address.split(',')[0].strip()
                elif "Predolin Hall" in address:
                    extra = address
                    address = '959 Edgewood College Dr'

                if extra.strip() == "":
                    extra = location_name
                else:
                    extra = location_name + ", " + extra

                schedule = ""
                if dates == "":
                    schedule = hours
                else:
                    schedule = dates + ", " + hours

                # address is the last bit needed so add to our data set
                address_object = {
                    "name": "",
                    "municipality": "City Of Madison",
                    "address": address.replace('\u00a0', ''),
                    "city": "Madison",
                    "county": county,
                    "state": state,
                    "stateAbbreviation": state_abbreviation,
                    "notes": extra,
                    "source": source_url,
                    "phone": '(608) 266-4601',
                    "type": "earlyVoting",
                    "schedule": schedule.replace("\u00a0", ''),
                    "zip": ""
                    # "dateUpdated": date.today().strftime("%Y-%m-%d")
                }
                if hours != "":
                    data.append(address_object)
                hours = ""
                dates = ""
                extra = ""  
    return data

