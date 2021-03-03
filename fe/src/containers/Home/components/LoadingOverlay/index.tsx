import React, { FC } from 'react';

import { CircularProgress, Backdrop } from '@material-ui/core';

export const LoadingOverlay: FC = () => (
  <Backdrop open>
    <CircularProgress color="primary" />
  </Backdrop>
);
