# Ballot Dropoff Locations Front-End

## Application Setup

You'll need to fill out `.env` with your own tokens from Facebook and Google Maps.

To get a Google Maps API key, read their docs: [https://developers.google.com/maps/documentation/javascript/get-api-key](https://developers.google.com/maps/documentation/javascript/get-api-key)

Your key will need access to the `Places/Maps` and `Geocoding` APIs.
## Development Setup

1. Ensure you have `yarn` on your system
2. `$ yarn install`
3. `$ yarn dev`

Note: You'll need to have the API running as well. See the [API readme](../api/README.md) for instructions.

## Testing

### Linting

`$ yarn lint`

### Unit Tests

`$ yarn test`

### E2E Tests

With the application already running in another tab:

`$ yarn cy:open` or `$ yarn cy:run`

## Mimic Production

1. Ensure you have a static site serving tool like `serve` installed globally
2. `$ yarn export`
3. `$ serve out`

## Reformat code

We use Prettier to format our code. We recommend installing a Prettier extension in your IDE of choice and enabling format-on-save. Failing that, you can run `yarn prettier-fix` to format your code to a standard style before committing.