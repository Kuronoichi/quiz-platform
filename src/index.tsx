import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import reportWebVitals from './reportWebVitals';

const theme = extendTheme({
  fonts: {
    heading:
      '"Inter", "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    body:
      '"Inter", "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  colors: {
    brand: {
      // Пастельная лаванда/сирень
      50: '#f6f5ff',
      100: '#eeecff',
      200: '#dbd7ff',
      300: '#c2bcff',
      400: '#a79eff',
      500: '#8b82f2',
      600: '#7066cf',
      700: '#574faa',
      800: '#403b7f',
      900: '#2a2752',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
        borderRadius: 'lg',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
