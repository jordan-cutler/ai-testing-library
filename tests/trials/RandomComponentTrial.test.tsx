import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from 'tests/trials/RandomComponentTrial';

describe('Counter Component', () => {
  it('renders with default props', () => {
    render(<Counter />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('renders with custom initial count and label', () => {
    render(<Counter initialCount={5} label="Score" />);
    expect(screen.getByText('Score: 5')).toBeInTheDocument();
  });

  it('increments count when + button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    const incrementButton = screen.getByTestId('increment-button');

    await user.click(incrementButton);
    expect(screen.getByText('Count: 2')).toBeInTheDocument();
  });

  it('decrements count when - button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);
    const decrementButton = screen.getByTestId('decrement-button');

    await user.click(decrementButton);
    expect(screen.getByText('Count: 3')).toBeInTheDocument();
  });

  it('resets count to initial value when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);
    const resetButton = screen.getByTestId('reset-button');
    const incrementButton = screen.getByTestId('increment-button');

    await user.click(incrementButton);
    await user.click(incrementButton);
    expect(screen.getByText('Count: 4')).toBeInTheDocument();

    await user.click(resetButton);
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });
});
