import { useState } from 'react';
import { Toaster } from 'sonner';
import { NavigationContext } from './context/NavigationContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Flashcards } from './pages/Flashcards';
import { Quiz } from './pages/Quiz';
import { Writing } from './pages/Writing';
import { Words } from './pages/Words';
import { Settings } from './pages/Settings';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard />;
      case '/upload':
        return <Upload />;
      case '/flashcards':
        return <Flashcards />;
      case '/quiz':
        return <Quiz />;
      case '/writing':
        return <Writing />;
      case '/words':
        return <Words />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <NavigationContext.Provider value={{ navigate: setCurrentPath, currentPath }}>
      <div className="size-full">
        <Layout currentPath={currentPath} onNavigate={setCurrentPath}>
          {renderPage()}
        </Layout>
        <Toaster position="top-right" />
      </div>
    </NavigationContext.Provider>
  );
}
