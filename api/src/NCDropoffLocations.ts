import Bottleneck from 'bottleneck';
import * as cheerio from 'cheerio';
import geonames from 'geonames-us-util';
import fetch from 'node-fetch';
import { addDistance, distanceSorter } from './distances';

import {
    DropoffLocation,
    DropoffLocationsType,
    DropoffLocationPlaceTypes,
    Schedule,
} from './types';

const limiter = new Bottleneck({
    maxConcurrent: 10,
});

const countiesByZip = geonames('postal', ['latitude', 'longitude', 'county']);

const COUNTY_NAME_TO_ID = new Map([
    ['alamance', 1],
    ['alexander', 2],
    ['alleghany', 3],
    ['anson', 4],
    ['ashe', 5],
    ['avery', 6],
    ['beaufort', 7],
    ['bertie', 8],
    ['bladen', 9],
    ['brunswick', 10],
    ['buncombe', 11],
    ['burke', 12],
    ['cabarrus', 13],
    ['caldwell', 14],
    ['camden', 15],
    ['carteret', 16],
    ['caswell', 17],
    ['catawba', 18],
    ['chatham', 19],
    ['cherokee', 20],
    ['chowan', 21],
    ['clay', 22],
    ['cleveland', 23],
    ['columbus', 24],
    ['craven', 25],
    ['cumberland', 26],
    ['currituck', 27],
    ['dare', 28],
    ['davidson', 29],
    ['davie', 30],
    ['duplin', 31],
    ['durham', 32],
    ['edgecombe', 33],
    ['forsyth', 34],
    ['franklin', 35],
    ['gaston', 36],
    ['gates', 37],
    ['graham', 38],
    ['granville', 39],
    ['greene', 40],
    ['guilford', 41],
    ['halifax', 42],
    ['harnett', 43],
    ['haywood', 44],
    ['henderson', 45],
    ['hertford', 46],
    ['hoke', 47],
    ['hyde', 48],
    ['iredell', 49],
    ['jackson', 50],
    ['johnston', 51],
    ['jones', 52],
    ['lee', 53],
    ['lenoir', 54],
    ['lincoln', 55],
    ['macon', 56],
    ['madison', 57],
    ['martin', 58],
    ['mcdowell', 59],
    ['mecklenburg', 60],
    ['mitchell', 61],
    ['montgomery', 62],
    ['moore', 63],
    ['nash', 64],
    ['new hanover', 65],
    ['northampton', 66],
    ['onslow', 67],
    ['orange', 68],
    ['pamlico', 69],
    ['pasquotank', 70],
    ['pender', 71],
    ['perquimans', 72],
    ['person', 73],
    ['pitt', 74],
    ['polk', 75],
    ['randolph', 76],
    ['richmond', 77],
    ['robeson', 78],
    ['rockingham', 79],
    ['rowan', 80],
    ['rutherford', 81],
    ['sampson', 82],
    ['scotland', 83],
    ['stanly', 84],
    ['stokes', 85],
    ['surry', 86],
    ['swain', 87],
    ['transylvania', 88],
    ['tyrrell', 89],
    ['union', 90],
    ['vance', 91],
    ['wake', 92],
    ['warren', 93],
    ['washington', 94],
    ['watauga', 95],
    ['wayne', 96],
    ['wilkes', 97],
    ['wilson', 98],
    ['yadkin', 99],
    ['yancey', 100],
]);

const NCDropoffLocations: DropoffLocationsType = async ({ zipcode, latitude, longitude }) => {
    const countyData = countiesByZip[zipcode];
    const countyName = countyData.county.toLowerCase();
    const countyId = COUNTY_NAME_TO_ID.get(countyName);
    if (countyId == null) {
        return {
            error: 'Invalid address; county ID not found',
            message: 'Invalid address; county ID not found',
            status: 'error',
        };
    }

    try {
        const voteLocationResponse = await limiter.schedule(() =>
            fetch(
                `https://vt.ncsbe.gov/OSSite/GetSites/?CountyID=${countyId}&ElectionDate=11%2F03%2F2020`,
                {
                    headers: {
                        accept: 'application/json, text/javascript, */*; q=0.01',
                        'accept-language': 'en-US,en;q=0.9',
                        'content-type': 'application/json; charset=utf-8',
                    },
                    body: null,
                    method: 'GET',
                },
            ),
        );
        const voteLocation = await voteLocationResponse.json();

        const jurisdiction = voteLocation['SelectedCounty']['Name'];

        const locations: Array<DropoffLocation> = [];
        voteLocation['SiteList'].forEach((site) => {
            const cityData = site['SiteAddressCSZ'];
            const zip = cityData.match(/\d{5}(-\d{4})?/)[0];
            const city = cityData.split(',')[0];
            const hoursSchedule = parseSchedule(site);

            const pollingPlaceLocation: DropoffLocation = {
                municipality: countyName,
                name: site['Name'],
                address: site['SiteAddressStreet'],
                city,
                county: countyName,
                state: 'NC',
                zip,
                stateAbbreviation: 'WI',
                source: 'https://vt.ncsbe.gov/OSSite/',
                notes: '',
                phone: '',
                schedule: hoursSchedule,
                // Do we want a new type for "one-stop voting"?
                type: DropoffLocationPlaceTypes.earlyVoting,
            };
            locations.push(pollingPlaceLocation);
        });

        const distanceSortedLocations = distanceSorter(
            addDistance({ latitude, longitude }, locations),
        );
        return {
            jurisdiction,
            dropOffLocations: distanceSortedLocations,
            status: 'success',
        };
    } catch (error) {
        return {
            error: error.message,
            message: error.message,
            status: 'error',
        };
    }
};

const parseSchedule = (site) => {
    const hoursRoot = cheerio.load(site['CompleteHoursHTML']);
    const hoursResults: Array<Schedule> = [];
    let hoursIndex = 0;
    let startDate = '';
    let endDate = '';

    hoursRoot('td').each((idx, elem) => {
        const elemText = hoursRoot(elem).text().split(' - ');
        if (hoursIndex % 2 === 0) {
            startDate = elemText[0];
            endDate = elemText[1];
        } else {
            hoursResults.push({
                startDate,
                endDate,
                startTime: elemText[0],
                endTime: elemText[1],
            });
        }
        hoursIndex++;
    });
    return hoursResults;
};

export default NCDropoffLocations;
