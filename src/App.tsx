import { useCallback, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProfileProvider } from './context/ProfileContext';
import { UserLibraryProvider } from './context/UserLibraryContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Splash from './components/Splash';
import SpotlightSearch from './components/SpotlightSearch';
import TabBar from './components/TabBar';
import { ToastProvider } from './components/Toast';
import { SpotlightProvider } from './context/SpotlightContext';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyList from './pages/MyList';
import History from './pages/History';
import Account from './pages/Account';
import About from './pages/About';
import SharedList from './pages/SharedList';
import NotFound from './pages/NotFound';
import './App.css';

function splashAlreadyDone() {
  try { return !!sessionStorage.getItem('vadai-splash'); } catch { return true; }
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Navbar />
      <main id="main-content">{children}</main>
      <TabBar />
      <SpotlightSearch />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(!splashAlreadyDone());
  const onSplashDone = useCallback(() => {
    try { sessionStorage.setItem('vadai-splash', '1'); } catch {}
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <Splash onDone={onSplashDone} />}
    <LanguageProvider>
      <AuthProvider>
        <ProfileProvider>
          <UserLibraryProvider>
          <SpotlightProvider>
            <ToastProvider>
            <ErrorBoundary>
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
                      <Route path="/history" element={<History />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/shared-list" element={<SharedList />} />
                      <Route path="/watch/:id" element={<Watch />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppShell>
                }
              />
            </Routes>
            </ErrorBoundary>
            </ToastProvider>
          </SpotlightProvider>
          </UserLibraryProvider>
        </ProfileProvider>
      </AuthProvider>
    </LanguageProvider>
    </>
  );
}
