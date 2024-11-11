import React from 'react';

interface ToggleSwitchProps {
  label: string;
  isOn: boolean;
  onToggle: (newState: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  isOn,
  onToggle,
  disabled = false,
}) => {
  return (
    <div data-testid="toggle-container">
      <label>
        {label}
        <button
          onClick={() => onToggle(!isOn)}
          disabled={disabled}
          data-testid="toggle-button"
          aria-pressed={isOn}
          aria-label={label}
        >
          <span data-testid="toggle-status">{isOn ? 'ON' : 'OFF'}</span>
        </button>
      </label>
    </div>
  );
};
