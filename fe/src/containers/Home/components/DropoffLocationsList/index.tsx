import React, { FC, useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import hash from 'object-hash';

import { strings } from '@/i18n';
import { DropoffLocation } from '@/api/src/types';

import { LocationCard } from '../LocationCard';

export const ELEMENTS_PER_PAGE = 20;

export const DropoffLocationsList: FC<{ dropoffLocations: Array<DropoffLocation> }> = ({
  dropoffLocations,
}) => {
  const [page, setPage] = useState(0);

  const pageStart = page * ELEMENTS_PER_PAGE;
  const pageEnd = Math.min((page + 1) * ELEMENTS_PER_PAGE, dropoffLocations.length);
  const numPages = Math.ceil(dropoffLocations.length / ELEMENTS_PER_PAGE);

  const shownLocations = dropoffLocations.slice(pageStart, pageEnd);

  const headerText =
    numPages > 1
      ? `${strings.dropoffLocationsList.showing} ${pageStart + 1} - ${pageEnd} ${
          strings.dropoffLocationsList.of
        } ${dropoffLocations.length} ${strings.dropoffLocationsList.results}`
      : `${dropoffLocations.length} ${
          dropoffLocations.length > 1
            ? strings.dropoffLocationsList.results
            : strings.dropoffLocationsList.result
        } ${strings.dropoffLocationsList.found}`;

  const pagination = (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="textSecondary" className="bold">
        {headerText}
      </Typography>
      {numPages > 1 && (
        <Box>
          <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
            {strings.dropoffLocationsList.prev}
          </Button>
          <Button disabled={page === numPages - 1} onClick={() => setPage(page + 1)}>
            {strings.dropoffLocationsList.next}
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Box mb={2}>
        <Box mb={2}>
          <Alert severity="info">
            {strings.dropoffLocationsList.successText}
            <br />
            <br />
            {strings.dropoffLocationsList.electionDayNotice}
          </Alert>
        </Box>
        {pagination}
      </Box>

      {shownLocations.map((location) => (
        <LocationCard location={location} key={hash(location)} />
      ))}

      {pagination}
    </Box>
  );
};
