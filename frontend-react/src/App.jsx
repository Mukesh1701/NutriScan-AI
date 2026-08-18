import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Toast from './components/Toast';
import ClassifyPage from './pages/ClassifyPage';
import CalculatorPage from './pages/CalculatorPage';
import BarcodePage from './pages/BarcodePage';
import AboutPage from './pages/AboutPage';
import FoodBarcodeScannerPage from './pages/FoodBarcodeScannerPage';
import FoodLabelAnalyzerPage from './pages/FoodLabelAnalyzerPage';
import HealthyFoodScannerPage from './pages/HealthyFoodScannerPage';
import HowToReadFoodLabelPage from './pages/articles/HowToReadFoodLabelPage';
import IsThisFoodHealthyPage from './pages/articles/IsThisFoodHealthyPage';
import HowMuchSugarPage from './pages/articles/HowMuchSugarPage';
import FoodAdditivesPage from './pages/articles/FoodAdditivesPage';
import CheckIngredientsPage from './pages/articles/CheckIngredientsPage';
import './index.css';

function App() {
  return (
    <>
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <Header />
      <main className="main">
        <Routes>
          {/* Core app pages */}
          <Route path="/" element={<BarcodePage />} />
          <Route path="/barcode" element={<Navigate to="/" replace />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/classify" element={<ClassifyPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* SEO landing pages */}
          <Route path="/food-barcode-scanner" element={<FoodBarcodeScannerPage />} />
          <Route path="/food-label-analyzer" element={<FoodLabelAnalyzerPage />} />
          <Route path="/healthy-food-scanner" element={<HealthyFoodScannerPage />} />

          {/* Article pages */}
          <Route path="/how-to-read-food-label" element={<HowToReadFoodLabelPage />} />
          <Route path="/is-this-food-healthy" element={<IsThisFoodHealthyPage />} />
          <Route path="/how-much-sugar-is-too-much" element={<HowMuchSugarPage />} />
          <Route path="/what-are-food-additives" element={<FoodAdditivesPage />} />
          <Route path="/how-to-check-food-ingredients" element={<CheckIngredientsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toast />
    </>
  );
}

export default App;
