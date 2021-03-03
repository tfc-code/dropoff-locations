export type FormattedAddress = {
    streetAddress: string;
    city: string;
    state: string;
    zipcode: string;
    county?: string;
    latitude?: number;
    longitude?: number;
};

export type Schedule = {
    endDate: string;
    endTime: string;
    startDate: string;
    startTime: string;
};

export interface DropoffLocation {
    name?: string;
    address: string;
    city: string;
    county: string;
    municipality: string;
    notes: string;
    phone: string;
    source: string;
    state: string;
    stateAbbreviation: string;
    type: DropoffLocationPlaceTypes;
    schedule: string | Array<Schedule>;
    placeId?: string;
    zip: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
}

export enum DropoffLocationPlaceTypes {
    dropbox = 'dropbox',
    pollingPlace = 'pollingPlace',
    clerk = 'clerk',
    earlyVoting = 'earlyVoting',
    other = 'other',
}

interface DropoffLocationsResponseBase {
    status: 'success' | 'error';
}

export interface DropoffLocationsData extends DropoffLocationsResponseBase {
    jurisdiction: string;
    dropOffLocations: Array<DropoffLocation>;
}

export interface DropoffLocationsError extends DropoffLocationsResponseBase {
    error: string;
    message: string;
    altUrl?: string;
}

export type DropoffLocationsResponse = DropoffLocationsError | DropoffLocationsData;

export type DropoffLocationsType = (args: FormattedAddress) => Promise<DropoffLocationsResponse>;

export enum States {
    AL = 'AL',
    AK = 'AK',
    AS = 'AS',
    AZ = 'AZ',
    AR = 'AR',
    CA = 'CA',
    CO = 'CO',
    CT = 'CT',
    DE = 'DE',
    DC = 'DC',
    FM = 'FM',
    FL = 'FL',
    GA = 'GA',
    GU = 'GU',
    HI = 'HI',
    ID = 'ID',
    IL = 'IL',
    IN = 'IN',
    IA = 'IA',
    KS = 'KS',
    KY = 'KY',
    LA = 'LA',
    ME = 'ME',
    MH = 'MH',
    MD = 'MD',
    MA = 'MA',
    MI = 'MI',
    MN = 'MN',
    MS = 'MS',
    MO = 'MO',
    MT = 'MT',
    NE = 'NE',
    NV = 'NV',
    NH = 'NH',
    NJ = 'NJ',
    NM = 'NM',
    NY = 'NY',
    NC = 'NC',
    ND = 'ND',
    MP = 'MP',
    OH = 'OH',
    OK = 'OK',
    OR = 'OR',
    PW = 'PW',
    PA = 'PA',
    PR = 'PR',
    RI = 'RI',
    SC = 'SC',
    SD = 'SD',
    TN = 'TN',
    TX = 'TX',
    UT = 'UT',
    VT = 'VT',
    VI = 'VI',
    VA = 'VA',
    WA = 'WA',
    WV = 'WV',
    WI = 'WI',
    WY = 'WY',
}

export type DropoffLocationsMatcher = (
    userAddr: FormattedAddress,
    stateData: Array<DropoffLocation>,
) => Array<DropoffLocation>;

export interface BackupMessage {
    message?: string;
    altUrl?: string;
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
}
