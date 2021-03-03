import { parseGeocoderResult } from '.';

const fakeGeocoderResult = {
  address_components: [
    { long_name: '10166', short_name: '10166', types: ['street_number'] },
    { long_name: 'Laurel Street', short_name: 'Laurel St', types: ['route'] },
    { long_name: 'Livonia', short_name: 'Livonia', types: ['locality', 'political'] },
    {
      long_name: 'Wayne County',
      short_name: 'Wayne County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'Michigan',
      short_name: 'MI',
      types: ['administrative_area_level_1', 'political'],
    },
    { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
    { long_name: '48150', short_name: '48150', types: ['postal_code'] },
    { long_name: '2661', short_name: '2661', types: ['postal_code_suffix'] },
  ],
  formatted_address: '10166 Laurel St, Livonia, MI 48150, USA',
  geometry: {
    location: {
      lat: 42.3631116,
      lng: -83.3835628,
    },
    location_type: 'ROOFTOP',
    viewport: {
      northeast: { lat: 42.3644605802915, lng: -83.38221381970851 },
      southwest: { lat: 42.3617626197085, lng: -83.38491178029152 },
    },
  },
  place_id: 'ChIJ2RfFZNSyJIgRknJqu9UDW7k',
  types: ['street_address'],
};

const fakeGeocoderComponents = {
  street_number: { long_name: '10166', short_name: '10166', types: ['street_number'] },
  route: { long_name: 'Laurel Street', short_name: 'Laurel St', types: ['route'] },
  locality: { long_name: 'Livonia', short_name: 'Livonia', types: ['locality', 'political'] },
  administrative_area_level_2: {
    long_name: 'Wayne County',
    short_name: 'Wayne County',
    types: ['administrative_area_level_2', 'political'],
  },
  administrative_area_level_1: {
    long_name: 'Michigan',
    short_name: 'MI',
    types: ['administrative_area_level_1', 'political'],
  },
  postal_code: { long_name: '48150', short_name: '48150', types: ['postal_code'] },
};

describe('parseGeocoderResult', () => {
  it('parses a geocoder result', () => {
    expect(
      parseGeocoderResult(({
        ...fakeGeocoderResult,
        address_components: [...Object.values(fakeGeocoderComponents)],
      } as unknown) as google.maps.GeocoderResult),
    ).toEqual({
      city: 'Livonia',
      state: 'MI',
      streetAddress: '10166 Laurel Street',
      zipcode: '48150',
      latitude: 42.3631116,
      longitude: -83.3835628,
      county: 'Wayne',
    });
  });

  it('excludes number if it is missing', () => {
    const {
      street_number: unused,
      ...fakeGeocoderComponentsWithoutNumber
    } = fakeGeocoderComponents;
    expect(
      parseGeocoderResult(({
        ...fakeGeocoderResult,
        address_components: [...Object.values(fakeGeocoderComponentsWithoutNumber)],
      } as unknown) as google.maps.GeocoderResult),
    ).toEqual({
      city: 'Livonia',
      state: 'MI',
      streetAddress: 'Laurel Street',
      zipcode: '48150',
      latitude: 42.3631116,
      longitude: -83.3835628,
      county: 'Wayne',
    });
  });

  it('throws an error if no zipcode is found', () => {
    expect(() => {
      parseGeocoderResult(({
        ...fakeGeocoderResult,
        address_components: [fakeGeocoderComponents.route],
      } as unknown) as google.maps.GeocoderResult);
    }).toThrowError('Please enter a full street address');
  });

  it('throws an error if no street is found', () => {
    expect(() => {
      parseGeocoderResult(({
        ...fakeGeocoderResult,
        address_components: [fakeGeocoderComponents.postal_code],
      } as unknown) as google.maps.GeocoderResult);
    }).toThrowError('Please enter a full street address');
  });
});
