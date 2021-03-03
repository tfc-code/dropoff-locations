import React from 'react';
import { render } from '@testing-library/react';

import { Disclaimer } from '.';

describe('<Disclaimer />', () => {
  it('renders', () => {
    const { getByText } = render(<Disclaimer />);
    expect(getByText('Tech for Campaigns')).toBeInTheDocument();
  });
});
