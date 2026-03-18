import { render, screen } from '@testing-library/react';
import App from './App';

test('DropDownBox with search and embedded DataGrid', () => {
  render(<App />);
  const linkElement = screen.getByText(/Search Timeout/i);
  expect(linkElement).toBeInTheDocument();
});
