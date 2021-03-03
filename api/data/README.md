# Dropoff Location Data

Dropoff location data used by the API is stored here in the `/api/data` directory.

## Where does this data come from?

Data here is scraped from various sources and stored on a per-state basis. State scrapers can be found in the `/states/` directory and output data from their scrapes into this directory.

## Why isn't there data from every state?

Some states provided APIs that took voter addresses as inputs in order to resolve the voters jurisdiction and provide their drop-off locations. In these cases we either wrapped the state API or forwarded users to the state websites.

In addition, we did not support all states and data is not available for unsupported states.