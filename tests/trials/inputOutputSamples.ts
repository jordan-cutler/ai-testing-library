export const inputOutputSamples = [
  {
    input: `
import React, { useState } from 'react';

interface CounterProps {
  initialCount?: number;
  label?: string;
}

export const Counter: React.FC<CounterProps> = ({
  initialCount = 0,
  label = 'Count'
}) => {
  const [count, setCount] = useState(initialCount);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialCount);

  return (
    <div data-testid="counter-container">
      <h2>{label}: {count}</h2>
      <div>
        <button
          onClick={decrement}
          data-testid="decrement-button"
          aria-label="Decrease count"
        >
          -
        </button>
        <button
          onClick={increment}
          data-testid="increment-button"
          aria-label="Increase count"
        >
          +
        </button>
        <button
          onClick={reset}
          data-testid="reset-button"
          aria-label="Reset count"
        >
          Reset
        </button>
      </div>
    </div>
  );
};`,
    output: `
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

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
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('decrements count when - button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);
    const decrementButton = screen.getByTestId('decrement-button');

    await user.click(decrementButton);
    expect(screen.getByText('Count: 4')).toBeInTheDocument();
  });

  it('resets count to initial value when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);
    const resetButton = screen.getByTestId('reset-button');
    const incrementButton = screen.getByTestId('increment-button');

    await user.click(incrementButton);
    await user.click(incrementButton);
    expect(screen.getByText('Count: 7')).toBeInTheDocument();

    await user.click(resetButton);
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });
});
`,
  },
  {
    input: `
import React, { useState } from 'react';

interface TodoInputProps {
  onAddTodo: (text: string) => void;
  placeholder?: string;
}

export const TodoInput: React.FC<TodoInputProps> = ({
  onAddTodo,
  placeholder = 'Enter a new todo'
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="todo-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        data-testid="todo-input"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        data-testid="add-todo-button"
      >
        Add Todo
      </button>
    </form>
  );
};`,
    output: `
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoInput } from './TodoInput';

describe('TodoInput Component', () => {
  it('renders with default placeholder', () => {
    render(<TodoInput onAddTodo={() => {}} />);
    expect(screen.getByPlaceholderText('Enter a new todo')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<TodoInput onAddTodo={() => {}} placeholder="Add task" />);
    expect(screen.getByPlaceholderText('Add task')).toBeInTheDocument();
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAddTodo={() => {}} />);
    const input = screen.getByTestId('todo-input');

    await user.type(input, 'New todo item');
    expect(input).toHaveValue('New todo item');
  });

  it('calls onAddTodo when form is submitted', async () => {
    const user = userEvent.setup();
    const handleAddTodo = jest.fn();
    render(<TodoInput onAddTodo={handleAddTodo} />);

    const input = screen.getByTestId('todo-input');
    await user.type(input, 'New todo item');
    await user.click(screen.getByTestId('add-todo-button'));

    expect(handleAddTodo).toHaveBeenCalledWith('New todo item');
    expect(input).toHaveValue('');
  });

  it('does not submit empty todos', async () => {
    const user = userEvent.setup();
    const handleAddTodo = jest.fn();
    render(<TodoInput onAddTodo={handleAddTodo} />);

    const submitButton = screen.getByTestId('add-todo-button');
    await user.click(submitButton);

    expect(handleAddTodo).not.toHaveBeenCalled();
  });
});
`,
  },
  {
    input: `
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
  disabled = false
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
          <span data-testid="toggle-status">
            {isOn ? 'ON' : 'OFF'}
          </span>
        </button>
      </label>
    </div>
  );
};`,
    output: `
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
`,
  },
];

export default inputOutputSamples;
