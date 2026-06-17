import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the DPDP request form', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /submit user request/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/information type/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/request type/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/user information/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
});
