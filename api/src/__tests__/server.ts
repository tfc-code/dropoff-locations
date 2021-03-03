import server from '../server';
import request from 'supertest';

describe('routes', () => {
    describe('health', () => {
        it('should be healthy', async () => {
            const res = await request(server).get('/').send();
            expect(res.statusCode).toEqual(200);
            expect(res.text).toEqual('ok');
        });
    });
    describe('all-states', () => {
        it('should support Colorado', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=1220%20Davis%20St&city=Estes%20Park&state=CO&zipcode=80517',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.jurisdiction).toEqual('Larimer');
            expect(res.body.dropOffLocations.length).toEqual(52);
        });
        it('should support Florida', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=13824%20NW%20155th%20Ave&city=Alachua&state=FL&zipcode=32615',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.jurisdiction).toEqual('Alachua');
            expect(res.body.dropOffLocations.length).toEqual(1);
        });
        it('should support Georgia', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=2749%20Loring%20Rd&city=Kennesaw&state=GA&zipcode=30152',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.jurisdiction).toEqual('Cobb');
            expect(res.body.dropOffLocations.length).toEqual(17);
        });
        it('should support Michigan', async () => {
            jest.setTimeout(30000);
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=29759%20Robert%20Dr&city=Livonia&state=MI&zipcode=48150',
                )
                .timeout(30000)
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.jurisdiction).toEqual('City Of Livonia');
            expect(res.body.dropOffLocations.length).toEqual(2);
        });
        it('should support North Carolina', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=2679%20Reynolds%20Dr&city=Winston-Salem&zipcode=27104&state=NC',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.jurisdiction.toLowerCase()).toEqual('forsyth');
            expect(res.body.dropOffLocations.length).toEqual(1);
        });
        it('should support Pennsylvania', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=1002%20E%20LUZERNE%20ST&city=Philadelphia&state=PA&zipcode=19124',
                )
                .send();
            expect(res.statusCode).toEqual(200)
            expect(res.body.jurisdiction).toEqual('Philadelphia')
            expect(res.body.dropOffLocations.length).toEqual(30)
        });
        it('should support Minnesota', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=9145%20Stevens%20Ave&city=Minneapolis&state=MN&zipcode=55420',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.jurisdiction).toEqual('Hennepin');
            expect(res.body.dropOffLocations.length).toEqual(49);
        });
        // skipping as no data is available when not near an election
        it.skip('should support Civic Info State (WA)', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=4325%20Whitman%20Avenue%20North&city=Seattle&state=WA&zipcode=98103',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.jurisdiction).toEqual('King County');
            expect(res.body.dropOffLocations.length).toBeGreaterThan(1);
            // check address duping, formatting
            expect(res.body.dropOffLocations[0].address).toMatch(/7201/);
            expect(res.body.dropOffLocations[0].address).not.toMatch(/7201.+7201/);
            expect(res.body.dropOffLocations[0].address).not.toMatch(/Seattle/);
            // check state, zip
            expect(res.body.dropOffLocations[0].state).toEqual('Washington');
            expect(res.body.dropOffLocations[0].zip).toEqual('98115');
        });
        // skipping as no data is available when not near an election
        it.skip('should limit locations to 100 (Civic Info)', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=233%20Wilshire%20Boulevard&city=Santa%20Monica&state=CA&zipcode=90401',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.dropOffLocations.length).toEqual(100);
        });
        it('should fail gracefully on states with no Civic Info Data (OR)', async () => {
            const res = await request(server)
                .get(
                    '/all-states?streetAddress=711 Southwest Alder Street&city=Portland&state=OR&zip=97205',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('error');
            expect(res.body.error).toEqual(
                'No election data for your jurisdiction is available at this time',
            );
            expect(res.body.message).toMatch(/iwillvote.com/);
        });
        /*
        // API now has data for chicago it seems
        it('should fail gracefully on states with no Civic Info Data (IL)', async () => {
            const res = await request(server)
                .get(
                    '/all-states?city=Chicago&county=Cook&latitude=41.9651141&longitude=-87.6864322&state=IL&streetAddress=4600%20North%20Lincoln%20Avenue&zipcode=60625',
                )
                .send();
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('error');
            expect(res.body.error).toEqual(
                "We weren't able to find any dropoff locations for your address",
            );
            expect(res.body.message).toMatch(/iwillvote.com/);
        });
        */
    });
});
