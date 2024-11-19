import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter as Router } from 'react-router-dom';
import './index.css';
import App from './containers/app/App';
import store from './store';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { Provider } from 'react-redux';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router initialEntries={["/login", "/"]} initialIndex={0}>
      <Provider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Provider>
    </Router>
  </React.StrictMode>
);

