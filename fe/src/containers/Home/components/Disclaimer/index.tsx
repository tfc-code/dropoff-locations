/* eslint-disable react/jsx-one-expression-per-line */
import React, { FC } from 'react';
import { Box, Typography, Link } from '@material-ui/core';
import { strings } from '@/i18n';

export const Disclaimer: FC = () => (
  <Box mb={8} mt={2} textAlign="center">
    <Typography variant="caption">
      {strings.disclaimer.paidForBy}{' '}
      <Link className="bold" rel="noopener" href="https://www.techforcampaigns.org">
        {strings.disclaimer.techForCampaigns}
      </Link>
      {'. '}
      {strings.disclaimer.notAuthorized}
      <br />
      {strings.disclaimer.viewOur}{' '}
      <Link href="https://www.techforcampaigns.org/privacy" rel="noopener" target="_blank">
        {strings.disclaimer.privacyPolicy}
      </Link>
    </Typography>
  </Box>
);
