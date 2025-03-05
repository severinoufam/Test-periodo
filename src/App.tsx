import React, { useState } from 'react';
import IssueTable from './components/IssueTable';
import DateRangePicker from './components/DateRangePicker';
import { GitLabLogo } from './components/GitLabLogo';

function App() {
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date()
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <GitLabLogo className="h-8 w-8 text-[#FC6D26] mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">GitLab Issues Tracker</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtrar por período</h2>
          <DateRangePicker onDateChange={setDateRange} />
          <div className="mt-2 text-sm text-gray-500">
            Filtrando issues de {dateRange.startDate.toLocaleDateString('pt-BR')} até {dateRange.endDate.toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Issues</h2>
          <IssueTable dateRange={dateRange} />
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            GitLab Issues Tracker © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;