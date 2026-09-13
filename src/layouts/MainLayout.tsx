import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSmartboard } from '../context/SmartboardContext';

export default function MainLayout() {
  const { active } = useSmartboard();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!active && <Header />}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] bg-white px-3 py-2 rounded shadow">
        Skip to main content
      </a>
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      {!active && <Footer />}
    </div>
  );
}
