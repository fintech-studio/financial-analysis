import React from 'react';
import Navigation from './components/Layout/Navigation';
import Routes from './Routes';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-16">
        <Routes />
      </main>
    </div>
  );
}

export default App; 