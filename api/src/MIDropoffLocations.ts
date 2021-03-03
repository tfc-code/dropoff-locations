import Bottleneck from 'bottleneck';
import * as cheerio from 'cheerio';
import geonames from 'geonames-us-util';
import fetch from 'node-fetch';
import { addDistance, distanceSorter } from './distances';

import {
    DropoffLocation,
    DropoffLocationsData,
    DropoffLocationsType,
    DropoffLocationPlaceTypes,
} from './types';

const limiter = new Bottleneck({
    maxConcurrent: 10,
});

const countiesByZip = geonames('postal', ['latitude', 'longitude', 'county']);

const ZIP_TO_LAT_LNG_OVERRIDE = new Map([[49023, [42.1081, -86.4646]]]);

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const MIDropoffLocations: DropoffLocationsType = async ({
    streetAddress,
    city,
    zipcode,
    latitude,
    longitude,
}) => {
    let body = '';
    if (streetAddress == null) {
        let { latitude, longitude } = countiesByZip[zipcode];
        if (ZIP_TO_LAT_LNG_OVERRIDE.has(Number(zipcode))) {
            latitude = ZIP_TO_LAT_LNG_OVERRIDE.get(Number(zipcode))[0];
            longitude = ZIP_TO_LAT_LNG_OVERRIDE.get(Number(zipcode))[1];
        }
        body = `Address=${zipcode}+Michigan%2C+United+States&Latitude=${latitude}&Longitude=${longitude}`;
    } else {
        body = `Address=${streetAddress}+${city}+Michigan+${zipcode}+United+States`;
    }

    body = body.replace(' ', '+');

    try {
        const voteLocationResponse = await limiter.schedule(() =>
            fetch('https://mvic.sos.state.mi.us/Voter/SearchByAddress', {
                headers: {
                    accept: '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'request-context': 'appId=cid-v1:40cc0335-c145-47ad-a61a-59030147ed3a',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'x-requested-with': 'XMLHttpRequest',
                    cookie:
                        'ai_user=RLbfI|2020-09-23T01:41:04.876Z; ai_session=w656/|1601081314862.32|1601081314862.32',
                        // This cookie is just used to satisfy the API requirement that a cookie is provided in the request
                        // it does not contain any personal developer information
                        // a new cookie can be retrieved by visiting the website and inspecting the request
                },
                body: body,
                method: 'POST',
            }),
        );
        const rawText = await voteLocationResponse.text();
        const trimmedText = rawText.replace(/(\r|\t)/gm, '');
        const parsedData = parseData(trimmedText);
        const sortedLocations = distanceSorter(
            addDistance({ latitude, longitude }, parsedData.dropOffLocations),
        );
        return {
            jurisdiction: parsedData.jurisdiction,
            dropOffLocations: sortedLocations,
            status: parsedData.status,
        };
    } catch (error) {
        return {
            error: error.message,
            message: error.message,
            status: 'error',
        };
    }
};

const DROPBOX_LOCATIONS = 'Drop box locations';
const parseData = (data): DropoffLocationsData => {
    try {
        // Parse Clerk information
        const root = cheerio.load(data);
        const correctDiv = root('#pnlClerk');
        const jurisdictionRaw = correctDiv.find('.ccd-page-heading').text().trim();
        const jurisdiction = jurisdictionRaw.substr(0, jurisdictionRaw.indexOf('\n'));
        const pollingLocationDiv = correctDiv.find('.card-body').text().trim();

        const pollingLocationLines = pollingLocationDiv
            .split('\n')
            .filter((line) => line.length > 0);

        let pollingLocationLinesIndex = 1;

        let address: string = pollingLocationLines[pollingLocationLinesIndex];
        pollingLocationLinesIndex++;

        if (!pollingLocationLines[pollingLocationLinesIndex].includes(', Michigan')) {
            address += ', ' + pollingLocationLines[pollingLocationLinesIndex];
            pollingLocationLinesIndex++;
        }

        const cityLine = pollingLocationLines[pollingLocationLinesIndex];
        const city = cityLine.substr(0, cityLine.indexOf(', Michigan'));
        const parsedZip = cityLine.match(/\d{5}(-\d{4})?/);
        let zip = '';
        if (parsedZip != null) {
            zip = parsedZip[0];
        }

        pollingLocationLinesIndex++;
        let phoneLineRegex = null;
        while (phoneLineRegex == null && pollingLocationLinesIndex < pollingLocationLines.length) {
            phoneLineRegex = pollingLocationLines[pollingLocationLinesIndex].match(
                /\(\d{3}\) \d{3}-\d{4}/,
            );
            pollingLocationLinesIndex++;
        }
        const phone = phoneLineRegex[0];

        const hoursDivs = root('.clerk-hours').html();
        const regex = /<br\s*[\/]?>/gi;
        let hours = null;
        if (hoursDivs != null) {
            hours = hoursDivs.replace(regex, '\n').trim().split('\n').join('; ');
        }
        const schedule = hours == null ? '' : 'Open ' + hours;

        // Parse drop off box information
        let locations: Array<DropoffLocation> = [];
        const ballotDiv = correctDiv.find('.additional-location-badge');
        if (ballotDiv.html() != null) {
            const tempStr = correctDiv.html();
            const regex = /<br\s*[\/]?>/gi;
            correctDiv.html(tempStr.replace(regex, '\n'));

            const allText = correctDiv.text();
            const dropboxText = allText.substr(
                allText.indexOf(DROPBOX_LOCATIONS) + DROPBOX_LOCATIONS.length,
            );
            locations = parseLocations(dropboxText);
        }
        locations.push({
            municipality: jurisdiction,
            county: '',
            name: `${city} City Clerk's Office`,
            address,
            city,
            state: 'Michigan',
            stateAbbreviation: 'MI',
            source: 'https://mvic.sos.state.mi.us',
            zip,
            phone,
            notes: '',
            schedule,
            type: DropoffLocationPlaceTypes.pollingPlace,
        });
        return {
            jurisdiction,
            dropOffLocations: locations,
            status: 'success',
        };
    } catch (err) {
        console.log(err);
        throw new Error('Failed parsing data');
    }
};

const parseLocations = (data): Array<DropoffLocation> => {
    const locations = [];
    const lines = data.split('\n');
    let foundLoc = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === 'County clerk information') {
            break;
        }
        if (line === '') {
            foundLoc = false;
        } else if (!foundLoc) {
            foundLoc = true;
            locations.push(parseLocation(lines.slice(i)));
        }
    }

    return locations;
};

const parseLocation = (lines: Array<string>) => {
    const location = {
        address: '',
        name: '',
        city: '',
        county: '',
        phone: '',
        municipality: '',
        source: 'SOS',
        state: 'Michigan',
        stateAbbreviation: 'MI',
        zip: '',
        schedule: 'Open 24/7',
        type: DropoffLocationPlaceTypes.dropbox,
    };
    let cityLine = lines[1];
    if (lines[1].includes(', Michigan')) {
        location.address = lines[0];
    } else {
        location.name = lines[0];
        location.address = lines[1];
        cityLine = lines[2];
    }
    location.city = cityLine.substr(0, cityLine.indexOf(','));
    location.zip = cityLine.substr(cityLine.length - 5);
    return location;
};

export default MIDropoffLocations;
