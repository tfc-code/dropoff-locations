import { FormattedAddress } from '@/api/src/types';

export const stringifyAddress: (addressObj: FormattedAddress) => string = ({
  streetAddress,
  city,
  state,
  zipcode,
  county,
}) =>
  `${streetAddress ? `${streetAddress}${city || state || zipcode || county ? ', ' : ''}` : ''}${
    city ? `${city}${state || zipcode || county ? ', ' : ''}` : ''
  }${state ? `${state}${zipcode || county ? ', ' : ''}` : ''}${
    zipcode ? `${zipcode}${county ? ' ' : ''}` : ''
  }${county ? `(${county} County)` : ''}`;
