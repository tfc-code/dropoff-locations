import React from 'react';
import { render } from '@testing-library/react';

import { Error } from '.';

describe('<Error />', () => {
  it('renders', () => {
    const { getByText } = render(<Error error="foo" />);
    expect(getByText('foo')).toBeInTheDocument();
  });
});
