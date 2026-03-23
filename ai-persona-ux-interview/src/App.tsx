import { useEffect } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout.tsx';
import { useStore } from './store/useStore.ts';

function App() {
  const { setDemoMode } = useStore();

  useEffect(() => {
    const hasKey = !!import.meta.env.VITE_OPENAI_API_KEY;
    setDemoMode(!hasKey);
  }, [setDemoMode]);

  return <DashboardLayout />;
}

export default App;
