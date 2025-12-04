import React from 'react';

const Home = () => {
  return (
    // The Navbar has been removed. App.jsx now handles adding the navbar
    // for all pages wrapped in the MainLayout.
    <main className="p-8">
      <h1 className="text-3xl font-bold">Welcome to StartupConnect</h1>
      <p>This is your home page content.</p>
    </main>
  );
};

export default Home;
