import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { UserLibraryProvider } from './context/UserLibraryContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import MyList from './pages/MyList';
import './App.css';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Navbar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <UserLibraryProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <AppShell>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/my-list" element={<MyList />} />
                    <Route path="/watch/:id" element={<Watch />} />
                  </Routes>
                </AppShell>
              }
            />
          </Routes>
        </UserLibraryProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
