import React, { ReactElement } from 'react';
import { Link } from '@material-ui/core';

type LinkReplaceType = (string: string) => string | ReactElement;

export const linkReplace: LinkReplaceType = (text) => {
  const linkRegEx = /https:\S*/;
  const foundLink = text?.match(linkRegEx);

  let content;
  if (foundLink?.length > 0) {
    const link = (
      <Link rel="noopener" href={foundLink[0]} target="_blank">
        {foundLink[0]}
      </Link>
    );
    const splitError = text.split(foundLink[0]);
    content = (
      <>
        {splitError[0]}
        {link}
        {splitError[1]}
      </>
    );
  } else {
    content = text;
  }

  return content;
};
