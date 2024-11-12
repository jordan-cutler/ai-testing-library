import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AITest, AITestProps } from './AITest';

const renderComponent = (props: Partial<AITestProps> = {}) => {
  const defaultProps: AITestProps = {
    initialCount: 0,
    label: 'Count',
  };
  return render(<AITest {...defaultProps} {...props} />);
};

describe('<AITest />', () => {
  it('should render the AITest component with default props', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: 'Count: 0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrease count' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase count' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset count' })).toBeInTheDocument();
  });

  it('should increase count when increment button is clicked', () => {
    renderComponent();
    const incrementButton = screen.getByRole('button', { name: 'Increase count' });
    fireEvent.click(incrementButton);
    expect(screen.getByRole('heading', { name: 'Count: 1' })).toBeInTheDocument();
  });

  it('should decrease count when decrement button is clicked', () => {
    renderComponent({ initialCount: 5 });
    const decrementButton = screen.getByRole('button', { name: 'Decrease count' });
    fireEvent.click(decrementButton);
    expect(screen.getByRole('heading', { name: 'Count: 4' })).toBeInTheDocument();
  });

  it('should reset count when reset button is clicked', () => {
    renderComponent({ initialCount: 7 });
    const resetButton = screen.getByRole('button', { name: 'Reset count' });
    fireEvent.click(resetButton);
    expect(screen.getByRole('heading', { name: 'Count: 0' })).toBeInTheDocument();
  });

  it('should render with a different label when provided', () => {
    renderComponent({ label: 'Steps' });
    expect(screen.getByRole('heading', { name: 'Steps: 0' })).toBeInTheDocument();
  });
});