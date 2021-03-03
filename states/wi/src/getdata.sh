#!/bin/bash

# Milwuakee County PDF
# wget -O ../raw_data/milwuakee-county.pdf https://county.milwaukee.gov/files/county/county-clerk/Election-Commission/Documents/GeneralElectionEarlyVotingSchedule.11.3.pdf
# Barron county HTML
# wget -O ../raw_data/barron-county/barron-county-offices.html https://www.co.barron.wi.us/municipal.cfm
# All County Clerks
wget -O ../raw_data/county-clerks.pdf https://elections.wi.gov/sites/elections.wi.gov/files/2020-08/WI%20County%20Clerks%20Updated%208-7-20.pdf
# All Municipal Clerks
wget -O ../raw_data/municipal-clerks.pdf https://elections.wi.gov/sites/elections.wi.gov/files/2020-08/WI%20Municipal%20Clerks%20Updated%208-7-20.pdf
# Milwuakee City Drop Boxes
wget -O ../raw_data/milwuakee-city-dropoff-sites.html https://city.milwaukee.gov/election/Voter-Info/Absentee-Ballot-Drop-Off-Sites
# Sheboygan dropoff locations (for manual input)
wget -O ../raw_data/sheboygan-county-dropoff-sites.pdf https://doc-10-84-docs.googleusercontent.com/docs/securesc/5ljikpk8dnko3p0s02453lr0bp7laq7v/sf7qtl8rn0jv91ot33mduc0i4a085qir/1600133025000/13353197843259116847/07019630394872503834/1IMJDLJZ8lGqy5lOzoP-4wXU1sr3R93M4?e=download&authuser=0&nonce=fo9j86ihe4sbs&user=07019630394872503834&hash=dq2b4im2us22fiugt775kq54kpan15gs
# Madison City Dropoff Location
wget -O ../raw_data/madison-city-dropoff-sites.html https://www.cityofmadison.com/clerk/elections-voting/voting/vote-absentee/ballot-drop-off-sites
# Madison Early Voting Locations
wget -O ../raw_data/madison-early-voting-locations.html https://www.cityofmadison.com/clerk/elections-voting/voting/vote-absentee/in-person-absentee-voting-hours-and-locations
# Wisconsin Dems Early Voting and Dropoff Locations
wget -O ../raw_data/wisconsin-dems.txt https://vote.wisdems.org/_update-county-single-pages