import React, { useState } from 'react';

interface CounterProps {
  initialCount?: number;
  label?: string;
}

export const Counter: React.FC<CounterProps> = ({
  initialCount = 0,
  label = 'Count',
}) => {
  const [count, setCount] = useState(initialCount);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(initialCount);

  return (
    <div data-testid="counter-container">
      <h2>
        {label}: {count}
      </h2>
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
};
