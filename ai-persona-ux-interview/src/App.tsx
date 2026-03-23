import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './components/layout/DashboardLayout.tsx';
import { useStore } from './store/useStore.ts';
import { useGlobalImageUpload } from './hooks/useGlobalImageUpload.ts';

function App() {
  const { setDemoMode } = useStore();
  useGlobalImageUpload(); // 활성화 (전역 복붙 리스너 등)

  useEffect(() => {
    const hasKey = !!import.meta.env.VITE_OPENAI_API_KEY;
    setDemoMode(!hasKey);
  }, [setDemoMode]);

  return (
    <>
      <Toaster position="top-center" />
      <DashboardLayout />
    </>
  );
}

export default App;
