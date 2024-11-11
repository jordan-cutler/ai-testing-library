import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleSwitch } from './ToggleSwitch';

describe('ToggleSwitch Component', () => {
  it('renders with initial state', () => {
    render(<ToggleSwitch label="Dark Mode" isOn={false} onToggle={() => {}} />);
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-status')).toHaveTextContent('OFF');
  });

  it('calls onToggle with correct value when clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = jest.fn();
    render(
      <ToggleSwitch label="Dark Mode" isOn={false} onToggle={handleToggle} />,
    );

    await user.click(screen.getByTestId('toggle-button'));
    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it('respects disabled state', async () => {
    const user = userEvent.setup();
    const handleToggle = jest.fn();
    render(
      <ToggleSwitch
        label="Dark Mode"
        isOn={false}
        onToggle={handleToggle}
        disabled={true}
      />,
    );

    const toggleButton = screen.getByTestId('toggle-button');
    expect(toggleButton).toBeDisabled();
    await user.click(toggleButton);
    expect(handleToggle).not.toHaveBeenCalled();
  });

  it('updates aria-pressed attribute based on state', () => {
    const { rerender } = render(
      <ToggleSwitch label="Dark Mode" isOn={false} onToggle={() => {}} />,
    );

    expect(screen.getByTestId('toggle-button')).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    rerender(
      <ToggleSwitch label="Dark Mode" isOn={true} onToggle={() => {}} />,
    );

    expect(screen.getByTestId('toggle-button')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
