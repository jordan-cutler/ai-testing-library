import React from 'react';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  const renderComponent = () => {
    render(<MyComponent/>)
  }

  it('should render', () => {
    renderComponent();

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  })
})