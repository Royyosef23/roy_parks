import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">
              🅿️ ParkBnB
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-white">
                  שלום, {user.firstName} {user.lastName}
                </span>
                <span className="text-blue-200 text-sm">
                  ({user.role === 'ADMIN' ? 'מנהל' : 'דייר'})
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  התנתק
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
