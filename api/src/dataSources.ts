import fs from 'fs';
import path from 'path';
import { DropoffLocation, DropoffLocationPlaceTypes } from './types';

const StatePaths = {
    CO: '../data/all-colorado.json',
    FL: '../data/all-florida.json',
    GA: '../data/all-georgia.json',
    PA: '../data/pa-dem.json',
    MN: '../data/all-minnesota.json',
    NC: '../data/boe-north-carolina.json',
};

export const loadStateData = (state: string): Array<DropoffLocation> => {
    const statePath = StatePaths[state];
    if (!statePath) {
        return [];
    }

    const locations = JSON.parse(fs.readFileSync(path.join(__dirname, statePath), 'utf-8'));
    for (const loc of locations) {
        if (!(loc.type in DropoffLocationPlaceTypes)) {
            loc.type = DropoffLocationPlaceTypes.other;
        }
    }
    return locations;
};
