const geonames = require('geonames-us-util')
const Bottleneck = require('bottleneck');
const csv = require('csv-parser')
const fs = require('fs')
const fetch = require('node-fetch');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const results = [];
const statesByZip = geonames('postal', ['state_code']);

const limiter = new Bottleneck({
    maxConcurrent: 100,
});


const statuses = {};
const recordResult = (address, city, state, zipcode, status) => {
    if (!statuses[state]) {
        statuses[state] = {}
    }

    if (!statuses[state][status]) {
        statuses[state][status] = [];
    }

    statuses[state][status].push(`https://ballotdropoff-api.techforcampaigns.org/all-states?streetAddress=${address}&city=${city}&state=${state}&zipcode=${zipcode}`);
}

const makeApiRequest = async (street, city, state, zipcode) => {
    try {
        const voteLocationResponse = await limiter.schedule(() =>
            fetch(
                `https://ballotdropoff-api.techforcampaigns.org/all-states?streetAddress=${street}&city=${city}&state=${state}&zipcode=${zipcode}`,
                {
                    method: 'GET',
                    headers: {

                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                    redirect: 'follow',
                },
            )
        );
        const data = await voteLocationResponse.json();
        if (data && data.dropOffLocations && data.dropOffLocations.length) {
            return true;
        }
        console.log(state, data)
        return false;
    } catch (error) {
        console.log(state, error)
        return false;
    }
}

const csvWriter = createCsvWriter({
    path: 'failures.csv',
    header: [
        {id: 'zipcode', title: 'Zipcode'},
        {id: 'state', title: 'State'}
    ]
});

const promises = [];
fs.createReadStream('addresses.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        results.forEach(obj => {
            console.log(obj.zipcode, obj.state);
            promises.push(makeApiRequest(obj.address, obj.city, obj.state, obj.zipcode).then((result) => {
                const status = result ? 'success' : 'fail';
                console.log(obj.state, obj.zipcode, status);
                recordResult(obj.address, obj.city, obj.state, obj.zipcode, status);
            }));
        })
        const failures = [];
        Promise.all(promises).then(() => {
            Object.keys(statuses).map(function(objectKey, index) {
                const successfulCount = statuses[objectKey]['success']? statuses[objectKey]['success'].length : 0;
                const failureCount = statuses[objectKey]['fail']? statuses[objectKey]['fail'].length : 0;
                console.log(`${objectKey} successes: ${successfulCount}`);
                console.log(`${objectKey} failures: ${failureCount}`);
                statuses[objectKey]['fail'].forEach((url) => {
                    failures.push({
                        url: encodeURI(url),
                        state: objectKey,
                    });
                });
            });

            csvWriter
                .writeRecords(failures)
                .then(()=> console.log('The CSV file was written successfully'));
        })
});