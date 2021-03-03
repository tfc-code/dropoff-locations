import { stringifyAddress } from '.';

describe('stringifyAddress', () => {
  it('renders streetAddress, city, state, zip, and county', () => {
    expect(
      stringifyAddress({
        state: 'foo',
        streetAddress: '123',
        city: 'chi',
        county: 'cook',
        zipcode: '1234',
      }),
    ).toBe('123, chi, foo, 1234 (cook County)');
  });

  it('renders streetAddress, city, state, and zip', () => {
    expect(
      stringifyAddress({
        state: 'foo',
        streetAddress: '123',
        city: 'chi',
        zipcode: '1234',
      }),
    ).toBe('123, chi, foo, 1234');
  });

  it('renders streetAddress, city, and state', () => {
    expect(
      stringifyAddress({
        state: 'foo',
        streetAddress: '123',
        city: 'chi',
        zipcode: null,
      }),
    ).toBe('123, chi, foo');
  });

  it('renders streetAddress and city', () => {
    expect(
      stringifyAddress({
        state: null,
        streetAddress: '123',
        city: 'chi',
        zipcode: null,
      }),
    ).toBe('123, chi');
  });

  it('renders streetAddress', () => {
    expect(
      stringifyAddress({
        state: null,
        streetAddress: '123',
        city: null,
        zipcode: null,
      }),
    ).toBe('123');
  });

  it('renders state', () => {
    expect(
      stringifyAddress({
        state: 'foo',
        streetAddress: null,
        city: null,
        zipcode: null,
      }),
    ).toBe('foo');
  });
});
