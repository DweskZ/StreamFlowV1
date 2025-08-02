import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cleanupLocalStorage, checkLocalStorageData } from '@/lib/utils';

export const LocalStorageCleanup: React.FC = () => {
  const [localStorageData, setLocalStorageData] = useState<string[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    const data = checkLocalStorageData();
    setLocalStorageData(data);
  }, []);

  const handleCleanup = () => {
    setIsCleaning(true);
    cleanupLocalStorage();
    
    // Actualizar la lista después de la limpieza
    setTimeout(() => {
      const data = checkLocalStorageData();
      setLocalStorageData(data);
      setIsCleaning(false);
    }, 1000);
  };

  const handleRefresh = () => {
    const data = checkLocalStorageData();
    setLocalStorageData(data);
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // No mostrar en producción
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧹 Limpieza de localStorage
          <Badge variant="secondary">Dev Only</Badge>
        </CardTitle>
        <CardDescription>
          Herramienta para limpiar datos migrados a Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Datos encontrados:</h4>
          {localStorageData.length > 0 ? (
            <ul className="space-y-1">
              {localStorageData.map((key) => (
                <li key={key} className="text-sm text-muted-foreground">
                  • {key}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-600">✅ No hay datos pendientes</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
          >
            🔄 Actualizar
          </Button>
          
          {localStorageData.length > 0 && (
            <Button 
              onClick={handleCleanup} 
              variant="destructive" 
              size="sm"
              disabled={isCleaning}
            >
              {isCleaning ? 'Limpiando...' : '🧹 Limpiar'}
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Esta herramienta solo está disponible en desarrollo.</p>
          <p>Limpia datos que ya han sido migrados a Supabase.</p>
        </div>
      </CardContent>
    </Card>
  );
}; 