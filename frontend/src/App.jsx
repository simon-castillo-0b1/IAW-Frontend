import { useState } from 'react';
import SitesSection from './components/SitesSection';
import SnapshotsSection from './components/SnapshotsSection';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('sites');
  const [sitesList, setSitesList] = useState([]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Search Service - Panel de Admin</h1>

        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'sites' ? 'active' : ''}`}
            onClick={() => setActiveTab('sites')}
          >
            Sitios
          </button>
          <button
            className={`tab-btn ${activeTab === 'snapshots' ? 'active' : ''}`}
            onClick={() => setActiveTab('snapshots')}
          >
            Snapshots
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'sites' && (
          <SitesSection onSitesChanged={(sites) => setSitesList(sites)} />
        )}
        {activeTab === 'snapshots' && (
          <SnapshotsSection sitesList={sitesList} />
        )}
      </main>
    </div>
  );
}
