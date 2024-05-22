import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../../store/UserStore';
import SignUp from './SignUp';

// Mocking the signUp API call
jest.mock('../../../http/userAPI', () => ({
  signUp: jest.fn(),
}));

const mockedSignUp = require('../../../http/userAPI').signUp;

describe('SignUp Component', () => {
  const changeIsLogin = jest.fn();

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <SignUp changeIsLogin={changeIsLogin} />
      </BrowserRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders SignUp component', () => {
    renderComponent();
    expect(screen.getAllByText("Зареєструватися")).toHaveLength(2);
  });

  test('validates email correctly', () => {
    renderComponent();
    const emailInput = screen.getByPlaceholderText('Введіть електронну пошту');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    expect(screen.getByText('Неправильна електронна адреса')).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.blur(emailInput);
    expect(screen.queryByText('Неправильна електронна адреса')).toBeNull();
  });

  test('validates password correctly', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Введіть пароль');

    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.blur(passwordInput);
    expect(screen.getByText('Пароль повинен містити літери, цифри та один спеціальний символ (!, @, #, $, %, ^, &, *)')).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: 'Valid123!' } });
    fireEvent.blur(passwordInput);
    expect(screen.queryByText('Пароль повинен містити літери, цифри та один спеціальний символ (!, @, #, $, %, ^, &, *)')).toBeNull();
  });

  test('calls signUp API and updates store on successful sign up', async () => {
    renderComponent();
    const emailInput = await screen.findByPlaceholderText('Введіть електронну пошту');
    const passwordInput = await screen.findByPlaceholderText('Введіть пароль');
    const usernameInput = await screen.findByPlaceholderText('Введіть своє і\'мя');

    const signUpButton = screen.getByRole('button', { name: 'Зареєструватися' });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Valid123!' } });
    fireEvent.change(usernameInput, { target: { value: 'username' } });

    // Мок для успішної відповіді
    mockedSignUp.mockResolvedValueOnce({
      login: 'username',
      email: 'user@example.com',
      role: 'user',
      tickets: [],
      message: ''
    });

    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(store.login).toEqual('username');
      expect(store.email).toEqual('user@example.com');
      expect(store.role).toEqual('user');
      expect(store.userTickets).toEqual([]);
      expect(store.isLogin).toEqual(true);
    });
  });
});