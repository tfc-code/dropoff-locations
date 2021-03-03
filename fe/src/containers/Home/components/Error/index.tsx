import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';

import { linkReplace } from '@/utils';

const useStyles = makeStyles(() => ({
  errorText: {
    color: 'rgba(0,0,0, .87)',
  },
}));

export const Error: FC<{ error: string; severity?: 'error' | 'info' | 'success' | 'warning' }> = ({
  error,
  severity = 'error',
}) => {
  const classes = useStyles();

  return (
    <Alert
      severity={severity}
      classes={{
        standardError: classes.errorText,
      }}
    >
      {linkReplace(error)}
    </Alert>
  );
};
