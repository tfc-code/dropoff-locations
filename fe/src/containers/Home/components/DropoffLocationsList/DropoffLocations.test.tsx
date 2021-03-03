import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import faker from 'faker';

import { DropoffLocation, DropoffLocationPlaceTypes } from '@/api/src/types';

import { DropoffLocationsList } from '.';

const fakeName = faker.name.findName();

const fakeLocation: () => DropoffLocation = () => ({
  name: fakeName,
  address: faker.address.streetAddress(),
  city: faker.address.city(),
  county: faker.address.county(),
  municipality: faker.address.city(),
  notes: faker.lorem.sentence(),
  phone: faker.phone.phoneNumber(),
  source: faker.internet.url(),
  state: faker.address.state(),
  stateAbbreviation: faker.address.stateAbbr(),
  type: DropoffLocationPlaceTypes.clerk,
  schedule: faker.lorem.sentence(),
  zip: faker.address.zipCode(),
});

describe('<DropoffLocationsList />', () => {
  it('renders', () => {
    const { getByText } = render(<DropoffLocationsList dropoffLocations={[fakeLocation()]} />);
    expect(getByText(fakeName)).toBeInTheDocument();
  });

  it('says "result" if array length is 1', () => {
    const { getAllByText } = render(<DropoffLocationsList dropoffLocations={[fakeLocation()]} />);
    expect(getAllByText('1 result found')).toBeTruthy();
  });

  it('says "results" if array length is > 1', () => {
    const { getAllByText } = render(
      <DropoffLocationsList dropoffLocations={[fakeLocation(), fakeLocation()]} />,
    );
    expect(getAllByText('2 results found')).toBeTruthy();
  });

  it('should not paginate if array length < # elements per page', () => {
    // presuming hardcoded number of elements per page of 20
    const dataLength = 18;
    const fakeData = Array.from(Array(dataLength), () => fakeLocation());

    const { queryByText } = render(<DropoffLocationsList dropoffLocations={fakeData} />);

    expect(queryByText(/Prev/i)).not.toBeInTheDocument();
  });

  it('should paginate if array length > # elements per page', () => {
    // presuming hardcoded number of elements per page of 20
    const dataLength = 41;
    const fakeData = Array.from(Array(dataLength), () => fakeLocation());

    const { getAllByText, queryByText } = render(
      <DropoffLocationsList dropoffLocations={fakeData} />,
    );

    const checkCorrectDataExists = (start: number, end: number) => {
      fakeData.slice(start, end).forEach((datum) => {
        expect(getAllByText(datum.schedule as string)).toBeTruthy();
      });
    };

    // Initial page. "Prev" button should be disabled.
    expect(getAllByText(`Showing 1 - 20 of ${dataLength} results`)).toBeTruthy();
    expect(getAllByText(/Prev/i)[0].closest('button')).toBeDisabled();
    checkCorrectDataExists(0, 20);
    expect(queryByText(fakeData[20].schedule as string)).not.toBeInTheDocument();

    // Middle page.
    fireEvent.click(getAllByText(/Next/i)[0]);
    expect(getAllByText(`Showing 21 - 40 of ${dataLength} results`)).toBeTruthy();
    checkCorrectDataExists(20, 40);
    expect(queryByText(fakeData[0].schedule as string)).not.toBeInTheDocument();

    // Last page. "Next" button should be disabled.
    fireEvent.click(getAllByText(/Next/i)[0]);
    expect(getAllByText(`Showing 41 - 41 of ${dataLength} results`)).toBeTruthy();
    expect(getAllByText(/Next/i)[0].closest('button')).toBeDisabled();
    checkCorrectDataExists(40, 60);
    expect(queryByText(fakeData[20].schedule as string)).not.toBeInTheDocument();

    // Click back to make sure the "Prev" button works.
    fireEvent.click(getAllByText(/Prev/i)[0]);
    expect(getAllByText(`Showing 21 - 40 of ${dataLength} results`)).toBeTruthy();
    checkCorrectDataExists(20, 40);
    expect(queryByText(fakeData[0].schedule as string)).not.toBeInTheDocument();
  });
});
