import React, { useState, createContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { parse as parseQuery } from 'query-string';
import TagManager from 'react-gtm-module';

import { parseGeocoderResult } from '@/utils';

import { FormattedAddress } from '@/api/src/types';

import { AddressProviderType, GeocodeAddressType, AddressContextType } from './types';

import { APIStatus } from '../types';

export const AddressContext: AddressContextType = createContext({
  address: null,
  geocodeAddress: null,
  setAddress: null,
  resetAddress: null,
  status: APIStatus.None as APIStatus,
});

export const AddressProvider: AddressProviderType = ({ children }) => {
  const [address, setAddress] = useState<FormattedAddress>(null);
  const [status, setStatus] = useState<APIStatus>(APIStatus.None);
  const [error, setError] = useState<string>(null);

  const router = useRouter();

  const resetAddress = () => {
    setAddress(null);
    router.push({ pathname: window.location.pathname, query: '' });
  };

  useEffect(() => {
    window.onpopstate = (e: PopStateEvent) => {
      const query = parseQuery(e.state.url.replace(/\/\?/gi, ''));
      if (Object.keys(query).length && query.zipcode) {
        const { streetAddress, state, city, zipcode, county } = query;
        setAddress({
          streetAddress: streetAddress?.toString(),
          state: state?.toString(),
          city: city?.toString(),
          zipcode: zipcode?.toString(),
          county: county?.toString(),
        });
      } else {
        setAddress(null);
      }
    };
  }, []);

  const geocodeAddress: GeocodeAddressType = async (placeId) => {
    try {
      setStatus(APIStatus.Loading);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GOOGLE_GEOCODER_API}?key=${process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_KEY}&place_id=${placeId}`,
      );
      const { results }: { results: Array<google.maps.GeocoderResult> } = await response.json();
      const transformedAddress = parseGeocoderResult(results[0]);

      setAddress(transformedAddress);
      setStatus(APIStatus.Success);
      router.push({ pathname: window.location.pathname, query: transformedAddress });
    } catch (err) {
      TagManager.dataLayer({
        dataLayer: { event: 'locations_not_found', placeId },
      });
      setAddress(null);
      setStatus(APIStatus.Error);
      setError(err.message);
    }
  };

  return (
    <AddressContext.Provider
      value={{
        geocodeAddress,
        setAddress,
        resetAddress,
        address,
        error,
        status,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};
