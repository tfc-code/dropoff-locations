import os
import json
from datetime import (
    datetime,
    date,
    timedelta,
)

# This is hacky and kind of terrible but it works

IN_PATH = os.path.join(
    "..", "raw_data", "all-florida-stage3.json"
)
OUT_PATH = os.path.join(
    "..", "..", "..", "api", "data", "all-florida.json"
)

def read_data():
    with open(IN_PATH) as f:
        return json.load(f)

def write_data(d):
    with open(OUT_PATH, "w") as f:
        json.dump(d, f, indent=2)


def read_time(s):
    for fmt in ("%H:%M:%S", "%I:%M%p", "%I:%M %p", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(s.replace(".", ""), fmt)
        except ValueError as e:
            err = e
            continue
    raise err

def read_date(s):
    return datetime.strptime(s, "%m/%d/%Y")

def str_time(t):
    return datetime.strftime(t, "%I:%M %p")

def str_date(d):
    return datetime.strftime(d, "%m/%d/%Y")

def simplify_schedule(sched):
    # simplify schedule (and use correct time string format)
    segments = sorted(
        sched,
        key = lambda x: read_date(x.get("startDate"))
    )
    simplified_schedule = []
    start_time, end_time, start_date, end_date = None, None, None, None
    segment_start_time, segment_end_time, segment_start_date, segment_end_date = (
        None, None, None, None)
    for s in segments:
        start_time = read_time(s["startTime"])
        end_time = read_time(s["endTime"])
        start_date = read_date(s["startDate"])
        end_date = read_date(s["endDate"])
        if (end_time - start_time < timedelta(hours=8)):
            print("Location isn't open 8 hours", d["name"])
        if (not (5 < start_time.hour <= 13)):
            print("Location opening isn't between 5am and 1pm", d["name"])
        if (not (14 < end_time.hour < 22)):
            print("Location closing isn't between 2pm and 10pm", d["name"])
        if all([
            (segment_end_date is not None and
            start_date == segment_end_date + timedelta(days=1)),
            segment_start_time == start_time,
            segment_end_time == end_time
        ]):
            segment_end_date = end_date
        else:
            if segment_end_date is not None:
                simplified_schedule.append({
                    "startDate": str_date(segment_start_date),
                    "endDate": str_date(segment_end_date),
                    "startTime": str_time(segment_start_time),
                    "endTime": str_time(segment_end_time),
                })
            # reset
            segment_start_time, segment_end_time, segment_start_date, segment_end_date = (
                start_time, end_time, start_date, end_date
            )
    simplified_schedule.append({
        "startDate": str_date(segment_start_date),
        "endDate": str_date(segment_end_date),
        "startTime": str_time(segment_start_time),
        "endTime": str_time(segment_end_time),
    })
    return simplified_schedule

data = read_data()
for d in data:
    # manual override - obvious human error on spreadsheet
    if d["name"] == "The Centre of Palm Harbor":
        d["schedule"] = [{
            "startDate": "10/19/2020",
            "endDate": "11/01/2020",
            "startTime": "07:00 AM",
            "endTime": "07:00 PM",
        }]
    else:
        d["schedule"] = simplify_schedule(d["schedule"])
problems = True
while problems:
    problems = False
    for d in data:
        if len(d["schedule"]) == 0:
            continue
        if d["schedule"][-1]["startDate"] > "11/01/2020":
            print("start too late, removing segment from ", d["name"], d["county"])
            d["schedule"] = d["schedule"][:-1]
            problems = True
            continue
        if d["schedule"][-1]["endDate"] > "11/01/2020":
            print("end too late, changing to 11/01/2020", d["name"], d["county"])
            d["schedule"][-1]["endDate"] = "11/01/2020"
            problems = True
good_sites = []
for d in data:
    if len(d["schedule"]) == 0:
        print("No valid schedule remains, skipping!", d["name"], "(", d["county"], ")")
        continue
    if d["schedule"][0]["startDate"] < "10/19/2020":
        print("Claims to start before 10/19, skipping!", d["name"], "(", d["county"], ")")
    else:
        good_sites.append(d)
    # clarify that early voting locations accept mail-in ballots
    if d["type"] == "earlyVoting":
        if d.get("notes") is None:
            d["notes"] = ""
        d["notes"] = d["notes"] + "You may drop off your mail-in ballot in-person at any " +\
            "early voting location in your county during early voting hours."


write_data(good_sites)