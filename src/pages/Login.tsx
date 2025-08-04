import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Music, Sparkles, Headphones, Disc3, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrength } from '@/components/ui/password-strength';

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un email válido')
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function Login() {
  const { signIn, signUp, loading, user, resetPassword, checkIsAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({ 
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm<RegisterFormData>({ 
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const watchPassword = registerForm.watch('password');

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({ 
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  // Verificar si el usuario ya está logueado y redirigir apropiadamente
  if (user) {
    // Verificar si es admin
    const checkAdminAndRedirect = async () => {
      try {
        const isAdmin = await checkIsAdmin(user.id);
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/app');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/app'); // Fallback a app normal
      }
    };
    
    checkAdminAndRedirect();
    return null;
  }

  const onSubmitLogin = async (data: LoginFormData) => {
    try {
      console.log('🔐 Intentando login con:', data.email);
      const result = await signIn(data.email, data.password);
      console.log('✅ Login exitoso, resultado:', result);
      
      // Verificar si es admin y redirigir apropiadamente
      if (result?.isAdmin) {
        console.log('🎯 Usuario es admin, redirigiendo a /admin');
        navigate('/admin');
      } else {
        console.log('🎯 Usuario normal, redirigiendo a /app');
        navigate('/app');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      // No necesitamos mostrar toast aquí porque ya se maneja en AuthContext
    }
  };

  const onSubmitRegister = async (data: RegisterFormData) => {
    console.log('Register form submitted with data:', { 
      name: data.name, 
      email: data.email, 
      passwordLength: data.password.length 
    });
    
    try {
      await signUp(data.email, data.password);
      console.log('SignUp call completed successfully');
      
      toast({
        title: "¡Registro exitoso!",
        description: "Revisa tu correo electrónico para confirmar tu cuenta",
      });
      
      // Reset form
      registerForm.reset();
      setActiveTab('login');
    } catch (error) {
      console.error('Register error in onSubmitRegister:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante el registro';
      
      toast({
        title: "Error en el registro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const onSubmitForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };



  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-4">
          <Card className="backdrop-blur-xl bg-black/40 border-purple-500/30 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-glow-purple">
                <Music className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">¿Olvidaste tu contraseña?</CardTitle>
              <CardDescription className="text-gray-300">
                Te enviaremos un enlace para restablecer tu contraseña
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={forgotPasswordForm.handleSubmit(onSubmitForgotPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple transition-all"
                      {...forgotPasswordForm.register('email')}
                    />
                  </div>
                  {forgotPasswordForm.formState.errors.email && (
                    <p className="text-sm text-red-400">{forgotPasswordForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 shadow-glow-purple transition-all duration-300 hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </form>

              <Button
                variant="ghost"
                className="w-full text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-300"
                onClick={() => setShowForgotPassword(false)}
              >
                Volver al inicio de sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500" />
        
        {/* Floating Music Icons */}
        <div className="absolute top-20 left-20 animate-bounce delay-1000">
          <Headphones className="w-8 h-8 text-purple-400/30" />
        </div>
        <div className="absolute top-32 right-32 animate-bounce delay-2000">
          <Disc3 className="w-6 h-6 text-pink-400/30" />
        </div>
        <div className="absolute bottom-32 left-32 animate-bounce delay-3000">
          <Radio className="w-7 h-7 text-cyan-400/30" />
        </div>
        <div className="absolute bottom-20 right-20 animate-bounce delay-1500">
          <Music className="w-5 h-5 text-purple-400/30" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 text-white hover:text-purple-200 transition-all duration-300 mb-6 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-glow-purple group-hover:shadow-glow-pink transition-all duration-300">
                <Music className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              StreamFlow
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3">¡Bienvenido!</h1>
          <p className="text-gray-300 text-lg">Descubre música sin límites</p>
        </div>

        <Card className="backdrop-blur-xl bg-black/40 border-purple-500/30 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-glow-purple mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/40 border-purple-500/30 mb-6">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-glow-purple transition-all duration-300"
                >
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-glow-purple transition-all duration-300"
                >
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-200">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple transition-all"
                        {...loginForm.register('email')}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-400">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-200">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple transition-all"
                        {...loginForm.register('password')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-400">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-purple-300 hover:text-purple-100 p-0 h-auto transition-colors"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 shadow-glow-purple transition-all duration-300 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>


              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm font-medium text-gray-200">
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Tu nombre"
                        className="pl-10 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple transition-all"
                        {...registerForm.register('name')}
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-200">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple transition-all"
                        {...registerForm.register('email')}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-200">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple transition-all"
                        {...registerForm.register('password')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.password.message}</p>
                    )}
                    <PasswordStrength password={watchPassword || ''} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-200">
                      Confirmar contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple transition-all"
                        {...registerForm.register('confirmPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-400">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 shadow-glow-purple transition-all duration-300 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>


              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8">
          <p className="text-gray-300 text-sm">
            ¿No tienes cuenta? Regístrate gratis y{' '}
            <span className="text-purple-300 font-semibold hover:text-purple-200 transition-colors cursor-pointer">
              descubre música increíble
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
