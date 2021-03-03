import express, { Request } from 'express';
import cors from 'cors';
import { ParsedQs } from 'qs';

import AllStates from './AllStates';

import { FormattedAddress } from './types';

type AddressQuery = FormattedAddress & ParsedQs;
interface AddressRequest extends Request {
    query: AddressQuery;
}

const server = express();

server.use(cors());

server.get('/', async (req, res) => {
    res.send('ok');
});

// CO url: http://localhost:8080/all-states?streetAddress=1220%20Davis%20St&city=Estes%20Park&state=CO&zipcode=80517
// MN url: http://localhost:8080/all-states?streetAddress=9145%20Stevens%20Ave&city=Minneapolis&state=MN&zipcode=55420'
// FL url: http://localhost:8080/all-states?streetAddress=13824%20NW%20155th%20Ave&city=Alachua&state=FL&zipcode=32615
// MI url: http://localhost:8080/all-states?streetAddress=29759%20Robert%20Dr&city=Livonia&state=MI&zipcode=48150
// NC url: http://localhost:8080/all-states?streetAddress=2679%20Reynolds%20Dr&city=Winston-Salem&zipcode=27104&state=NC
// PA url: http://localhost:8080/all-states?streetAddress=1002%20E%20LUZERNE%20ST&city=Philadelphia&state=PA&zipcode=19124
// WA url: http://localhost:8080/all-states?streetAddress=4325%20Whitman%20Avenue%20North&city=Seattle&state=WA&zipcode=98103
server.get('/all-states', async (req: AddressRequest, res) => {
    const data = await AllStates(req.query);
    // res.type('json')
    res.send(data);
});

export default server;
