import os
import json
import datetime

FL_FINAL = os.path.join(
    '..', '..', '..', 'api', 'data', 'all-florida.json'
)
CUTOFFS = ["11/01/2020", "11/1/2020"]

def still_open_after(site, cutoffs):
    if isinstance(site['schedule'], str):
        return True
    return not(max(sched['endDate'] for sched in site['schedule']) in cutoffs)


with open(FL_FINAL) as f:
    sites = json.load(f)


still_open_sites = [s for s in sites if still_open_after(s, CUTOFFS)]


with open(FL_FINAL, 'w') as f:
    json.dump(still_open_sites, f, indent=2) 