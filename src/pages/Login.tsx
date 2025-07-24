import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { signIn, signUp, loading, user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (user) {
    navigate('/');
  }

  const onSubmitSignIn = async (data: FormData) => {
    await signIn(data.email, data.password);
    navigate('/');
  };

  const onSubmitSignUp = async (data: FormData) => {
    await signUp(data.email, data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Card className="w-96 bg-card border-border">
        <CardHeader>
          <CardTitle>Login / Registro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input placeholder="Email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Input type="password" placeholder="Contraseña" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="flex justify-between">
            <Button onClick={handleSubmit(onSubmitSignIn)} disabled={loading}>
              Ingresar
            </Button>
            <Button variant="secondary" onClick={handleSubmit(onSubmitSignUp)} disabled={loading}>
              Registrarse
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
