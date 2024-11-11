import React, { useState } from 'react';

interface TodoInputProps {
  onAddTodo: (text: string) => void;
  placeholder?: string;
}

export const TodoInput: React.FC<TodoInputProps> = ({
  onAddTodo,
  placeholder = 'Enter a new todo',
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
};
