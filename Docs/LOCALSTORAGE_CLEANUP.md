# 🧹 Limpieza de localStorage

## Resumen

Después de migrar las funcionalidades de "Me gusta" y playlists a Supabase, es necesario limpiar el localStorage para eliminar datos duplicados y optimizar el rendimiento.

## Datos Migrados

Los siguientes datos han sido migrados de localStorage a Supabase:

- **`sf_liked_songs`** → Tabla `user_favorites`
- **`sf_playlists`** → Tabla `user_playlists`

## Datos que se mantienen en localStorage

- **`sf_recently_played`** → Canciones reproducidas recientemente (se mantiene por velocidad)
- **`sf_recent_searches`** → Búsquedas recientes (se mantiene por velocidad)
- **`sf_queue_v1_[userId]`** → Cola de reproducción específica por usuario
- **`sf_player_state_v1_[userId]`** → Estado del reproductor específico por usuario (índice actual, modo shuffle, autoPlay, etc.)

## Métodos de Limpieza

### 1. Automático (Recomendado)

Los hooks `useFavorites` y `usePlaylists` ahora limpian automáticamente localStorage después de migrar datos exitosamente.

### 2. Manual desde la UI

1. Ve a la página de **Perfil** (`/profile`)
2. Busca la sección "🧹 Limpieza de localStorage" (solo visible en desarrollo)
3. Haz clic en "🧹 Limpiar" para eliminar datos migrados

### 3. Script de Consola

Ejecuta el script `cleanup-localstorage.js` en la consola del navegador:

```javascript
// Copia y pega el contenido de cleanup-localstorage.js en la consola
```

### 4. Función de Utilidad

```javascript
import { cleanupLocalStorage, checkLocalStorageData } from '@/lib/utils';

// Verificar datos pendientes
const pendingData = checkLocalStorageData();

// Limpiar localStorage
cleanupLocalStorage();
```

### 5. Limpieza por Usuario

```javascript
// Limpiar datos de un usuario específico
QueueStorage.clearUserData(userId);

// Limpiar datos de usuario anónimo
QueueStorage.clearAnonymousData();

// Obtener todas las claves de cola para debugging
const queueKeys = QueueStorage.getAllQueueKeys();

// Obtener todas las claves de estado para debugging
const stateKeys = QueueStorage.getAllStateKeys();
```

### 6. Script de Consola Avanzado

Ejecuta el script `cleanup-user-data.js` en la consola del navegador:

```javascript
// Copia y pega el contenido de cleanup-user-data.js en la consola
// Luego usa las funciones disponibles:
clearUserData("USER_ID");        // Limpiar usuario específico
clearAnonymousData();            // Limpiar usuario anónimo
clearAllUserData();              // Limpiar todos los usuarios
```

## Verificación

Para verificar que la limpieza fue exitosa:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña **Application** → **Local Storage**
3. Verifica que las claves `sf_liked_songs` y `sf_playlists` no existan
4. Las claves que deben permanecer son:
   - `sf_recently_played`
   - `sf_recent_searches`
   - `sf_queue_v1_[userId]` (específica por usuario)
   - `sf_player_state_v1_[userId]` (específica por usuario)

## Nuevas Funcionalidades

### ✅ **Reproducción Automática Controlada**
- Botón ⚡ en el reproductor para activar/desactivar reproducción automática
- Configuración persistente por usuario
- Por defecto deshabilitada para evitar reproducción no deseada

### ✅ **Cola de Reproducción por Usuario**
- Cada usuario tiene su propia cola de reproducción
- No se comparten datos entre diferentes cuentas
- Limpieza automática al cerrar sesión

### ✅ **Estado del Reproductor por Usuario**
- Configuraciones específicas por usuario (repeat, shuffle, autoPlay)
- Persistencia independiente para cada cuenta
- Migración automática de datos existentes

## Beneficios de la Limpieza

- ✅ **Mejor rendimiento**: Menos datos en localStorage
- ✅ **Consistencia**: Datos centralizados en Supabase
- ✅ **Sincronización**: Datos disponibles en todos los dispositivos
- ✅ **Seguridad**: Datos protegidos por autenticación

## Notas Importantes

- La limpieza solo elimina datos que ya han sido migrados exitosamente
- Los datos de Supabase tienen prioridad sobre localStorage
- La limpieza es segura y no afecta la funcionalidad de la app
- El componente de limpieza solo está disponible en modo desarrollo

## Troubleshooting

Si encuentras problemas:

1. Verifica que la migración a Supabase fue exitosa
2. Revisa la consola para mensajes de error
3. Usa la función `checkLocalStorageData()` para diagnosticar
4. Si es necesario, puedes restaurar datos desde Supabase 