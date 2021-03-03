import geonames from 'geonames-us-util';

import {
    BackupMessage,
    DropoffLocation,
    DropoffLocationPlaceTypes,
    DropoffLocationsMatcher,
    FormattedAddress,
} from './types';

const countiesByZip = Object.assign(
    {},
    geonames('postal', ['county']),
    {
        33106: {county: 'Miami-Dade'},
        33967: {county: 'Lee'},
        33619: {county: 'Hillsborough'},
    },
);

// Jurisdiction validators
// If we can't get a jurisdiction, we won't be able to provide a good list of dropoffs.
// We also want to tell the user what we _think_ their jurisdiction is, so they can
// notice if we're wrong.

const countyJurisdiction = (userAddr: FormattedAddress): string =>
    userAddr.county || countiesByZip[userAddr.zipcode]?.county;

export const StateJurisdictions = {
    AZ: countyJurisdiction,
    CO: countyJurisdiction,
    FL: countyJurisdiction,
    GA: countyJurisdiction,
    MN: countyJurisdiction,
    NC: countyJurisdiction,
    PA: countyJurisdiction,
    TX: countyJurisdiction,
};

// Drop-off location matchers

const missingMatcher: DropoffLocationsMatcher = () => [];

const normalizeCounty = (raw: string): string => (
  raw.toLowerCase().replace(" county", "").replace(/\W/g, "")
);

const typedCountyMatcher = (
    placeTypes: Array<DropoffLocationPlaceTypes>,
): DropoffLocationsMatcher => (userAddr: FormattedAddress, stateData) => {
    const county = userAddr.county || countiesByZip[userAddr.zipcode]?.county;
    if (!county) {
        return [];
    }
    const locations: Array<DropoffLocation> = stateData.filter(
        (location) =>
            normalizeCounty(location.county) === normalizeCounty(county) &&
            placeTypes.includes(location.type),
    );
    return locations;
};

export const StateMatchers: Record<string, DropoffLocationsMatcher> = {
    AL: missingMatcher,
    AK: missingMatcher,
    AZ: typedCountyMatcher([
        DropoffLocationPlaceTypes.dropbox,
        DropoffLocationPlaceTypes.earlyVoting,
        DropoffLocationPlaceTypes.pollingPlace,
    ]),
    AR: missingMatcher,
    CA: missingMatcher,
    CO: typedCountyMatcher([
        DropoffLocationPlaceTypes.dropbox,
        DropoffLocationPlaceTypes.clerk,
        DropoffLocationPlaceTypes.earlyVoting,
        DropoffLocationPlaceTypes.pollingPlace,
    ]),
    CT: missingMatcher,
    DE: missingMatcher,
    DC: missingMatcher,
    FL: typedCountyMatcher([
        DropoffLocationPlaceTypes.dropbox,
        DropoffLocationPlaceTypes.clerk,
        DropoffLocationPlaceTypes.earlyVoting,
        DropoffLocationPlaceTypes.other,
    ]),
    GA: typedCountyMatcher([
        DropoffLocationPlaceTypes.dropbox,
        DropoffLocationPlaceTypes.clerk,
    ]),
    HI: missingMatcher,
    ID: missingMatcher,
    IL: missingMatcher,
    IN: missingMatcher,
    IA: missingMatcher,
    KS: missingMatcher,
    KY: missingMatcher,
    LA: missingMatcher,
    ME: missingMatcher,
    MD: missingMatcher,
    MA: missingMatcher,
    MI: missingMatcher,
    MN: typedCountyMatcher([DropoffLocationPlaceTypes.dropbox, DropoffLocationPlaceTypes.clerk]),
    MS: missingMatcher,
    MO: missingMatcher,
    MT: missingMatcher,
    NE: missingMatcher,
    NV: missingMatcher,
    NH: missingMatcher,
    NJ: missingMatcher,
    NM: missingMatcher,
    NY: missingMatcher,
    NC: typedCountyMatcher([
        DropoffLocationPlaceTypes.clerk,
    ]),
    ND: missingMatcher,
    OH: missingMatcher,
    OK: missingMatcher,
    OR: missingMatcher,
    PA: typedCountyMatcher([DropoffLocationPlaceTypes.dropbox, DropoffLocationPlaceTypes.clerk]),
    RI: missingMatcher,
    SC: missingMatcher,
    SD: missingMatcher,
    TN: missingMatcher,
    TX: typedCountyMatcher([DropoffLocationPlaceTypes.dropbox]),
    UT: missingMatcher,
    VT: missingMatcher,
    VA: missingMatcher,
    WA: missingMatcher,
    WV: missingMatcher,
    WI: missingMatcher,
    WY: missingMatcher,
};

// Back-up links
// Source: https://projects.fivethirtyeight.com/how-to-vote-2020/
// TODO(?): Provide more detailed rules.

