import React from 'react';
import { render } from '@testing-library/react';
import { linkReplace } from '.';

describe('linkReplace', () => {
  it('returns the string if it contains no links', () => {
    expect(linkReplace('foo')).toBe('foo');
  });

  it('replaces a link if one is found', () => {
    const { container } = render(<div>{linkReplace('foo https://www.google.com bar')}</div>);
    expect(container.querySelector('a').getAttribute('href')).toBe('https://www.google.com');
    expect(container.innerHTML.includes('foo')).toBeTruthy();
    expect(container.innerHTML.includes('bar')).toBeTruthy();
  });
});
