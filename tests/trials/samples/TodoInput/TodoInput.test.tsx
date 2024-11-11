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
