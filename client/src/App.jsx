import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './app/providers/query.provider.jsx';
import { AuthProvider } from './app/providers/auth.provider.jsx';
import { ThemeProvider } from './app/providers/theme.provider.jsx';
import AppRouter from './app/router/index.jsx';

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppRouter />
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}

export default App;