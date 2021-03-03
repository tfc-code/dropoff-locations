import { FC, Context } from 'react';

import { DropoffLocation } from '@/api/src/types';

import { APIStatus } from '../types';

export type DropoffLocationsProviderType = FC;

export type ResetDropoffLocationsType = () => void;

export type DropoffLocationsContextType = Context<{
  dropoffLocations: Array<DropoffLocation>;
  status: APIStatus;
  error?: string;
  getDropoffLocations: GetDropoffLocationsType;
  reset: ResetDropoffLocationsType;
}>;

export type GetDropoffLocationsType = () => void;

export interface EnhancedDropoffLocation extends DropoffLocation {
  placeRequested?: boolean;
}
