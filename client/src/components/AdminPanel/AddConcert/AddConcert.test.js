import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AddConcert from './AddConcert';

describe('AddConcert component', () => {
  test('renders input fields and button', () => {
    const { getByPlaceholderText, getByText } = render(<AddConcert />);
    expect(getByPlaceholderText('Введіть назву заходу')).toBeInTheDocument();
    expect(getByPlaceholderText('Введіть опис заходу')).toBeInTheDocument();
    expect(getByText('Виберіть тип заходу')).toBeInTheDocument();
    expect(getByText('Виберіть місце проведення')).toBeInTheDocument();
    expect(getByPlaceholderText('Обери дату')).toBeInTheDocument();
    expect(getByText('Створити')).toBeInTheDocument();
  });
  
  test('uploads image', async () => {
    const { getByLabelText, getByText } = render(<AddConcert />);
    const file = new File(['(⌐□_□)'], 'poster.png', { type: 'image/png' });
    Object.defineProperty(getByLabelText('Обрати афішу'), 'files', {
      value: [file],
    });
    fireEvent.change(getByLabelText('Обрати афішу'));
    await waitFor(() => expect(getByText('poster.png')).toBeInTheDocument());
  });
});