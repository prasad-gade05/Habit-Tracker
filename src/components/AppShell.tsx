import React from 'react';
import { Outlet } from 'react-router-dom';

const AppShell: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Outlet />
    </div>
  );
};

export default AppShell;