import Bottleneck from 'bottleneck';
import geonames from 'geonames-us-util';
import fetch from 'node-fetch';
import { addDistance, distanceSorter } from './distances';

import { DropoffLocation, DropoffLocationsType, DropoffLocationPlaceTypes } from './types';

const electionID = '7000'; // CivicInfo API identifier for 2020 US General Election
const voterInfoURL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';
const maxLocations = 100;

const googleAPIKey = process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_KE || 'YOUR_KEY_HERE';

const statesByAbbr = geonames('state_code', 'state');

const limiter = new Bottleneck({
    maxConcurrent: 10,
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const CivicInfoDropoffLocations: DropoffLocationsType = async ({
    streetAddress,
    city,
    state,
    zipcode,
    latitude,
    longitude,
}) => {
    const addrString = `${streetAddress}, ${city}, ${state} ${zipcode}`;

    const requestURL = `${voterInfoURL}?electionID=${electionID}&address=${addrString}&key=${googleAPIKey}`;

    try {
        const voteLocationResponse = await limiter.schedule(() =>
            fetch(requestURL, { method: 'GET' }),
        );
        const response = await voteLocationResponse.json();
        if (voteLocationResponse.status != 200) {
            const msg =
                voteLocationResponse.status === 400
                    ? 'No election data for your jurisdiction is available at this time'
                    : "Sorry, something went wrong - we're looking into it";
            throw new Error(msg);
        }
        if (!response.dropOffLocations || response.dropOffLocations.length === 0) {
            throw new Error("We weren't able to find any dropoff locations for your address");
        }
        const jurisdiction = response.state[0].local_jurisdiction.name;
        const locations: Array<DropoffLocation> = response.dropOffLocations.map((loc) => ({
            name: loc.address.locationName,
            address: `${loc.address.line1} ${loc.address.line2 || ''} ${
                loc.address.line3 || ''
            }`.trim(),
            city: loc.address.city,
            county: '',
            municipality: jurisdiction,
            notes: loc.notes,
            phone: '',
            source: loc.sources[0].name,
            state: statesByAbbr[loc.address.state],
            stateAbbreviation: loc.address.state,
            type: DropoffLocationPlaceTypes.other,
            schedule: loc.pollingHours,
            zip: loc.address.zip,
            latitude: loc.latitude,
            longitude: loc.longitude,
        }));
        const sortedLocations = distanceSorter(addDistance({ latitude, longitude }, locations));
        return {
            jurisdiction: jurisdiction,
            dropOffLocations: sortedLocations.slice(0, maxLocations),
            status: 'success',
        };
    } catch (error) {
        return {
            error: error.message,
            message: `Error: ${error.message}. Please go to https://www.iwillvote.com or contact your local election officials for more information on how to vote.`,
            status: 'error',
        };
    }
};

export default CivicInfoDropoffLocations;
