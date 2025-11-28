'use client';

import { Search, Bell, Plus } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  onNewClick?: () => void;
  newButtonText?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export default function Header({ 
  title, 
  onNewClick, 
  newButtonText = 'Nuovo',
  showSearch = false,
  onSearch 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          {showSearch && (
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </form>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* New button */}
          {onNewClick && (
            <button
              onClick={onNewClick}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{newButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
