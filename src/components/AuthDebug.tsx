import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AuthDebug = () => {
  const [email, setEmail] = useState('user' + Math.floor(Math.random() * 1000) + '@test.com');
  const [password, setPassword] = useState('password123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testSignUp = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('=== TESTING SIGNUP ===');
      console.log('Email:', email);
      console.log('Password length:', password.length);
      
      // Verificar configuración de Supabase primero
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            full_name: `Test User ${email.split('@')[0]}`
          }
        }
      });
      
      console.log('=== SIGNUP RESPONSE ===');
      console.log('Data:', data);
      console.log('Error:', error);
      
      if (error) {
        console.error('SignUp error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
      }
      
      setResult({
        success: !error,
        data: data,
        error: error ? {
          message: error.message,
          status: error.status,
          name: error.name
        } : null,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        let errorDescription = error.message;
        
        // Mensajes específicos para errores comunes
        if (error.message.includes('invalid email')) {
          errorDescription = 'El formato del email no es válido. Prueba con un email real como user@gmail.com';
        } else if (error.status === 400) {
          errorDescription = 'Error 400: Verificar configuración de autenticación en Supabase';
        } else if (error.status === 500) {
          errorDescription = 'Error 500: Problema interno del servidor. Verificar políticas RLS en Supabase';
        } else if (error.message.includes('User already registered')) {
          errorDescription = 'El usuario ya existe. Prueba con otro email';
        }
        
        toast({
          title: 'Error en signup',
          description: errorDescription,
          variant: 'destructive'
        });
      } else {
        let successMessage = 'Signup exitoso';
        if (data.user && !data.session) {
          successMessage = 'Usuario creado. Revisa tu email para confirmar la cuenta';
        } else if (data.user && data.session) {
          successMessage = 'Usuario creado e iniciado sesión automáticamente';
        }
        
        toast({
          title: 'Signup exitoso',
          description: successMessage
        });
      }
      
    } catch (err) {
      console.error('=== SIGNUP CATCH ERROR ===', err);
      setResult({
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    
    try {
      console.log('=== TESTING CONNECTION ===');
      const { data, error } = await supabase.auth.getSession();
      
      console.log('Session data:', data);
      console.log('Session error:', error);
      
      toast({
        title: 'Test de conexión',
        description: error ? `Error: ${error.message}` : 'Conexión exitosa'
      });
      
    } catch (err) {
      console.error('Connection test error:', err);
      toast({
        title: 'Error de conexión',
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Debug de Autenticación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="debug-email">Email:</Label>
          <Input
            id="debug-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="debug-password">Password:</Label>
          <Input
            id="debug-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
          />
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={testConnection}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test Conexión
          </Button>
          
          <Button 
            onClick={() => setEmail('user' + Math.floor(Math.random() * 1000) + '@gmail.com')}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Generar Email Random
          </Button>
          
          <Button 
            onClick={testSignUp}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Probando...' : 'Test SignUp'}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
