import geonames from 'geonames-us-util';

import { DropoffLocationsType } from './types';
import { StateJurisdictions, StateMatchers } from './rules';
import { loadStateData } from './dataSources';
import { addDistance, distanceSorter } from './distances';

import MIDropoffLocations from './MIDropoffLocations';
import CivicInfoDropoffLocations from './CivicInfoDropoffLocations';

const statesByZip = Object.assign(
    {},
    geonames('postal', ['state_code', 'latitude', 'longitude']),
    {33106: {
        state_code: 'FL',
        latitude: 25.696728,
        longitude: -80.449518
    }}
);

const AllStates: DropoffLocationsType = async (userAddress) => {
    let { state } = userAddress;
    if (!state && userAddress.zipcode) {
        state = statesByZip[userAddress.zipcode]?.state_code;
    }

    // Existing matchers using an external API
    if (state === 'MI'){
        return await MIDropoffLocations({ ...userAddress, ...statesByZip[userAddress.zipcode]});
  }
    const jurisdictionGetter = StateJurisdictions[state];
    if (!jurisdictionGetter) {
        return await CivicInfoDropoffLocations({ ...userAddress, ...statesByZip[userAddress.zipcode]})
    }

    const jurisdiction = jurisdictionGetter(userAddress);
    if (!jurisdiction) {
        return {
            status: 'error',
            error: 'Not enough address info',
            message: 'Please enter a valid address and try again.',
        };
    }

    const stateData = loadStateData(state);
    const matcher = StateMatchers[state];
    if (!stateData || stateData.length === 0 || !matcher) {
        return {
            status: 'error',
            error: 'Unsupported state',
            message: "Sorry, we don't have information for your state.",
        };
    }

    try {
        const locations = matcher(userAddress, stateData);
        if (locations.length === 0) {
            return {
                status: 'error',
                error: 'No locations found',
                message: "Sorry, we couldn't find any ballot drop-offs for that location.",
            };
        }
        const distanceSortedLocations = distanceSorter(addDistance(statesByZip[userAddress.zipcode], locations));
        return {
            jurisdiction,
            dropOffLocations: distanceSortedLocations,
            status: 'success',
        };
    } catch (error) {
        return {
            status: 'error',
            error: 'Error loading data from API',
            message: 'Sorry, something went wrong.',
        };
    }
};

export default AllStates;
