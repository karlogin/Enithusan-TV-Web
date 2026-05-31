import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserLibraryProvider } from './context/UserLibraryContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyList from './pages/MyList';
import Account from './pages/Account';
import About from './pages/About';
import NotFound from './pages/NotFound';
import './App.css';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Navbar />
      <main id="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProfileProvider>
            <UserLibraryProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/*"
                  element={
                    <AppShell>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/browse" element={<Browse />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/my-list" element={<MyList />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/watch/:id" element={<Watch />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppShell>
                  }
                />
              </Routes>
            </UserLibraryProvider>
          </ProfileProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
