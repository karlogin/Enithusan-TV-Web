import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Browse from './pages/Browse';
import './App.css';

export default function App() {
  return (
    <LanguageProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watch/:id" element={<Watch />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}
