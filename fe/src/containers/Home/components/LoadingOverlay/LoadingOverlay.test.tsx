import React from 'react';
import { render } from '@testing-library/react';

import { LoadingOverlay } from '.';

describe('<LoadingOverlay />', () => {
  it('renders', () => {
    const { container } = render(<LoadingOverlay />);
    expect(container.querySelector('.MuiBackdrop-root')).toBeTruthy();
  });
});
