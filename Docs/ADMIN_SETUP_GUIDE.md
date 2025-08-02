# 🛡️ Guía de Configuración del Dashboard de Administración

## 📋 Resumen

Este documento te guía para configurar el sistema de roles de administrador en StreamFlow. El dashboard de administración incluye:

- **Vista General**: Estadísticas de la aplicación
- **Gestión de Usuarios**: Lista y gestión de usuarios
- **Gestión de Contenido**: Moderación de playlists
- **Análisis**: Reportes y métricas detalladas

## 🚀 Pasos para Configurar

### 1. Ejecutar el Script de Configuración

```powershell
# Ejecuta el script de configuración
.\setup-admin.ps1
```

### 2. Configurar la Base de Datos

Ve a tu dashboard de Supabase y ejecuta el siguiente SQL:

```sql
-- Agregar columna is_admin a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Crear función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear políticas RLS para el dashboard de admin
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all playlists" ON user_playlists
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all listening history" ON user_listening_history
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all favorites" ON user_favorites
FOR SELECT USING (is_admin(auth.uid()));
```

### 3. Crear un Usuario Administrador

#### Opción A: Usando el Dashboard de Supabase

1. Ve a **Authentication > Users**
2. Haz clic en **"Add User"**
3. Ingresa el email y contraseña del administrador
4. Copia el **User ID** del usuario creado

#### Opción B: Usando SQL Directo

```sql
-- Reemplaza con tu información
UPDATE profiles 
SET is_admin = TRUE, 
    full_name = 'Tu Nombre',
    updated_at = NOW()
WHERE email = 'tu-email@ejemplo.com';
```

### 4. Verificar la Configuración

```sql
-- Verificar que el usuario sea administrador
SELECT email, full_name, is_admin FROM profiles WHERE email = 'tu-email@ejemplo.com';
```

## 🔐 Acceso al Dashboard

### Para Administradores

1. Inicia sesión con tu cuenta de administrador
2. El enlace "Admin" aparecerá en el sidebar
3. Haz clic en "Admin" o ve a `http://localhost:8080/admin`

### Para Usuarios Normales

- No verán el enlace "Admin" en el sidebar
- Si intentan acceder a `/admin`, verán una página de "Acceso Denegado"

## 🎯 Funcionalidades del Dashboard

### Vista General
- Usuarios totales y activos
- Reproducciones totales
- Playlists creadas
- Canciones favoritas
- Usuarios premium
- Tiempo promedio de sesión

### Gestión de Usuarios
- Lista completa de usuarios
- Estadísticas por usuario
- Filtros por estado de suscripción
- Búsqueda de usuarios

### Gestión de Contenido
- Lista de playlists
- Estado de contenido (activo/marcado/removido)
- Acciones de moderación
- Contenido popular

### Análisis
- Gráficos de actividad diaria
- Crecimiento de usuarios
- Artistas más escuchados
- Géneros más populares
- Insights y recomendaciones

## 🔧 Personalización

### Agregar Nuevos Administradores

```sql
-- Hacer administrador a un usuario existente
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'nuevo-admin@ejemplo.com';
```

### Remover Privilegios de Administrador

```sql
-- Remover privilegios de administrador
UPDATE profiles 
SET is_admin = FALSE 
WHERE email = 'usuario@ejemplo.com';
```

### Ver Todos los Administradores

```sql
-- Listar todos los administradores
SELECT email, full_name, created_at 
FROM profiles 
WHERE is_admin = TRUE;
```

## 🚨 Seguridad

### Políticas RLS Implementadas

- Solo los administradores pueden ver todas las estadísticas
- Los usuarios normales solo ven sus propios datos
- Verificación de permisos en cada consulta

### Recomendaciones

1. **Usa contraseñas fuertes** para las cuentas de administrador
2. **Revisa regularmente** la lista de administradores
3. **Monitorea el acceso** al dashboard
4. **Usa autenticación de dos factores** si es posible

## 🐛 Solución de Problemas

### El enlace "Admin" no aparece

1. Verifica que el usuario tenga `is_admin = TRUE`
2. Recarga la página
3. Verifica que estés logueado con la cuenta correcta

### Error "Access denied"

1. Verifica que el usuario sea administrador en la base de datos
2. Revisa las políticas RLS
3. Verifica que la función `is_admin()` esté creada

### No se cargan las estadísticas

1. Verifica las políticas RLS
2. Asegúrate de que haya datos en las tablas
3. Revisa la consola del navegador para errores

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de Supabase
2. Verifica que todas las políticas RLS estén activas
3. Confirma que la función `is_admin()` esté creada correctamente

---

**¡Listo!** Tu dashboard de administración está configurado y listo para usar. 🎉 