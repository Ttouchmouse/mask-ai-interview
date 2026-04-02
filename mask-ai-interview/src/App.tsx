import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './components/layout/DashboardLayout.tsx';
import { useGlobalImageUpload } from './hooks/useGlobalImageUpload.ts';

function App() {
  useGlobalImageUpload(); // 활성화 (전역 복붙 리스너 등)

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1C2030',
            color: '#FFFFFF',
            borderRadius: '100px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF5350',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <DashboardLayout />
    </>
  );
}

export default App;
