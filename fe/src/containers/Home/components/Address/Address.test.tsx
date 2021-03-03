import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import faker from 'faker';

import { AddressContext } from '@/contexts';
import { FormattedAddress } from '@/api/src/types';
import { stringifyAddress } from '@/utils';

import { fakeSuggestion } from '../../../../../__mocks__/use-places-autocomplete'; // eslint-disable-line jest/no-mocks-import
import { Address } from '.';

jest.useFakeTimers();

const fakeAddress = (): FormattedAddress => ({
  streetAddress: faker.address.streetAddress(),
  zipcode: faker.address.zipCode(),
  city: faker.address.city(),
  state: faker.address.state(),
});

describe('<Address />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    const { getByText } = render(
      <AddressContext.Provider
        value={{
          setAddress: null,
          resetAddress: null,
          geocodeAddress: null,
          status: null,
          address: null,
        }}
      >
        <Address />
      </AddressContext.Provider>,
    );
    expect(getByText('Address')).toBeInTheDocument();
    expect(getByText('For ex: 100 N Capitol Ave, Lansing, MI, 48933')).toBeInTheDocument();
  });

  it('sets address if one if provided from the context', () => {
    const { setValue } = usePlacesAutocomplete();
    const address = fakeAddress();
    render(
      <AddressContext.Provider
        value={{
          setAddress: null,
          resetAddress: null,
          geocodeAddress: null,
          status: null,
          address,
        }}
      >
        <Address />
      </AddressContext.Provider>,
    );
    expect(setValue).toHaveBeenCalledWith(stringifyAddress(address), false);
  });

  it('clears address if it is null in the context', () => {
    const { setValue } = usePlacesAutocomplete();
    render(
      <AddressContext.Provider
        value={{
          setAddress: null,
          resetAddress: null,
          geocodeAddress: null,
          status: null,
          address: null,
        }}
      >
        <Address />
      </AddressContext.Provider>,
    );
    expect(setValue).toHaveBeenCalledWith('', false);
  });

  it('lets the user update the address', () => {
    const { setValue } = usePlacesAutocomplete();
    const { getByLabelText } = render(
      <AddressContext.Provider
        value={{
          setAddress: null,
          resetAddress: null,
          geocodeAddress: null,
          status: null,
          address: null,
        }}
      >
        <Address />
      </AddressContext.Provider>,
    );
    const input = getByLabelText(/address/i);
    fireEvent.change(input, { target: { value: 'foo' } });
    expect(setValue).toHaveBeenCalledWith('foo');
  });

  it('renders suggestions when they are present and the input is focused', () => {
    const { getByLabelText, getByText } = render(
      <AddressContext.Provider
        value={{
          setAddress: null,
          resetAddress: null,
          geocodeAddress: null,
          status: null,
          address: null,
        }}
      >
        <Address />
      </AddressContext.Provider>,
    );
    const input = getByLabelText(/address/i);
    fireEvent.focus(input);
    const suggestion = getByText(fakeSuggestion.structured_formatting.main_text);
    expect(suggestion).toBeInTheDocument();
  });

  it('hides suggestions when the input is blurred', () => {
    const { getByLabelText, queryByText } = render(
      <AddressContext.Provider
        value={{
          setAddress: null,
          resetAddress: null,
          geocodeAddress: null,
          status: null,
          address: null,
        }}
      >
        <Address />
      </AddressContext.Provider>,
    );
    const input = getByLabelText(/address/i);
    fireEvent.focus(input);
    act(() => {
      fireEvent.blur(input);
      jest.runAllTimers();
    });
    const suggestion = queryByText(fakeSuggestion.structured_formatting.main_text);
    expect(suggestion).not.toBeInTheDocument();
  });

  it('lets the user select a suggestion', () => {
    const { setValue, clearSuggestions } = usePlacesAutocomplete();
    const mockGeocodeAddress = jest.fn();
    const { getByLabelText, getByText } = render(
      <AddressContext.Provider
        value={{
          setAddress: null,
          resetAddress: null,
          geocodeAddress: mockGeocodeAddress,
          status: null,
          address: null,
        }}
      >
        <Address />
      </AddressContext.Provider>,
    );
    const input = getByLabelText(/address/i);
    fireEvent.focus(input);
    const suggestion = getByText(fakeSuggestion.structured_formatting.main_text);
    fireEvent.click(suggestion);
    expect(setValue).toHaveBeenCalledWith(fakeSuggestion.description, false);
    expect(mockGeocodeAddress).toHaveBeenCalledWith(fakeSuggestion.place_id);
    expect(clearSuggestions).toHaveBeenCalled();
  });
});