export const StateBackupInfo: Record<string, BackupMessage> = {
    AL: {},
    AK: {
        altUrl: 'https://www.elections.alaska.gov/Core/votingbymail.php',
    },
    AZ: {
        altUrl: 'https://azsos.gov/county-election-info',
    },
    AR: {},
    CA: {
        altUrl: 'https://caearlyvoting.sos.ca.gov/',
    },
    CO: {
        altUrl: 'https://www.sos.state.co.us/pubs/elections/Resources/CountyElectionOffices.html',
    },
    CT: {
        altUrl:
            'https://portal.ct.gov/-/media/SOTS/ElectionServices/Town-Clerk/Town-Clerks-List.pdf',
    },
    DE: {
        altUrl: 'https://elections.delaware.gov/services/voter/votebymail/index.shtml',
    },
    DC: {
        altUrl: 'https://www.dcboe.org/Voters/Where-to-Vote/Mail-Ballot-Drop-Sites',
    },
    FL: {
        altUrl: 'https://dos.elections.myflorida.com/supervisors/',
    },
    GA: {
        altUrl: 'https://elections.sos.ga.gov/Elections/countyregistrars.do',
    },
    HI: {
        altUrl: 'https://elections.hawaii.gov/voter-service-centers-and-places-of-deposit/',
    },
    ID: {
        altUrl: 'https://idahovotes.gov/county-clerks/',
    },
    IL: {
        altUrl:
            'https://elections.il.gov/VotingAndRegistrationSystems/VoteByMailBallotDropBoxLocations.aspx?MID=0DjRa0Y9V6U%3d&T=637370943745763825',
    },
    IN: {},
    IA: {},
    KS: {
        altUrl: 'https://www.sos.ks.gov/elections/county_election_officers.aspx',
    },
    KY: {
        altUrl: 'https://elect.ky.gov/About-Us/Pages/County-Clerks.aspx',
    },
    LA: {},
    ME: {
        altUrl: 'https://www.maine.gov/sos/cec/elec/munic.html',
    },
    MD: {
        altUrl: 'https://www.elections.maryland.gov/elections/2020/PG20_Drop%20Box%20Locations.pdf',
    },
    MA: {
        altUrl: 'https://www.sec.state.ma.us/ele/eleev/ev-find-my-election-office.htm',
    },
    MI: {
        altUrl: 'https://mvic.sos.state.mi.us/Clerk',
    },
    MN: {
        altUrl: 'https://www.sos.state.mn.us/elections-voting/find-county-election-office/',
    },
    MS: {
        message: 'Absentee ballots in Mississippi cannot be dropped off in person.',
    },
    MO: {
        message: 'Please note that mail-in ballots in Missouri cannot be dropped off in person.',
    },
    MT: {
        altUrl: 'https://sosmt.gov/#r5',
    },
    NE: {
        altUrl: 'https://sos.nebraska.gov/elections/election-officials-contact-information',
    },
    NV: {
        altUrl: 'https://www.nvsos.gov/sos/elections/election-day-information',
    },
    NH: {},
    NJ: {
        altUrl: 'https://www.state.nj.us/state/elections/vote-secure-drop-boxes.shtml',
    },
    NM: {
        altUrl:
            'https://www.sos.state.nm.us/voting-and-elections/voter-information-portal/county-clerk-information/',
    },
    NY: {},
    NC: {},
    ND: {
        message: '',
        altUrl: 'https://vip.sos.nd.gov/precincts.aspx?eid=313',
    },
    OH: {},
    OK: {
        message:
            'Please note that absentee ballots with a pink strike cannot be dropped off in person.',
    },
    OR: {
        altUrl: 'https://sos.oregon.gov/voting/Pages/drop-box-locator.aspx',
    },
    PA: {
        altUrl: 'https://www.votespa.com/voting-in-pa/pages/drop-box.aspx',
    },
    RI: {
        altUrl: 'https://elections.ri.gov/elections/dropboxes/index.php',
    },
    SC: {},
    SD: {
        altUrl: 'https://vip.sdsos.gov/CountyAuditors.aspx',
    },
    TN: {
        message: 'Absentee ballots in Tennessee cannot be dropped off in person.',
    },
    TX: {
        altUrl: 'https://www.sos.texas.gov/elections/voter/county.shtml',
    },
    UT: {
        altUrl: 'https://voteinfo.utah.gov/county-clerk-contact-information/',
    },
    VT: {
        altUrl: 'https://sos.vermont.gov/media/vh1jv3oj/2019townclerkguide.pdf',
    },
    VA: {
        altUrl: 'https://vote.elections.virginia.gov/VoterInformation/PublicContactLookup',
    },
    WA: {
        altUrl: 'https://www.sos.wa.gov/elections/auditors/',
    },
    WV: {},
    WI: {
        altUrl: 'https://myvote.wi.gov/en-us/MyMunicipalClerk',
    },
    WY: {
        altUrl: 'https://sos.wyo.gov/Elections/Docs/WYCountyClerks.pdf',
    },
};
