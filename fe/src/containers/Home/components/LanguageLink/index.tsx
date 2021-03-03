import React, { FC } from 'react';
import { Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import qs from 'query-string';
import cn from 'classnames';

import { strings } from '@/i18n';

const useStyles = makeStyles(() => ({
  languageLink: {
    color: 'inherit',
  },
  selected: {
    fontWeight: 'bolder',
    textDecoration: 'underline',
  },
}));

export const LanguageLink: FC<{ locale: string; label: string; title: string }> = ({
  locale,
  label,
  title,
}) => {
  const { query } = useRouter();
  const classes = useStyles();

  // NOTE: This is a hack since we can't get a node server up and running in time for the election and need to stick with static site generation.
  // This means that these links will NOT WORK in dev.
  const languageLink = Object.keys(query).length
    ? `/${locale}.html?${qs.stringify(query)}`
    : `/${locale}.html`;

  return (
    <Link
      href={languageLink}
      title={title}
      className={cn(classes.languageLink, { [classes.selected]: strings.getLanguage() === locale })}
    >
      {label}
    </Link>
  );
};
