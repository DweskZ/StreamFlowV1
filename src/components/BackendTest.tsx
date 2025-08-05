// components/BackendTest.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const BackendTest = () => {
  const [testResults, setTestResults] = useState<{
    backend: 'pending' | 'success' | 'error';
    search: 'pending' | 'success' | 'error';
    message: string;
  }>({
    backend: 'pending',
    search: 'pending',
    message: 'No probado'
  });

  const testBackend = async () => {
    setTestResults(prev => ({ ...prev, backend: 'pending', message: 'Probando backend...' }));
    
    try {
      console.log('🧪 Probando conectividad con backend...');
      const response = await axios.get(`${BACKEND_URL}/api/test`, { timeout: 5000 });
      console.log('✅ Respuesta del backend:', response.data);
      
      setTestResults(prev => ({
        ...prev,
        backend: 'success',
        message: 'Backend conectado correctamente'
      }));
    } catch (error: any) {
      console.error('❌ Error conectando con backend:', error);
      setTestResults(prev => ({
        ...prev,
        backend: 'error',
        message: `Error: ${error.message}`
      }));
    }
  };

  const testSearch = async () => {
    setTestResults(prev => ({ ...prev, search: 'pending', message: 'Probando búsqueda...' }));
    
    try {
      console.log('🔍 Probando búsqueda de canciones...');
      const response = await axios.get(`${BACKEND_URL}/api/search?q=test`, { timeout: 10000 });
      console.log('✅ Respuesta de búsqueda:', response.data);
      
      if (response.data.headers?.status === 'success') {
        setTestResults(prev => ({
          ...prev,
          search: 'success',
          message: `Búsqueda exitosa: ${response.data.results?.length || 0} resultados`
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          search: 'error',
          message: 'Búsqueda falló: respuesta no válida'
        }));
      }
    } catch (error: any) {
      console.error('❌ Error en búsqueda:', error);
      setTestResults(prev => ({
        ...prev,
        search: 'error',
        message: `Error en búsqueda: ${error.message}`
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-400 animate-pulse" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TestTube className="h-5 w-5 text-purple-400" />
          Prueba de Conectividad Backend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          URL del backend: {BACKEND_URL}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.backend)}
              <span className="text-white">Conectividad Backend</span>
            </div>
            <Button
              size="sm"
              onClick={testBackend}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <TestTube className="h-3 w-3 mr-1" />
              Probar
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.search)}
              <span className="text-white">Búsqueda de Canciones</span>
            </div>
            <Button
              size="sm"
              onClick={testSearch}
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <TestTube className="h-3 w-3 mr-1" />
              Probar
            </Button>
          </div>
        </div>
        
        <div className={`text-xs px-3 py-2 rounded border ${getStatusColor(testResults.backend === 'error' || testResults.search === 'error' ? 'error' : testResults.backend === 'success' && testResults.search === 'success' ? 'success' : 'pending')}`}>
          {testResults.message}
        </div>
      </CardContent>
    </Card>
  );
}; 