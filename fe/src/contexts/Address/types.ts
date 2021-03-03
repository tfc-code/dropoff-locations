import { Context, Dispatch, FC, SetStateAction } from 'react';

import { FormattedAddress } from '@/api/src/types';

import { APIStatus } from '../types';

export type GeocodeAddressType = (placeId: string) => void;

export type AddressProviderType = FC;

export type AddressSourceType = 'query' | 'input';

export type AddressContextType = Context<{
  address: FormattedAddress;
  setAddress: Dispatch<SetStateAction<FormattedAddress>>;
  resetAddress: () => void;
  geocodeAddress: GeocodeAddressType;
  status: APIStatus;
  error?: string;
}>;
