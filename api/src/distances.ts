import getDistance from 'geolib/es/getDistance';

import { DropoffLocation, GeoLocation } from './types';

export const addDistance: (
    userLocation: GeoLocation,
    locations: Array<DropoffLocation>,
) => Array<DropoffLocation> = (userLocation, locations) =>
    locations.map((location: DropoffLocation) => {
        if (!location.longitude || !location.latitude) {
            return location;
        }
        return {
            ...location,
            distance: getDistance(userLocation, {
                longitude: location.longitude,
                latitude: location.latitude,
            }),
        }
    });

export const distanceSorter: (locations: Array<DropoffLocation>) => Array<DropoffLocation> = (
    locations,
) =>
    locations.sort(
        (locationA: DropoffLocation, locationB: DropoffLocation) =>
            locationA.distance - locationB.distance,
    );
