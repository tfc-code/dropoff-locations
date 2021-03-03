import React, { FC, useContext, useEffect } from 'react';
import { Typography, Container, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import TagManager from 'react-gtm-module';

import { APIStatus, DropoffLocationsContext, AddressContext } from '@/contexts';
import { strings } from '@/i18n';
import { stringifyAddress } from '@/utils';

import { Address } from './components/Address';
import { Disclaimer } from './components/Disclaimer';
import { LanguageLink } from './components/LanguageLink';

const LoadingOverlay = dynamic(
  () => import('./components/LoadingOverlay').then((module) => module.LoadingOverlay),
  {
    ssr: false,
  },
);

const DropoffLocationsList = dynamic(
  () => import('./components/DropoffLocationsList').then((module) => module.DropoffLocationsList),
  {
    ssr: false,
    loading: () => <LoadingOverlay />,
  },
);

const Error = dynamic(() => import('./components/Error').then((module) => module.Error), {
  ssr: false,
});

const useStyles = makeStyles((theme) => ({
  header: {
    background: theme.palette.secondary.main,
    cursor: 'pointer',
  },
  wrapper: {
    height: '100vh',
  },
  container: {
    height: '100%',
  },
  languageSelector: {
    color: 'white',
  },
}));

export const Home: FC = () => {
  const {
    dropoffLocations,
    getDropoffLocations,
    status: dropoffLocationsStatus,
    error: dropoffLocationsError,
    reset: resetDropoffLocations,
  } = useContext(DropoffLocationsContext);
  const {
    address,
    setAddress,
    resetAddress,
    status: geocoderStatus,
    error: geocoderError,
  } = useContext(AddressContext);

  const classes = useStyles();
  const { query } = useRouter();

  // If there's a query in the string upon intialization,
  // parse the query and fetch. This is only called once,
  // and relies on this component only being loaded once
  // next.js has properly parsed the query params.
  // See `useQuery` in _app.tsx to see how this happens.
  useEffect(() => {
    if (Object.keys(query).length && query.zipcode) {
      const { streetAddress, state, city, zipcode, county } = query;
      const parsedAddress = {
        streetAddress: streetAddress?.toString(),
        state: state?.toString(),
        city: city?.toString(),
        zipcode: zipcode?.toString(),
        county: county?.toString(),
      };
      TagManager.dataLayer({
        dataLayer: { event: 'deep_link', address: stringifyAddress(parsedAddress) },
      });
      setAddress(parsedAddress);
    }
  }, []);

  useEffect(() => {
    if (address) {
      getDropoffLocations();
    } else {
      resetDropoffLocations();
    }
  }, [address]);

  useEffect(() => {
    const ReactPixel = require('react-facebook-pixel'); // eslint-disable-line
    ReactPixel.default.init(process.env.FACEBOOK_APP_ID);
    ReactPixel.default.pageView();
  }, []);

  return (
    <Box className={classes.wrapper} display="flex" flexDirection="column">
      <Box className={classes.header} py={2} onClick={resetAddress}>
        <Container maxWidth="sm">
          <Box display="flex">
            <Box flex="1" />
            <img src="/logo.png" alt="Ballot Dropoff Logo" width={161} height={41} />
            <Box flex="1" alignItems="center" justifyContent="flex-end" display="flex">
              <Box
                className={classes.languageSelector}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <LanguageLink locale="en-US" label="EN" title="English" />
                {' | '}
                <LanguageLink locale="es-US" label="ES" title="Español" />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      <Box flex="1">
        <Container maxWidth="sm" className={classes.container}>
          <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
            <Box flex="1">
              <Box mt={2} mb={2}>
                <Typography variant="h1" color="secondary">
                  {strings.home.header}
                </Typography>
                <Typography variant="body1">{strings.home.intro}</Typography>
              </Box>
              <Address />
              {dropoffLocationsStatus === APIStatus.Loading && <LoadingOverlay />}
              {dropoffLocationsStatus === APIStatus.Success && (
                <>
                  {dropoffLocations?.length > 0 && (
                    <DropoffLocationsList dropoffLocations={dropoffLocations} />
                  )}
                </>
              )}
              {dropoffLocationsStatus === APIStatus.Error && (
                <Error error={dropoffLocationsError} />
              )}
              {geocoderStatus === APIStatus.Error && <Error error={geocoderError} />}
            </Box>
            <Disclaimer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
