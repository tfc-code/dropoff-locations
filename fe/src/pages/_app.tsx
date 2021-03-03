import Head from 'next/head';
import React, { useEffect, ElementType, FC } from 'react';

import { AddressProvider, DropoffLocationsProvider } from '@/contexts';

import { useQuery } from '@/utils';

import TagManager from 'react-gtm-module';

import { Theme } from '../theme';

const tagManagerArgs = {
  gtmId: 'GTM-NTGDXJF',
};

type AppType = FC<{ Component: ElementType; pageProps: any }>; // eslint-disable-line @typescript-eslint/no-explicit-any

const App: AppType = ({ Component, pageProps }) => {
  const query = useQuery();

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    TagManager.initialize(tagManagerArgs);
  }, []);
  return (
    <>
      <Head>
        <title>Ballot Dropoff Locations | Tech For Campaigns</title>
        <meta
          name="description"
          content="Find nearby ballot dropoff locations for the 2020 election."
        />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ballotdropoff.techforcampaigns.io/" />
        <meta property="og:title" content="Ballot Dropoff Locations | Tech For Campaigns" />
        <meta
          property="og:description"
          content="Find nearby ballot dropoff locations for the 2020 election."
        />
        <meta property="og:image" content="https://ballotdropoff.techforcampaigns.io/social.jpg" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://ballotdropoff.techforcampaigns.io/" />
        <meta property="twitter:title" content="Ballot Dropoff Locations | Tech For Campaigns" />
        <meta
          property="twitter:description"
          content="Find nearby ballot dropoff locations for the 2020 election."
        />
        <meta
          property="twitter:image"
          content="https://ballotdropoff.techforcampaigns.io/social.jpg"
        />
        <link rel="preconnect" href={`${process.env.NEXT_PUBLIC_DROPOFF_LOCATION_API}`} />
        <link rel="dns-prefetch" href={`${process.env.NEXT_PUBLIC_DROPOFF_LOCATION_API}`} />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACES_KEY}&libraries=places`}
        />
      </Head>
      <Theme>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <AddressProvider>
          <DropoffLocationsProvider>
            {/* eslint-disable react/jsx-props-no-spreading */}
            {query && <Component {...pageProps} />}
            {/* eslint-enable react/jsx-props-no-spreading */}
          </DropoffLocationsProvider>
        </AddressProvider>
      </Theme>
    </>
  );
};

export default App;
