import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';

test('renders home page hero', () => {
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  expect(
    screen.getByText(/Квиз‑платформа без лишней строгости/i)
  ).toBeInTheDocument();
});
