import React, { useState, createContext, useContext } from 'react';
import { DateTime } from 'luxon';
import fetch from 'node-fetch';
import qs from 'query-string';
import TagManager from 'react-gtm-module';

import {
  DropoffLocation,
  DropoffLocationsResponse,
  DropoffLocationsData,
  DropoffLocationsError,
} from '@/api/src/types';
import { stringifyAddress } from '@/utils';
import { AddressContext } from '@/contexts';

import {
  DropoffLocationsContextType,
  DropoffLocationsProviderType,
  EnhancedDropoffLocation,
  GetDropoffLocationsType,
} from './types';

import { APIStatus } from '../types';

// Checking on the frontend to use the user's date and time.
const checkSchedule = (loc: DropoffLocation) : boolean => {
  const { schedule } = loc;
  const now = DateTime.local();
  if (Array.isArray(schedule)) {
    const maxDateTime = schedule.map(
      (s) => DateTime.fromFormat(`${s.endDate} ${s.endTime}`, 'L/d/yyyy h:mm a')
    ).reduce( (a, b) => (a > b ? a : b) );
    return now <= maxDateTime;
  }
  return true;  // it's an arbitrary string
};

const enhanceLocation = async (location: DropoffLocation) => {
  const { address, city, state, zip, placeId } = location;
  if (placeId) return location;
  const inputAddress = [address, city, state, zip].filter(Boolean).join(' ').replace(/#/gi, ''); // google maps doesn't seem to like "P.O. Box #172", but is totally fine with "P.O. Box 172"

  // https://stackoverflow.com/questions/14343965/google-places-library-without-map
  const placesService = new google.maps.places.PlacesService(document.createElement('div'));

  return new Promise<EnhancedDropoffLocation>((resolve) => {
    placesService.findPlaceFromQuery(
      {
        query: inputAddress,
        fields: ['place_id'],
      },
      (results, status) => {
        if (status === 'OK') {
          if (results.length > 1) {
            // Change this to some sort of reporting when possible
            console.warn(
              `Multiple possible Google Places for ${inputAddress}: ${results
                .map((res) => res.place_id)
                .join(', ')}, using first.`,
            );
          }

          resolve({
            ...location,
            placeId: results[0].place_id,
            placeRequested: true,
          });
        } else {
          // Change this to some sort of reporting when possible
          console.warn(`${status}: Tried to enhance ${inputAddress}, error occured.`);
          resolve({
            ...location,
            placeId: undefined,
            placeRequested: true,
          });
        }
      },
    );
  });
};

export const DropoffLocationsContext: DropoffLocationsContextType = createContext({
  dropoffLocations: [],
  status: APIStatus.None as APIStatus,
  getDropoffLocations: null,
  reset: null,
});

export const DropoffLocationsProvider: DropoffLocationsProviderType = ({ children }) => {
  const [status, setStatus] = useState<APIStatus>(APIStatus.None);
  const [dropoffLocations, setDropoffLocations] = useState<Array<EnhancedDropoffLocation>>([]);
  const [error, setError] = useState<string>(null);

  const { address } = useContext(AddressContext);

  const reset = () => {
    setDropoffLocations([]);
    setStatus(APIStatus.None);
  };

  const getDropoffLocations: GetDropoffLocationsType = async () => {
    const { streetAddress, state, city, zipcode, county, latitude, longitude } = address;

    const querystring = qs.stringify({
      streetAddress,
      city,
      zipcode,
      state,
      county,
      latitude,
      longitude,
    });

    try {
      setStatus(APIStatus.Loading);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DROPOFF_LOCATION_API}all-states?${querystring}`,
      );
      const json = await response.json();

      const responseIsSuccess = (res: DropoffLocationsResponse): res is DropoffLocationsData =>
        res?.status === 'success';
      const responseIsFailure = (res: DropoffLocationsResponse): res is DropoffLocationsError =>
        res?.status !== 'success';

      if (responseIsSuccess(json)) {
        const unclosedLocations = json.dropOffLocations.filter(checkSchedule);
        if (json.dropOffLocations.length > 0 && unclosedLocations.length === 0) {
          throw new Error('Sorry, all the dropoff locations that we found have closed. Please go to https://www.iwillvote.com or contact your local election officials for more information on how to vote.');
        }
        let enhancedData: Array<EnhancedDropoffLocation>;

        // 4 is an arbitrary small number.
        // Don't want to hit the API for all 218 Madison, WI dropoffs.
        if (unclosedLocations.length < 4) {
          enhancedData = await Promise.all(
            unclosedLocations.map((location) => enhanceLocation(location)),
          );
        } else {
          enhancedData = unclosedLocations.map((location) => ({
            ...location,
            placeRequested: false,
          }));
        }
        TagManager.dataLayer({
          dataLayer: { event: 'locations_found', address: stringifyAddress(address) },
        });

        setDropoffLocations(enhancedData);
        setStatus(APIStatus.Success);
      }

      if (responseIsFailure(json)) {
        throw new Error(json.message ?? 'Failed to fetch data.');
      }
    } catch (err) {
      TagManager.dataLayer({
        dataLayer: { event: 'locations_not_found', address: stringifyAddress(address) },
      });
      setStatus(APIStatus.Error);
      setError(err.message ?? 'Failed to fetch data.');
    }
  };

  return (
    <DropoffLocationsContext.Provider
      value={{ dropoffLocations, getDropoffLocations, status, error, reset }}
    >
      {children}
    </DropoffLocationsContext.Provider>
  );
};
