import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, sidebar }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
    <Navbar />
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {sidebar ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
          <main>{children}</main>
          <aside>{sidebar}</aside>
        </div>
      ) : children}
    </div>
  </div>
);

export default Layout;
