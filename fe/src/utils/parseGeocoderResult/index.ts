import { FormattedAddress } from '@/api/src/types';

export const parseGeocoderResult = (address: google.maps.GeocoderResult): FormattedAddress => {
  const number = address.address_components.find((component) =>
    component.types.includes('street_number'),
  )?.long_name;
  const street = address.address_components.find((component) => component.types.includes('route'))
    ?.long_name;
  const city = address.address_components.find((component) => component.types.includes('locality'))
    ?.long_name;
  const state = address.address_components.find((component) =>
    component.types.includes('administrative_area_level_1'),
  )?.short_name;
  const zipcode = address.address_components.find((component) =>
    component.types.includes('postal_code'),
  )?.long_name;
  const latitude = (address.geometry.location.lat as unknown) as number;
  const longitude = (address.geometry.location.lng as unknown) as number;

  const county = address.address_components
    .find((component) => component.types.includes('administrative_area_level_2'))
    ?.short_name.replace(/ [Cc]ounty/, '');

  if (!street || !zipcode) {
    throw new Error('Please enter a full street address.');
  }

  return {
    streetAddress: `${number ? `${number} ` : ''}${street}`,
    city,
    state,
    zipcode,
    latitude,
    longitude,
    county,
  };
};
