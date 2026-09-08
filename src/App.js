import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import MineralDetailPage from './pages/MineralDetailPage';
import Navbar from './components/Navbar';
import './App.css';
import ProjectsPage from './pages/ProjectsPage';
import UserGuidePage from './pages/UserGuidePage';
import PublicationsPage from './pages/PublicationsPage';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/mineral/:id" element={<MineralDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/user-guide" element={<UserGuidePage />} />
          <Route path="/publications" element={<PublicationsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;