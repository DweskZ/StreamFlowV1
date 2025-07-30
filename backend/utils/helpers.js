/**
 * Utilidades para validación de datos y transformaciones
 */

/**
 * Valida si un ID es válido (número positivo)
 * @param {string|number} id - ID a validar
 * @returns {boolean} - true si es válido
 */
export const isValidId = (id) => {
  const numId = parseInt(id);
  return !isNaN(numId) && numId > 0;
};

/**
 * Sanitiza un query string para búsqueda
 * @param {string} query - Query a sanitizar
 * @returns {string} - Query sanitizado
 */
export const sanitizeQuery = (query) => {
  if (!query || typeof query !== 'string') return '';
  
  // Remover caracteres especiales peligrosos pero mantener espacios y acentos
  return query
    .trim()
    .replace(/[<>\"']/g, '') // Remover caracteres HTML/JS peligrosos
    .substring(0, 100); // Limitar longitud
};

/**
 * Valida y normaliza el parámetro limit
 * @param {string|number} limit - Límite a validar
 * @param {number} defaultValue - Valor por defecto
 * @param {number} maxValue - Valor máximo permitido
 * @returns {number} - Límite validado
 */
export const validateLimit = (limit, defaultValue = 10, maxValue = 25) => {
  const numLimit = parseInt(limit);
  
  if (isNaN(numLimit) || numLimit <= 0) {
    return defaultValue;
  }
  
  return Math.min(numLimit, maxValue);
};

/**
 * Formatea la duración de segundos a mm:ss
 * @param {number} seconds - Duración en segundos
 * @returns {string} - Duración formateada
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Crea una respuesta estándar para el frontend
 * @param {Array} results - Array de resultados
 * @param {number} total - Total de resultados disponibles
 * @param {string} status - Estado de la respuesta
 * @returns {Object} - Respuesta formateada
 */
export const createStandardResponse = (results = [], total = null, status = "success") => {
  return {
    headers: {
      status,
      code: status === "success" ? 200 : 500,
      error_message: status === "success" ? "" : "Error en la solicitud",
      warnings: "",
      results_fullcount: total !== null ? total : results.length
    },
    results
  };
};

/**
 * Crea una respuesta de error estándar
 * @param {string} message - Mensaje de error
 * @param {number} code - Código de error HTTP
 * @returns {Object} - Respuesta de error formateada
 */
export const createErrorResponse = (message, code = 500) => {
  return {
    error: "Error en la solicitud",
    message,
    headers: {
      status: "error",
      code,
      error_message: message,
      warnings: "",
      results_fullcount: 0
    },
    results: []
  };
};

/**
 * Maneja errores de Axios y devuelve información útil
 * @param {Error} error - Error de Axios
 * @returns {Object} - Información del error procesada
 */
export const handleAxiosError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    return {
      status: error.response.status,
      message: error.response.data?.error?.message || error.response.statusText || 'Error del servidor',
      type: 'response_error'
    };
  } else if (error.request) {
    // Error de red
    return {
      status: 503,
      message: 'Error de conexión con la API de Deezer',
      type: 'network_error'
    };
  } else {
    // Error de configuración
    return {
      status: 500,
      message: error.message || 'Error interno del servidor',
      type: 'config_error'
    };
  }
};

/**
 * Log con formato para el servidor
 * @param {string} type - Tipo de log (info, error, warning)
 * @param {string} message - Mensaje
 * @param {Object} data - Datos adicionales
 */
export const serverLog = (type, message, data = null) => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: '💡',
    error: '❌',
    warning: '⚠️',
    success: '✅',
    request: '📡'
  }[type] || '📝';
  
  console.log(`${emoji} [${timestamp}] ${message}`);
  
  if (data) {
    console.log('   📊 Datos:', data);
  }
};

/**
 * Middleware para logging de requests
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode >= 400 ? 'error' : 'success';
    
    serverLog('request', 
      `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
      {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        query: req.query,
        body: req.method === 'POST' ? req.body : undefined
      }
    );
  });
  
  next();
};
