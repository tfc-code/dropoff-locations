import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import faker from 'faker';

import { DropoffLocationPlaceTypes } from '@/api/src/types';
import { EnhancedDropoffLocation } from '@/contexts';
import { stringifyAddress } from '@/utils';

import { LocationCard } from '.';

const fakeName = faker.name.findName();

const fakeLocation: () => EnhancedDropoffLocation = () => ({
  name: fakeName,
  address: faker.address.streetAddress(),
  city: faker.address.city(),
  county: faker.address.county(),
  municipality: faker.address.city(),
  notes: null,
  phone: faker.phone.phoneNumber(),
  source: faker.internet.url(),
  state: faker.address.state(),
  stateAbbreviation: faker.address.stateAbbr(),
  type: DropoffLocationPlaceTypes.clerk,
  schedule: faker.lorem.sentence(),
  zip: faker.address.zipCode(),
});

describe('<LocationCard />', () => {
  it('renders', () => {
    const location = fakeLocation();
    const { getByText } = render(<LocationCard location={location} />);
    expect(getByText(location.name)).toBeInTheDocument();
  });

  describe('general info display', () => {
    it('lets the user expand notes', () => {
      const location = fakeLocation();
      location.notes = faker.lorem.sentence();

      const { queryByText } = render(<LocationCard location={location} />);
      const button = queryByText('See more');
      expect(queryByText(location.notes)).not.toBeInTheDocument();
      fireEvent.click(button);
      expect(queryByText(location.notes)).toBeInTheDocument();
    });

    it('displays dropoff location name if present', () => {
      const location = fakeLocation();

      const { getByText } = render(<LocationCard location={location} />);
      expect(getByText(location.name)).toBeInTheDocument();
    });

    it('displays dropoff location address if name is missing', () => {
      const location = fakeLocation();
      location.name = null;

      const { getByText } = render(<LocationCard location={location} />);
      expect(getByText(location.address)).toBeInTheDocument();
    });

    it('calculates and displays distance if present', () => {
      const location = fakeLocation();
      location.distance = 1609.43;

      const { getByText } = render(<LocationCard location={location} />);
      expect(getByText('1 mi')).toBeInTheDocument();
    });
  });

  describe('schedule', () => {
    it('displays the start and end dates', () => {
      const location = fakeLocation();
      location.schedule = [
        {
          startDate: 'foo',
          endDate: 'bar',
          startTime: '12:00 AM',
          endTime: '11:59 PM',
        },
      ];
      const { getByText } = render(<LocationCard location={location} />);
      expect(getByText('foo - bar |')).toBeInTheDocument();
    });

    it('combines the start and end date if they are identical', () => {
      const location = fakeLocation();
      location.schedule = [
        {
          startDate: 'foo',
          endDate: 'foo',
          startTime: '12:00 AM',
          endTime: '11:59 PM',
        },
      ];
      const { getByText } = render(<LocationCard location={location} />);
      expect(getByText('foo |')).toBeInTheDocument();
    });

    it('displays the start and end times', () => {
      const location = fakeLocation();
      location.schedule = [
        {
          startDate: 'foo',
          endDate: 'bar',
          startTime: 'baz',
          endTime: 'quz',
        },
      ];
      const { getByText } = render(<LocationCard location={location} />);
      expect(getByText('baz - quz')).toBeInTheDocument();
    });

    it('replaces 12:00 AM - 11:59 PM with Open 24 hours', () => {
      const location = fakeLocation();
      location.schedule = [
        {
          startDate: 'foo',
          endDate: 'bar',
          startTime: '12:00 AM',
          endTime: '11:59 PM',
        },
      ];
      const { getByText } = render(<LocationCard location={location} />);
      expect(getByText('Open 24 hours')).toBeInTheDocument();
    });

    it('lets the user expand the schedule', () => {
      const location = fakeLocation();
      location.schedule = [
        {
          startDate: '10/1',
          endDate: '10/1',
          startTime: '12:00 AM',
          endTime: '11:59 PM',
        },
        {
          startDate: '10/2',
          endDate: '10/2',
          startTime: '12:00 AM',
          endTime: '11:59 PM',
        },
        {
          startDate: '10/3',
          endDate: '10/3',
          startTime: '12:00 AM',
          endTime: '11:59 PM',
        },
      ];
      const { queryByText } = render(<LocationCard location={location} />);
      const button = queryByText('+ 1 more');
      expect(queryByText('10/1 | ')).not.toBeInTheDocument();
      fireEvent.click(button);
      expect(button).not.toBeInTheDocument();
      expect(queryByText('10/1 |')).toBeInTheDocument();
    });
  });

  describe('link generation', () => {
    it('generates a link with placeId if it exists', () => {
      const location = fakeLocation();
      location.placeId = faker.random.uuid();

      const addressString = `${location.address}+${location.city}+${location.state}+${location.zip}`.replace(
        /\s+/gi,
        '+',
      );

      const { getByText } = render(<LocationCard location={location} />);
      expect(
        getByText(
          stringifyAddress({
            streetAddress: location.address,
            city: location.city,
            state: location.state,
            zipcode: location.zip,
          }),
        ).getAttribute('href'),
      ).toBe(
        `https://www.google.com/maps/search/?api=1&query=${addressString}&query_place_id=${location.placeId}`,
      );
    });

    it('generates a fallback link with a zip if no attempt was made to retrieve placeId', () => {
      const location = fakeLocation();

      const { getByText } = render(<LocationCard location={location} />);
      expect(
        getByText(
          stringifyAddress({
            streetAddress: location.address,
            city: location.city,
            state: location.state,
            zipcode: location.zip,
          }),
        ).getAttribute('href'),
      ).toBe(
        `https://www.google.com/maps/place/${location.address}+${location.city}+${location.state}+${location.zip}`.replace(
          /\s+/gi,
          '+',
        ),
      );
    });

    it('generates a fallback link without a zip if no attempt was made to retrieve placeId and no zip is present', () => {
      const location = fakeLocation();
      location.zip = null;

      const { getByText } = render(<LocationCard location={location} />);
      expect(
        getByText(
          stringifyAddress({
            streetAddress: location.address,
            city: location.city,
            state: location.state,
            zipcode: null,
          }),
        ).getAttribute('href'),
      ).toBe(
        `https://www.google.com/maps/place/${location.address}+${location.city}+${location.state}`.replace(
          /\s+/gi,
          '+',
        ),
      );
    });

    it('does not generate a link if the attempt to retrieve placeId failed', () => {
      const location = fakeLocation();
      location.placeRequested = true;

      const { getByText } = render(<LocationCard location={location} />);
      expect(
        getByText(
          stringifyAddress({
            streetAddress: location.address,
            city: location.city,
            state: location.state,
            zipcode: location.zip,
          }),
        ).getAttribute('href'),
      ).toBe(null);
    });
  });
});
