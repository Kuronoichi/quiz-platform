import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import reportWebVitals from './reportWebVitals';

const theme = extendTheme({
  fonts: {
    heading:
      '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    body:
      '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  shadows: {
    outline: '0 0 0 3px rgba(139, 130, 242, 0.45)',
    card: '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
    cardHover: '0 12px 40px -8px rgba(15, 23, 42, 0.12), 0 4px 16px rgba(15, 23, 42, 0.06)',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    },
  },
  colors: {
    brand: {
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
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          boxShadow: 'card',
          borderWidth: '1px',
          borderColor: 'gray.100',
        },
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
