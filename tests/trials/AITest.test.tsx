import React from 'react';
import { render, screen } from '@testing-library/react';
import { AITest, AITestProps } from './AITest';

describe('AITest Component', () => {
  const renderComponent = (props: Partial<AITestProps> = {}) => {
    return render(<AITest {...props} />);
  };

  it('renders with default props', () => {
    renderComponent();
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
});