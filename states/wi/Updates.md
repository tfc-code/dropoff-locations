# Updates

## URLs to monitor

Data used by this scraper includes the following URLS

* https://elections.wi.gov/sites/elections.wi.gov/files/2020-08/WI%20Municipal%20Clerks%20Updated%208-7-20.pdf
* https://elections.wi.gov/sites/elections.wi.gov/files/2020-08/WI%20County%20Clerks%20Updated%208-7-20.pdf
* https://city.milwaukee.gov/election/Voter-Info/Absentee-Ballot-Drop-Off-Sites

## When changes occur

If data in these urls change, run the following command to download new copies:

```
$ src/getdata.sh
```

Next, go to https://www.zamzar.com/ and upload the changed file, choosing csv as output option

Then, download the csv file to the `raw_data` directory with the same name but a `.csv` extension.

Run the scraper.

There will likely be a few addresses in the generated CSV that need an additional `,` added in the csv file. You will see errors in script if this is the case. Add some logging so you can identify which office was the issue then add the `,` to the address (usually between address and city). Make sure if you are adding a `,` that the cell you are editing is quoted (surrounded by `"`) otherwise the parser will read the comma as a delimeter.