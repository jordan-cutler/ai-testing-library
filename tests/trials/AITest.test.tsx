
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AITest, AITestProps } from './AITest';

const renderComponent = (props: Partial<AITestProps> = {}) => {
  const defaultProps: AITestProps = {
    initialCount: 0,
    label: 'Count',
    ...props
  };
  return render(<AITest {...defaultProps} />);
};

describe('AITest Component', () => {
  it('renders with default props', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /Count: 0/i })).toBeInTheDocument();
  });

  it('renders with custom initial count and label', () => {
    renderComponent({ initialCount: 5, label: 'Score' });
    expect(screen.getByRole('heading', { name: /Score: 5/i })).toBeInTheDocument();
  });

  it('increments the count when + button is clicked', async () => {
    renderComponent();
    const incrementButton = screen.getByRole('button', { name: /Increase count/i });

    await userEvent.click(incrementButton);
    expect(screen.getByRole('heading', { name: /Count: 1/i })).toBeInTheDocument();
  });

  it('decrements the count when - button is clicked', async () => {
    renderComponent({ initialCount: 5 });
    const decrementButton = screen.getByRole('button', { name: /Decrease count/i });

    await userEvent.click(decrementButton);
    expect(screen.getByRole('heading', { name: /Count: 4/i })).toBeInTheDocument();
  });

  it('resets the count to initial value when reset button is clicked', async () => {
    renderComponent({ initialCount: 5 });
    const resetButton = screen.getByRole('button', { name: /Reset count/i });
    const incrementButton = screen.getByRole('button', { name: /Increase count/i });

    await userEvent.click(incrementButton);
    await userEvent.click(incrementButton);
    expect(screen.getByRole('heading', { name: /Count: 7/i })).toBeInTheDocument();

    await userEvent.click(resetButton);
    expect(screen.getByRole('heading', { name: /Count: 5/i })).toBeInTheDocument();
  });

  it('handles multiple increments and decrements correctly', async () => {
    renderComponent({ initialCount: 0 });
    const incrementButton = screen.getByRole('button', { name: /Increase count/i });
    const decrementButton = screen.getByRole('button', { name: /Decrease count/i });

    await userEvent.click(incrementButton);
    await userEvent.click(incrementButton);
    await userEvent.click(decrementButton);
    expect(screen.getByRole('heading', { name: /Count: 1/i })).toBeInTheDocument();

    await userEvent.click(decrementButton);
    expect(screen.getByRole('heading', { name: /Count: 0/i })).toBeInTheDocument();

    await userEvent.click(decrementButton);
    // Ensure count does not go below 0
    expect(screen.getByRole('heading', { name: /Count: 0/i })).toBeInTheDocument();
  });
});