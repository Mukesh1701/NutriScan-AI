import { useApp } from './context/AppContext';
import Header from './components/Header';
import Toast from './components/Toast';
import ClassifyPage from './pages/ClassifyPage';
import CalculatorPage from './pages/CalculatorPage';
import BarcodePage from './pages/BarcodePage';
import AboutPage from './pages/AboutPage';
import './index.css';

function App() {
  const { activePage } = useApp();

  const renderPage = () => {
    switch (activePage) {
      case 'classify':
        return <ClassifyPage />;
      case 'calculator':
        return <CalculatorPage />;
      case 'barcode':
        return <BarcodePage />;
      case 'about':
        return <AboutPage />;
      default:
        return <BarcodePage />;
    }
  };

  return (
    <>
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <Header />
      <main className="main">
        {renderPage()}
      </main>
      <Toast />
    </>
  );
}

export default App;
