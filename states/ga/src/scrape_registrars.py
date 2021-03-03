import requests
import json
import re
import os

SOURCE_URL = "https://elections.sos.ga.gov/Elections/contactinfo.do"


COUNTY_RE = re.compile(r'\n(.+) County Chief Registrar')
PHYSICAL_RE = re.compile(r'Physical Address:\<\/h4\>\r\n(.+)\r')
MAILING_RE = re.compile(r'Mailing Address:\<\/h4\>\r\n(.+)\r')
PHONE_RE = re.compile(r'Telephone: ([\(\d\-\\) \w]+)')

OUTPATH = os.path.join("..", "raw_data", "registrars_raw.json")

def scrape_registrars():
    responses = []
    for i in range(1, 160):
        # Cookie in the call below does not include any personal/private information and is only needed as the application expects a cookie exists when making the call.
        responses.append(requests.post(
            SOURCE_URL,
            headers={
                u'Origin': u'https://elections.sos.ga.gov', 
                u'Content-Length': u'44', 
                u'Accept-Language': 
                u'en-US,en;q=0.5', 
                u'Connection': u'keep-alive', 
                u'Accept': u'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', 
                u'User-Agent': u'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0', 
                u'Host': u'elections.sos.ga.gov', 
                u'Referer': u'https://elections.sos.ga.gov/Elections/countyregistrars.do', 
                u'Cookie': u'JSESSIONID=5J-oBnodGX-t_zQ5IZMxC_CzvNCinDtVM8xqjfUn.ports-02; __cfduid=d95029cb8fe48649e5c07d299197c66711602702222', 
                u'Upgrade-Insecure-Requests': u'1', 
                u'Content-Type': u'application/x-www-form-urlencoded'
            },

            data=f"idTown={i:03}&SubmitCounty=Submit&contactType=R",
        ))
    return responses

def cleanup(s):
    return re.sub("<br>|(\r)", "", s)

def fixcase(s):
    return s[0].upper() + s[1:].lower()

def county_name(s):
    return " ".join(fixcase(word) for word in s.split(" "))

def try_extract(s, regex):
    matches = regex.findall(s)
    if len(matches) > 0:
        return cleanup(matches[0])
    else:
        return ""

def get_info(s):
    county = county_name(try_extract(s, COUNTY_RE))
    phys = try_extract(s, PHYSICAL_RE)
    mail = try_extract(s, MAILING_RE)
    phone = try_extract(s, PHONE_RE)
    return (county, phone, phys, mail)

def response_to_loc(res):
    county, phone, phys_addr, mail_addr = get_info(res.text)
    addr = phys_addr if phys_addr != "" else mail_addr
    return {
        "raw_address": addr,
        "raw_mail_address": mail_addr,
        "county": county,
        "municipality": county,
        "name": f"{county} Board of Registrars Office",
        "source": "https://elections.sos.ga.gov/Elections/contactinfo.do",
        "state": "Georgia",
        "stateAbbreviation": "GA",
        "type": "clerk",
        "timezone": "Eastern",
        "notes": "You may drop off your absentee ballot at your county's Board of Registrars office",
        "phone": phone,
        "schedule": f"Call {phone} for schedule" if phone != "" else "Schedule not listed",
    }

responses = scrape_registrars()
locations = []
for r in responses:
    locations.append(response_to_loc(r))
with open(OUTPATH, "w") as f:
    json.dump(locations, f, indent=2)
