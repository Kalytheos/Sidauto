// Configuración de Supabase
const SUPABASE_URL = 'https://rxlfqzxcdloabakrqoed.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bGZxenhjZGxvYWJha3Jxb2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzY4NTksImV4cCI6MjA3ODQ1Mjg1OX0.DLZc7rCSZCyx6UKfpOg3Kwm7BPsQ2ZJ2ZeWvi1eTRso';

// Inicializar cliente de Supabase
let supabase;

try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Cliente Supabase inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar cliente Supabase:', error);
}

// Variables globales
let allBooks = [];
let filteredBooks = [];
let suggestionsVisible = false;

// Variables de paginación
let currentPage = 1;
let itemsPerPage = 20;
let totalPages = 1;

// === SISTEMA DE NOTIFICACIONES ===

// Crear contenedor de notificaciones si no existe
function createNotificationContainer() {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  return container;
}

// Mostrar notificación
function showNotification(type, title, message, duration = 5000) {
  const container = createNotificationContainer();
  
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Generar ID único
  const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  notification.id = notificationId;
  
  // Iconos según el tipo
  const icons = {
    'success': '✅',
    'error': '❌',
    'info': 'ℹ️',
    'warning': '⚠️',
    'admin-success': '🎯',
    'admin-error': '🔒'
  };
  
  // Crear contenido
  notification.innerHTML = `
    <div class="notification-icon">${icons[type] || 'ℹ️'}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="closeNotification('${notificationId}')">&times;</button>
    ${duration > 0 ? '<div class="notification-progress"></div>' : ''}
  `;
  
  // Agregar al contenedor
  container.appendChild(notification);
  
  // Log de la notificación
  console.log(`📢 Notificación [${type.toUpperCase()}]: ${title} - ${message}`);
  
  // Auto-cerrar si tiene duración
  if (duration > 0) {
    setTimeout(() => {
      closeNotification(notificationId);
    }, duration);
  }
  
  return notificationId;
}

// Cerrar notificación específica
function closeNotification(notificationId) {
  const notification = document.getElementById(notificationId);
  if (notification) {
    notification.classList.add('removing');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// Cerrar todas las notificaciones
function closeAllNotifications() {
  const container = document.getElementById('notification-container');
  if (container) {
    const notifications = container.querySelectorAll('.notification');
    notifications.forEach(notification => {
      notification.classList.add('removing');
    });
    
    setTimeout(() => {
      container.innerHTML = '';
    }, 300);
  }
}

// Notificaciones específicas para admin
function showAdminSuccessNotification(message) {
  return showNotification('admin-success', '¡Acceso Autorizado!', message, 3000);
}

function showAdminErrorNotification(message) {
  return showNotification('admin-error', 'Acceso Denegado', message, 4000);
}

// === FIN SISTEMA DE NOTIFICACIONES ===

// === SISTEMA DE MENSAJES DEL MODAL ADMIN ===

// Mostrar mensaje de estado en el modal de admin
function showAdminModalStatus(type, icon, message) {
  const statusElement = document.getElementById('adminLoginStatus');
  if (!statusElement) return;
  
  const iconElement = statusElement.querySelector('.status-icon');
  const messageElement = statusElement.querySelector('.status-message');
  
  if (iconElement && messageElement) {
    // Limpiar clases anteriores
    statusElement.className = 'admin-login-status';
    
    // Agregar nueva clase de tipo
    statusElement.classList.add(type);
    
    // Establecer contenido
    iconElement.textContent = icon;
    messageElement.textContent = message;
    
    // Mostrar elemento
    statusElement.style.display = 'block';
    
    console.log(`📱 Modal Admin Status [${type.toUpperCase()}]: ${message}`);
  }
}

// Ocultar mensaje de estado del modal
function hideAdminModalStatus() {
  const statusElement = document.getElementById('adminLoginStatus');
  if (statusElement) {
    statusElement.style.display = 'none';
  }
}

// Funciones específicas para diferentes tipos de estado
function showAdminLoginLoading() {
  showAdminModalStatus('loading', '⏳', 'Verificando credenciales...');
}

function showAdminLoginSuccess() {
  showAdminModalStatus('success', '✅', '¡Login exitoso! Redirigiendo...');
}

function showAdminLoginError(message) {
  showAdminModalStatus('error', '❌', message || 'Credenciales incorrectas');
}

function showAdminLoginWarning(message) {
  showAdminModalStatus('warning', '⚠️', message || 'Por favor verifica los datos');
}

// === FIN SISTEMA DE MENSAJES DEL MODAL ADMIN ===

// Cargar libros desde Supabase
async function loadBooksFromSupabase() {
  try {
    console.log('🚀 Iniciando conexión a Supabase...');
    console.log('🔗 URL:', SUPABASE_URL);
    console.log('🔑 API Key configurada:', SUPABASE_ANON_KEY ? 'Sí' : 'No');
    
    // Verificar cliente de Supabase
    if (!supabase) {
      throw new Error('Cliente de Supabase no inicializado');
    }
    
    console.log('📡 Realizando consulta a tabla "libros"...');
    
    const { data: books, error } = await supabase
      .from('libros')
      .select('*')
      .order('TITULO', { ascending: true });
    
    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }
    
    if (!books || books.length === 0) {
      console.warn('⚠️ No se encontraron libros en la base de datos');
      throw new Error('No hay libros en la base de datos');
    }
    
    console.log(`✅ Cargados ${books.length} libros desde Supabase`);
    
    // Debug: Mostrar estructura del primer libro de Supabase
    if (books.length > 0) {
      console.log('🔍 Estructura del primer libro de Supabase:', Object.keys(books[0]));
      console.log('🔍 Datos del primer libro:', books[0]);
    }
    
    // Transformar datos de Supabase al formato esperado
    allBooks = books.map(book => ({
      id: `LIB${String(book.No || book.id).padStart(4, '0')}`,
      titulo: book.TITULO || 'Sin título',
      autor: book.AUTOR || 'Autor desconocido',
      isbn: book.ISBN || '',
      editorial: book.EDITORIAL || 'Editorial desconocida',
      año: parseInt(book['AÑO DE PUBLICACIÓN']) || 0,
      genero: book.MATERIA || 'Sin clasificar',
      GENERO: book.MATERIA || 'Sin clasificar', // Para compatibilidad con estadísticas
      categoria: book.MATERIA || 'General',
      ubicacion: book['UBICACIÓN '] || 'No especificada',
      codigo: book['CÓDIGO'] || book.No || book.id,
      disponibilidad: book.disponibilidad || 'DISPONIBLE',
      estado: book.disponibilidad?.toLowerCase() || 'disponible',
      ESTADO: book.disponibilidad?.toLowerCase() || 'disponible', // Para compatibilidad con estadísticas
      descripcion: `Libro de ${book.MATERIA || 'literatura'} ${book['AÑO DE PUBLICACIÓN'] ? `publicado en ${book['AÑO DE PUBLICACIÓN']}` : 'sin fecha'}.`,
      fechaAdquisicion: book['FECHA DE ADQUISICIÓN '] || '',
      edicion: book['NUMERO EDICION'] || '1era',
      cantidad: parseInt(book.CANTIDAD) || 1,
      supabaseId: book.No || book.id, // Mantener ID original de Supabase
      tags: [
        book.MATERIA?.toLowerCase(),
        book.AUTOR?.split(' ')[0]?.toLowerCase(),
        book['AÑO DE PUBLICACIÓN']?.toString()
      ].filter(Boolean)
    }));
    
    console.log(`📚 Transformados ${allBooks.length} libros`);
    
    // Mostrar estado inicial
    displayBooks([]);
    updateSearchResults(0, 'welcome');
    updateBookStatistics();
    populateFiltersFromBooks();
    
    console.log('📚 Primeros 5 libros:', allBooks.slice(0, 5).map(book => book.titulo));
    
  } catch (error) {
    console.error('❌ Error al cargar desde Supabase:', error);
    console.error('Detalles del error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    loadFallbackBooks();
  }
}

// Función de prueba de conectividad con Supabase
async function testSupabaseConnection() {
  try {
    console.log('🧪 Probando conexión con Supabase...');
    
    // Prueba simple: obtener 1 registro
    const { data, error } = await supabase
      .from('libros')
      .select('No, TITULO')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Conexión exitosa a Supabase');
    console.log('📄 Registro de prueba:', data[0]);
    return true;
    
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:', error);
    
    // Diagnósticos adicionales
    if (error.message?.includes('cors')) {
      console.error('🚨 Error CORS detectado - Verificar configuración de dominio en Supabase');
    }
    if (error.message?.includes('auth')) {
      console.error('🔐 Error de autenticación - Verificar API Key');
    }
    if (error.message?.includes('network')) {
      console.error('🌐 Error de red - Verificar conexión a internet');
    }
    
    return false;
  }
}

// Datos de fallback (simplificados para debug)
// Datos de fallback (mensaje de error si Supabase no carga)
function loadFallbackBooks() {
  console.log('🔄 Usando datos de fallback - Error de conexión a Supabase');
  
  allBooks = [
    {
      id: 'FALL001',
      titulo: 'Error de Conexión - Supabase no disponible',
      autor: 'Sistema SIDAUTO',
      isbn: '',
      editorial: 'Sistema',
      año: 2025,
      genero: 'Sistema',
      categoria: 'Error',
      ubicacion: 'N/A',
      codigo: 'ERROR001',
      estado: 'error',
      descripcion: 'No se pudo conectar a la base de datos de Supabase. Verifica tu conexión a internet o contacta al administrador.',
      fechaAdquisicion: '',
      edicion: '1era',
      cantidad: '0',
      tags: ['error', 'sistema', 'supabase']
    }
  ];
  
  filteredBooks = [];
  displayBooks([]);
  updateBookStatistics();
  updateSearchResults(0, 'error');
}

// Función para actualizar estado del libro en Supabase
async function updateBookStatus(bookId, newStatus) {
  try {
    const book = allBooks.find(book => book.id === bookId);
    if (!book || !book.supabaseId) {
      throw new Error('Libro no encontrado');
    }
    
    const { data, error } = await supabase
      .from('libros')
      .update({ 
        estado: newStatus
      })
      .eq('No', book.supabaseId);
    
    if (error) throw error;
    
    // Actualizar datos locales
    book.estado = newStatus;
    
    console.log(`✅ Estado actualizado: ${bookId} -> ${newStatus}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    return false;
  }
}

// Función para agregar nuevo libro a Supabase
async function addNewBook(bookData) {
  try {
    const { data, error } = await supabase
      .from('libros')
      .insert([{
        TITULO: bookData.titulo,
        AUTOR: bookData.autor,
        ISBN: bookData.isbn,
        EDITORIAL: bookData.editorial,
        'AÑO DE PUBLICACIÓN': bookData.año,
        MATERIA: bookData.genero,
        'UBICACIÓN ': bookData.ubicacion,
        'CÓDIGO': bookData.codigo,
        estado: 'disponible',
        CANTIDAD: 1
      }])
      .select();
    
    if (error) throw error;
    
    console.log('✅ Nuevo libro agregado:', data[0]);
    
    // Recargar libros para incluir el nuevo
    await loadBooksFromSupabase();
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al agregar libro:', error);
    return false;
  }
}

// Función para suscribirse a cambios en tiempo real (opcional)
function subscribeToBookChanges() {
  const subscription = supabase
    .channel('libros-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'libros' 
      }, 
      (payload) => {
        console.log('📡 Cambio detectado en tiempo real:', payload);
        
        // Recargar datos cuando hay cambios
        setTimeout(() => {
          loadBooksFromSupabase();
        }, 1000);
      }
    )
    .subscribe();
  
  console.log('📡 Suscrito a cambios en tiempo real');
  return subscription;
}

// Poblar selectores de filtros desde los libros cargados
function populateFiltersFromBooks() {
  const genreSelect = document.getElementById('genreFilter');
  const editorialSelect = document.getElementById('editorialFilter');
  const yearSelect = document.getElementById('yearFilter');
  
  if (!genreSelect || !editorialSelect || !yearSelect) {
    console.log('⚠️ Algunos selectores de filtros no encontrados');
    return;
  }
  
  // Limpiar opciones existentes (excepto la primera "Todos")
  [genreSelect, editorialSelect, yearSelect].forEach(select => {
    while (select.children.length > 1) {
      select.removeChild(select.lastChild);
    }
  });
  
  if (!allBooks || allBooks.length === 0) return;
  
  // Obtener valores únicos de los libros
  const generos = [...new Set(allBooks.map(libro => libro.genero).filter(Boolean))].sort();
  const editoriales = [...new Set(allBooks.map(libro => libro.editorial).filter(Boolean))].sort();
  const años = [...new Set(allBooks.map(libro => libro.año).filter(año => año && año > 0))].sort((a, b) => b - a);
  
  // Poblar géneros
  generos.forEach(genero => {
    const option = document.createElement('option');
    option.value = genero;
    option.textContent = genero;
    genreSelect.appendChild(option);
  });
  
  // Poblar editoriales
  editoriales.forEach(editorial => {
    const option = document.createElement('option');
    option.value = editorial;
    option.textContent = editorial;
    editorialSelect.appendChild(option);
  });
  
  // Poblar años
  años.forEach(año => {
    const option = document.createElement('option');
    option.value = año;
    option.textContent = año;
    yearSelect.appendChild(option);
  });
  
  console.log(`✅ Filtros poblados: ${generos.length} géneros, ${editoriales.length} editoriales, ${años.length} años`);
}

// Función para verificar si un valor está presente y válido
function isValidValue(value) {
  return value && 
         value !== 'N/D' && 
         value !== 'No especificado' && 
         value !== 'No especificada' && 
         value !== 'No tiene' &&
         value !== 'Sin clasificar' &&
         value !== 'Editorial desconocida' &&
         value !== 'Autor desconocido' &&
         value !== 'Sin título' &&
         value !== '' &&
         value !== null &&
         value !== undefined &&
         value.toString().trim() !== '';
}

// Función para crear detalles filtrados
function createFilteredDetails(libro) {
  const details = [];
  
  // Editorial
  if (isValidValue(libro.editorial)) {
    details.push(`
      <div class="detail-row">
        <span class="detail-label">📏 Editorial:</span>
        <span>${libro.editorial}</span>
      </div>
    `);
  }
  
  // Año
  if (isValidValue(libro.año) && libro.año > 0) {
    details.push(`
      <div class="detail-row">
        <span class="detail-label">📅 Año:</span>
        <span>${libro.año}</span>
      </div>
    `);
  }
  
  // Género/Materia
  if (isValidValue(libro.genero)) {
    details.push(`
      <div class="detail-row">
        <span class="detail-label">📂 Materia:</span>
        <span>${libro.genero}</span>
      </div>
    `);
  }
  
  // Ubicación
  if (isValidValue(libro.ubicacion)) {
    details.push(`
      <div class="detail-row">
        <span class="detail-label">📍 Ubicación:</span>
        <span>${libro.ubicacion}</span>
      </div>
    `);
  }
  
  // ISBN
  if (isValidValue(libro.isbn)) {
    details.push(`
      <div class="detail-row">
        <span class="detail-label">🔍 ISBN:</span>
        <span>${libro.isbn}</span>
      </div>
    `);
  }
  
  return details.join('');
}

// Crear tarjeta de libro actualizada para la nueva estructura
function createBookCard(libro) {
  const estadoClass = libro.estado || 'disponible';
  const estadoTexto = {
    'disponible': 'Disponible',
    'prestado': 'Prestado',
    'reservado': 'Reservado',
    'sistema': 'Sistema',
    'error': 'Error'
  }[estadoClass] || 'Disponible';
  
  // Crear icono basado en el género/materia
  const genreIcon = {
    'LITERATURA': '📚',
    'FICCIÓN': '📖',
    'HISTORIA': '🏛️',
    'CIENCIAS': '🔬',
    'ARTE': '🎨',
    'FILOSOFÍA': '💭',
    'DERECHO': '⚖️',
    'MEDICINA': '🏥',
    'MATEMÁTICAS': '➕',
    'INGENIERÍA': '⚙️',
    'ECONOMÍA': '💼',
    'PSICOLOGÍA': '🧠',
    'EDUCACIÓN': '🎓',
    'RELIGIÓN': '✝️',
    'DEPORTES': '⚽',
    'COCINA': '🍳',
    'VIAJES': '✈️',
    'BIOGRAFÍA': '👤',
    'AUTOAYUDA': '💪',
    'NOVELA': '📘',
    'CUENTO': '�',
    'POESÍA': '🎭',
    'ENSAYO': '📝',
    'TEATRO': '🎪'
  }[libro.genero?.toUpperCase()] || '📚';

  // Limpiar y formatear datos básicos
  const titulo = (libro.titulo || 'Sin título').replace(/\n/g, ' ').trim();
  const autor = isValidValue(libro.autor) ? libro.autor.replace(/\n/g, ' ').trim() : 'Autor desconocido';
  const codigo = (libro.codigo || libro.id || 'N/A').replace(/\n/g, ' ').trim();
  
  // Crear descripción inteligente
  let descripcion = '';
  if (isValidValue(libro.descripcion)) {
    descripcion = libro.descripcion;
  } else {
    const partes = [];
    if (isValidValue(libro.genero)) partes.push(`Libro de ${libro.genero.toLowerCase()}`);
    if (isValidValue(libro.editorial)) partes.push(`Editorial ${libro.editorial}`);
    descripcion = partes.length > 0 ? partes.join(' - ') : 'Libro disponible en nuestra biblioteca';
  }

  return `
    <div class="book-card" onclick="openBookDetails('${libro.id}')">
      <div class="book-header">
        <div class="book-icon">${genreIcon}</div>
        <div class="book-id">${codigo}</div>
      </div>
      
      <div class="book-info">
        <div class="book-content">
          <h3 class="book-title">${titulo}</h3>
          <p class="book-author">por ${autor}</p>
          <p class="book-description">${descripcion}</p>
        </div>
        
        <div class="book-footer">
          <div class="book-details">
            ${createFilteredDetails(libro)}
          </div>
          
          <div class="book-status-center">
            <div class="book-status ${estadoClass}">${estadoTexto}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Mostrar libros con paginación
function displayBooks(books) {
  const booksGrid = document.getElementById('booksGrid');
  const paginationContainer = document.getElementById('paginationContainer');
  
  if (!booksGrid) return;
  
  // Actualizar filteredBooks globalmente
  filteredBooks = books;
  
  if (books.length === 0) {
    // Ocultar paginación cuando no hay resultados
    if (paginationContainer) {
      paginationContainer.style.display = 'none';
    }
    
    // Verificar si es estado inicial o no hay resultados
    const searchInput = document.getElementById('searchInput');
    const quickSearchInput = document.getElementById('quickSearchInput');
    const hasSearch = (searchInput && searchInput.value.trim()) || 
                     (quickSearchInput && quickSearchInput.value.trim());
    
    if (!hasSearch) {
      // Estado inicial - mostrar mensaje de bienvenida
      booksGrid.innerHTML = `
        <div class="welcome-message">
          <div class="welcome-icon">📚</div>
          <h3>Bienvenido a SIDAUTO BIBLIOTECA</h3>
          <p>Utiliza la barra de búsqueda para encontrar libros en nuestra colección</p>
          <div class="search-suggestions">
            <p><strong>Puedes buscar por:</strong></p>
            <div class="suggestion-tags">
              <span class="suggestion-tag">Título</span>
              <span class="suggestion-tag">Autor</span>
              <span class="suggestion-tag">Género</span>
              <span class="suggestion-tag">Editorial</span>
            </div>
          </div>
        </div>
      `;
    } else {
      // No hay resultados de búsqueda
      booksGrid.innerHTML = `
        <div class="no-results">
          <h3>📚 No se encontraron libros</h3>
          <p>Intenta con otros términos de búsqueda</p>
        </div>
      `;
    }
    return;
  }
  
  // Calcular paginación
  totalPages = Math.ceil(books.length / itemsPerPage);
  
  // Ajustar página actual si está fuera de rango
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  if (currentPage < 1) {
    currentPage = 1;
  }
  
  // Calcular índices para la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, books.length);
  
  // Obtener libros para la página actual
  const booksForCurrentPage = books.slice(startIndex, endIndex);
  
  // Mostrar los libros
  const booksHTML = booksForCurrentPage.map(book => createBookCard(book)).join('');
  booksGrid.innerHTML = booksHTML;
  
  // Mostrar y actualizar controles de paginación
  updatePaginationControls();
  
  // Scroll suave hacia arriba cuando se cambia de página (solo si no es la primera carga)
  if (books.length > itemsPerPage && currentPage > 1) {
    const bibliotecaSection = document.getElementById('biblioteca');
    if (bibliotecaSection) {
      bibliotecaSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}

// Actualizar controles de paginación
function updatePaginationControls() {
  const paginationContainer = document.getElementById('paginationContainer');
  const paginationInfo = document.getElementById('paginationInfo');
  const pageNumbers = document.getElementById('pageNumbers');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const firstBtn = document.getElementById('firstPage');
  const lastBtn = document.getElementById('lastPage');
  
  if (!paginationContainer || !filteredBooks || filteredBooks.length === 0) {
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }
  
  // Mostrar contenedor de paginación
  paginationContainer.style.display = 'flex';
  
  // Actualizar información de paginación
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredBooks.length);
  
  if (paginationInfo) {
    paginationInfo.textContent = `Mostrando ${startItem}-${endItem} de ${filteredBooks.length} libros`;
  }
  
  // Actualizar botones de navegación
  if (prevBtn && firstBtn) {
    const isFirstPage = currentPage === 1;
    prevBtn.disabled = isFirstPage;
    firstBtn.disabled = isFirstPage;
  }
  
  if (nextBtn && lastBtn) {
    const isLastPage = currentPage === totalPages;
    nextBtn.disabled = isLastPage;
    lastBtn.disabled = isLastPage;
  }
  
  // Generar números de página
  if (pageNumbers) {
    pageNumbers.innerHTML = generatePageNumbers();
  }
}

// Generar números de página con lógica de "..." 
function generatePageNumbers() {
  let pagesHTML = '';
  const maxVisiblePages = 7; // Número máximo de páginas visibles
  
  if (totalPages <= maxVisiblePages) {
    // Mostrar todas las páginas si son pocas
    for (let i = 1; i <= totalPages; i++) {
      pagesHTML += `
        <button class="page-number ${i === currentPage ? 'active' : ''}" 
                onclick="goToPage(${i})">${i}</button>
      `;
    }
  } else {
    // Lógica compleja para muchas páginas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    // Primera página
    if (startPage > 1) {
      pagesHTML += `<button class="page-number ${currentPage === 1 ? 'active' : ''}" onclick="goToPage(1)">1</button>`;
      if (startPage > 2) {
        pagesHTML += `<span class="page-ellipsis">...</span>`;
      }
    }
    
    // Páginas del rango actual
    for (let i = startPage; i <= endPage; i++) {
      pagesHTML += `
        <button class="page-number ${i === currentPage ? 'active' : ''}" 
                onclick="goToPage(${i})">${i}</button>
      `;
    }
    
    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pagesHTML += `<span class="page-ellipsis">...</span>`;
      }
      pagesHTML += `<button class="page-number ${currentPage === totalPages ? 'active' : ''}" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
  }
  
  return pagesHTML;
}

// Funciones de navegación de página
function goToPage(page) {
  if (page >= 1 && page <= totalPages && page !== currentPage) {
    currentPage = page;
    displayBooks(filteredBooks);
  }
}

function goToFirstPage() {
  goToPage(1);
}

function goToLastPage() {
  goToPage(totalPages);
}

function goToPrevPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

function goToNextPage() {
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

// Cambiar número de elementos por página
function changeItemsPerPage(newItemsPerPage) {
  itemsPerPage = parseInt(newItemsPerPage);
  currentPage = 1; // Resetear a primera página
  displayBooks(filteredBooks);
}

// Actualizar contador de resultados con información de paginación
function updateSearchResults(count, state = 'search') {
  const resultsSpan = document.getElementById('searchResults');
  if (!resultsSpan) return;
  
  switch (state) {
    case 'welcome':
      // Estado inicial - mensaje de bienvenida
      resultsSpan.innerHTML = `Utiliza la búsqueda para explorar nuestra colección`;
      break;
    case 'search':
      // Resultados de búsqueda con información de paginación
      if (count > itemsPerPage) {
        resultsSpan.innerHTML = `Encontrados <strong>${count}</strong> ${count === 1 ? 'libro' : 'libros'} - Página ${currentPage} de ${totalPages}`;
      } else {
        resultsSpan.innerHTML = `Mostrando <strong>${count}</strong> ${count === 1 ? 'libro' : 'libros'}`;
      }
      break;
    case 'no-results':
      // Sin resultados
      resultsSpan.innerHTML = `No se encontraron libros con esos criterios`;
      break;
    case 'total':
      // Mostrar todos los libros (cuando se hace "limpiar filtros")
      if (count > itemsPerPage) {
        resultsSpan.innerHTML = `<strong>${count}</strong> libros en total - Página ${currentPage} de ${totalPages}`;
      } else {
        resultsSpan.innerHTML = `Mostrando <strong>${count}</strong> ${count === 1 ? 'libro' : 'libros'} de nuestra colección`;
      }
      break;
    case 'error':
      // Error de carga
      resultsSpan.innerHTML = `⚠️ Error al cargar la biblioteca`;
      break;
    default:
      resultsSpan.innerHTML = `Mostrando <strong>${count}</strong> ${count === 1 ? 'libro' : 'libros'}`;
  }
}

// Sistema de búsqueda y filtros
function initSearchSystem() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const genreFilter = document.getElementById('genreFilter');
  const editorialFilter = document.getElementById('editorialFilter');
  const yearFilter = document.getElementById('yearFilter');
  const statusFilter = document.getElementById('statusFilter');
  const resetBtn = document.getElementById('resetFilters');
  
  if (!searchInput) return; // Si no existe el elemento, salir
  
  // Búsqueda en tiempo real
  searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle('visible', query.length > 0);
    }
    
    // Sincronizar con búsqueda rápida
    const quickSearchInput = document.getElementById('quickSearchInput');
    if (quickSearchInput && quickSearchInput.value !== query) {
      quickSearchInput.value = query;
    }
    
    applyFilters();
  });
  
  // Botón limpiar búsqueda
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      this.classList.remove('visible');
      
      // Limpiar también búsqueda rápida
      const quickSearchInput = document.getElementById('quickSearchInput');
      if (quickSearchInput) {
        quickSearchInput.value = '';
      }
      
      applyFilters();
    });
  }
  
  // Filtros
  [genreFilter, editorialFilter, yearFilter, statusFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', applyFilters);
    }
  });
  
  // Botón reset
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      searchInput.value = '';
      if (genreFilter) genreFilter.value = '';
      if (editorialFilter) editorialFilter.value = '';
      if (yearFilter) yearFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      if (clearBtn) clearBtn.classList.remove('visible');
      
      // Limpiar también búsqueda rápida
      const quickSearchInput = document.getElementById('quickSearchInput');
      if (quickSearchInput) {
        quickSearchInput.value = '';
      }
      
      // Resetear paginación
      currentPage = 1;
      
      applyFilters();
    });
  }
}

// Aplicar filtros de búsqueda (actualizado para nueva estructura)
function applyFilters() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const selectedGenre = document.getElementById('genreFilter').value;
  const selectedEditorial = document.getElementById('editorialFilter').value;
  const selectedYear = document.getElementById('yearFilter').value;
  const selectedStatus = document.getElementById('statusFilter').value;
  
  filteredBooks = allBooks.filter(libro => {
    // Función helper para limpiar y buscar en texto
    const searchInText = (text) => {
      if (!text) return false;
      return String(text).toLowerCase().replace(/\n/g, ' ').includes(query);
    };
    
    // Búsqueda por texto en múltiples campos
    const matchesSearch = query === '' || 
      searchInText(libro.titulo) ||
      searchInText(libro.autor) ||
      searchInText(libro.editorial) ||
      searchInText(libro.genero) ||
      searchInText(libro.isbn) ||
      searchInText(libro.codigo) ||
      searchInText(libro.ubicacion) ||
      searchInText(libro.categoria) ||
      (libro.tags && libro.tags.some(tag => searchInText(tag))) ||
      (libro.descripcion && searchInText(libro.descripcion));
    
    // Filtro por género/materia
    const matchesGenre = selectedGenre === '' || libro.genero === selectedGenre;
    
    // Filtro por editorial
    const matchesEditorial = selectedEditorial === '' || libro.editorial === selectedEditorial;
    
    // Filtro por año
    const matchesYear = selectedYear === '' || 
      (libro.año && libro.año.toString() === selectedYear);
    
    // Filtro por estado
    const matchesStatus = selectedStatus === '' || libro.estado === selectedStatus;
    
    return matchesSearch && matchesGenre && matchesEditorial && matchesYear && matchesStatus;
  });
  
  // Resetear paginación cuando se aplican filtros
  currentPage = 1;
  
  displayBooks(filteredBooks);
  
  // Determinar el estado del contador basado en los filtros
  const hasActiveFilters = query || selectedGenre || selectedEditorial || selectedYear || selectedStatus;
  
  if (!hasActiveFilters) {
    // No hay filtros activos - estado de bienvenida
    updateSearchResults(0, 'welcome');
  } else if (filteredBooks.length === 0) {
    // Hay filtros pero no resultados
    updateSearchResults(0, 'no-results');
  } else if (filteredBooks.length === allBooks.length && query === '') {
    // Mostrando todos los libros (filtros que incluyen todo)
    updateSearchResults(filteredBooks.length, 'total');
  } else {
    // Mostrando resultados filtrados
    updateSearchResults(filteredBooks.length, 'search');
  }
}

// Actualizar estadísticas de libros
function updateBookStatistics() {
  // Contar libros por estado
  const stats = {
    disponibles: 0,
    prestados: 0,
    reservados: 0,
    total: allBooks.length
  };
  
  allBooks.forEach(libro => {
    const disponibilidad = (libro.disponibilidad || 'DISPONIBLE').toUpperCase();
    if (disponibilidad === 'DISPONIBLE') {
      stats.disponibles++;
    } else if (disponibilidad === 'PRESTADO') {
      stats.prestados++;
    } else if (disponibilidad === 'PENDIENTE') {
      stats.reservados++;
    }
  });
  
  console.log('Estadísticas actualizadas:', stats);
  
  // Actualizar UI si existen los elementos
  const totalBooksElement = document.getElementById('totalBooks');
  const availableBooksElement = document.getElementById('availableBooks');
  
  if (totalBooksElement) {
    totalBooksElement.textContent = stats.total;
  }
  
  if (availableBooksElement) {
    availableBooksElement.textContent = stats.disponibles;
  }
}

// Función de búsqueda rápida tipo Google con sugerencias
function initQuickSearch() {
  const quickSearchInput = document.getElementById('quickSearchInput');
  
  if (!quickSearchInput) return;
  
  // Crear contenedor de sugerencias
  const suggestionsContainer = createSuggestionsContainer();
  
  // Búsqueda con sugerencias (independiente)
  quickSearchInput.addEventListener('input', function() {
    const query = this.value.trim();
    
    if (query.length >= 2) {
      // Solo mostrar sugerencias si tenemos libros cargados
      if (allBooks && allBooks.length > 0) {
        showSuggestions(query, suggestionsContainer);
      }
    } else {
      hideSuggestions(suggestionsContainer);
    }
  });
  
  // Navegación con teclado
  quickSearchInput.addEventListener('keydown', function(e) {
    handleKeyNavigation(e, suggestionsContainer);
  });
  
  // Ocultar sugerencias cuando se pierde el foco
  quickSearchInput.addEventListener('blur', function() {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => {
      hideSuggestions(suggestionsContainer);
    }, 200);
  });
  
  // Mostrar sugerencias cuando se enfoca (si hay texto)
  quickSearchInput.addEventListener('focus', function() {
    const query = this.value.trim();
    if (query.length >= 2 && allBooks && allBooks.length > 0) {
      showSuggestions(query, suggestionsContainer);
    }
  });
  
  // Ocultar sugerencias al hacer click fuera
  document.addEventListener('click', function(e) {
    if (!quickSearchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      hideSuggestions(suggestionsContainer);
    }
  });
  
  // Ocultar sugerencias con ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideSuggestions(suggestionsContainer);
      quickSearchInput.blur();
    }
  });
  
  // Manejar búsqueda rápida con Enter
  quickSearchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const query = this.value.trim();
      if (query) {
        // Si estamos en biblioteca.html, buscar directamente
        if (window.location.pathname.includes('biblioteca.html')) {
          const mainSearchInput = document.getElementById('searchInput');
          if (mainSearchInput) {
            mainSearchInput.value = query;
            applyFilters();
          }
        } else {
          // Si estamos en otra página, redirigir a biblioteca con búsqueda
          window.location.href = `biblioteca.html?search=${encodeURIComponent(query)}`;
        }
      }
      hideSuggestions(suggestionsContainer);
    }
  });
  
  // Manejar el parámetro de búsqueda en la URL
  if (window.location.pathname.includes('biblioteca.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
      quickSearchInput.value = searchQuery;
      // Esperar a que se carguen los libros antes de buscar
      setTimeout(() => {
        const mainSearchInput = document.getElementById('searchInput');
        if (mainSearchInput) {
          mainSearchInput.value = searchQuery;
          applyFilters();
        }
      }, 1000);
    }
  }
}

// Crear contenedor de sugerencias
function createSuggestionsContainer() {
  let container = document.getElementById('quickSearchSuggestions');
  if (!container) {
    container = document.createElement('div');
    container.id = 'quickSearchSuggestions';
    container.className = 'search-suggestions-popup';
    container.style.display = 'none';
    
    const quickSearchInput = document.getElementById('quickSearchInput');
    if (quickSearchInput && quickSearchInput.parentElement) {
      quickSearchInput.parentElement.style.position = 'relative';
      quickSearchInput.parentElement.appendChild(container);
    }
  }
  return container;
}

// Mostrar sugerencias
function showSuggestions(query, container) {
  const suggestions = generateSuggestions(query);
  
  if (suggestions.length === 0) {
    hideSuggestions(container);
    return;
  }
  
  const suggestionsHTML = suggestions.map((suggestion, index) => `
    <div class="suggestion-item ${index === 0 ? 'selected' : ''}" 
         data-query="${suggestion.query}" 
         data-type="${suggestion.type}">
      <span class="suggestion-icon">${suggestion.icon}</span>
      <div class="suggestion-content">
        <div class="suggestion-text">${suggestion.display}</div>
        <div class="suggestion-type">${suggestion.typeText}</div>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = suggestionsHTML;
  container.style.display = 'block';
  suggestionsVisible = true;
  
  // Agregar event listeners a las sugerencias
  container.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', function() {
      const query = this.dataset.query;
      document.getElementById('quickSearchInput').value = query;
      executeSearch(query);
      hideSuggestions(container);
    });
  });
}

// Generar sugerencias inteligentes
function generateSuggestions(query) {
  const suggestions = [];
  const maxSuggestions = 8;
  const lowerQuery = query.toLowerCase();
  
  // Función helper para limpiar texto y buscar
  const cleanAndMatch = (text, query) => {
    if (!text) return false;
    return String(text).toLowerCase().replace(/\n/g, ' ').includes(query);
  };
  
  // Función para resaltar coincidencias
  const safeHighlight = (text, query) => {
    if (!text) return '';
    const cleanText = String(text).replace(/\n/g, ' ').trim();
    return highlightMatch(cleanText, query);
  };
  
  // Búsqueda por título
  allBooks.forEach(book => {
    if (cleanAndMatch(book.titulo, lowerQuery)) {
      suggestions.push({
        query: book.titulo.replace(/\n/g, ' ').trim(),
        display: `<strong>${safeHighlight(book.titulo, lowerQuery)}</strong>`,
        type: 'title',
        typeText: `por ${book.autor ? book.autor.replace(/\n/g, ' ').trim() : 'Autor desconocido'}`,
        icon: '📖'
      });
    }
  });
  
  // Búsqueda por autor
  const authors = [...new Set(allBooks
    .map(book => book.autor ? book.autor.replace(/\n/g, ' ').trim() : 'Autor desconocido')
    .filter(Boolean)
  )];
  
  authors.forEach(author => {
    if (cleanAndMatch(author, lowerQuery)) {
      const bookCount = allBooks.filter(book => 
        book.autor && cleanAndMatch(book.autor, author.toLowerCase())
      ).length;
      suggestions.push({
        query: author,
        display: `<strong>${safeHighlight(author, lowerQuery)}</strong>`,
        type: 'author',
        typeText: `${bookCount} libro${bookCount > 1 ? 's' : ''}`,
        icon: '👤'
      });
    }
  });
  
  // Búsqueda por materia/género
  const materias = [...new Set(allBooks
    .map(book => book.genero ? book.genero.replace(/\n/g, ' ').trim() : null)
    .filter(Boolean)
  )];
  
  materias.forEach(materia => {
    if (cleanAndMatch(materia, lowerQuery)) {
      const bookCount = allBooks.filter(book => 
        book.genero && cleanAndMatch(book.genero, materia.toLowerCase())
      ).length;
      suggestions.push({
        query: materia,
        display: `<strong>${safeHighlight(materia, lowerQuery)}</strong>`,
        type: 'subject',
        typeText: `${bookCount} libro${bookCount > 1 ? 's' : ''}`,
        icon: '📂'
      });
    }
  });
  
  // Búsqueda por editorial
  const editoriales = [...new Set(allBooks
    .map(book => book.editorial ? book.editorial.replace(/\n/g, ' ').trim() : null)
    .filter(Boolean)
  )];
  
  editoriales.forEach(editorial => {
    if (cleanAndMatch(editorial, lowerQuery)) {
      const bookCount = allBooks.filter(book => 
        book.editorial && cleanAndMatch(book.editorial, editorial.toLowerCase())
      ).length;
      suggestions.push({
        query: editorial,
        display: `<strong>${safeHighlight(editorial, lowerQuery)}</strong>`,
        type: 'publisher',
        typeText: `${bookCount} libro${bookCount > 1 ? 's' : ''}`,
        icon: '🏢'
      });
    }
  });
  
  // Búsqueda por código/ISBN
  allBooks.forEach(book => {
    if ((book.codigo && cleanAndMatch(book.codigo, lowerQuery)) || 
        (book.isbn && cleanAndMatch(book.isbn, lowerQuery))) {
      suggestions.push({
        query: book.codigo || book.isbn || book.id,
        display: `<strong>${safeHighlight(book.codigo || book.isbn || book.id, lowerQuery)}</strong>`,
        type: 'code',
        typeText: `${book.titulo ? book.titulo.replace(/\n/g, ' ').trim().substring(0, 30) + '...' : 'Sin título'}`,
        icon: '�'
      });
    }
  });
  
  // Limitar número de sugerencias y remover duplicados
  return suggestions
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => s.query === suggestion.query)
    )
    .slice(0, maxSuggestions);
}

// Resaltar coincidencias
function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Ocultar sugerencias
function hideSuggestions(container) {
  container.style.display = 'none';
  suggestionsVisible = false;
}

// Ejecutar búsqueda y navegar a la sección
function executeSearch(query) {
  // Scroll a la sección biblioteca
  const bibliotecaSection = document.getElementById('biblioteca');
  if (bibliotecaSection) {
    bibliotecaSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
  
  // Aplicar búsqueda en la sección principal
  setTimeout(() => {
    const mainSearchInput = document.getElementById('searchInput');
    if (mainSearchInput) {
      mainSearchInput.value = query;
      applyFilters();
    }
  }, 500);
}

// Navegación con teclado en sugerencias
function handleKeyNavigation(e, container) {
  if (!suggestionsVisible) return;
  
  const items = container.querySelectorAll('.suggestion-item');
  const selected = container.querySelector('.suggestion-item.selected');
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = selected?.nextElementSibling || items[0];
    updateSelection(selected, next);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = selected?.previousElementSibling || items[items.length - 1];
    updateSelection(selected, prev);
  } else if (e.key === 'Enter' && selected) {
    e.preventDefault();
    const query = selected.dataset.query;
    document.getElementById('quickSearchInput').value = query;
    executeSearch(query);
    hideSuggestions(container);
  }
}

// Actualizar selección en sugerencias
function updateSelection(current, next) {
  if (current) current.classList.remove('selected');
  if (next) next.classList.add('selected');
}

// Función para mostrar detalles del libro (actualizada)
function openBookDetails(bookId) {
  const libro = allBooks.find(book => book.id === bookId);
  
  if (!libro) {
    alert('❌ No se encontraron detalles para este libro.');
    return;
  }
  
  // Crear elementos del modal si no existen
  let modal = document.getElementById('bookDetailsModal');
  if (!modal) {
    modal = createBookDetailsModal();
    document.body.appendChild(modal);
  }
  
  // Determinar estado del libro
  const estadoClass = libro.estado || 'disponible';
  const estadoTexto = {
    'disponible': 'Disponible',
    'prestado': 'Prestado',
    'reservado': 'Reservado',
    'sistema': 'Sistema',
    'error': 'Error'
  }[estadoClass] || 'Disponible';
  
  // Crear icono del género
  const genreIcon = {
    'LITERATURA': '📚', 'FICCIÓN': '📖', 'HISTORIA': '🏛️', 'CIENCIAS': '🔬',
    'ARTE': '🎨', 'FILOSOFÍA': '💭', 'DERECHO': '⚖️', 'MEDICINA': '🏥',
    'MATEMÁTICAS': '➕', 'INGENIERÍA': '⚙️', 'ECONOMÍA': '💼', 'PSICOLOGÍA': '🧠',
    'EDUCACIÓN': '🎓', 'RELIGIÓN': '✝️', 'DEPORTES': '⚽', 'COCINA': '🍳'
  }[libro.genero?.toUpperCase()] || '📚';
  
  // Crear lista de detalles filtrados
  const detallesList = [];
  
  if (isValidValue(libro.titulo)) {
    detallesList.push(`<div class="modal-detail"><strong>📖 Título:</strong> ${libro.titulo}</div>`);
  }
  
  if (isValidValue(libro.autor)) {
    detallesList.push(`<div class="modal-detail"><strong>👤 Autor:</strong> ${libro.autor}</div>`);
  }
  
  if (isValidValue(libro.editorial)) {
    detallesList.push(`<div class="modal-detail"><strong>🏢 Editorial:</strong> ${libro.editorial}</div>`);
  }
  
  if (isValidValue(libro.año) && libro.año > 0) {
    detallesList.push(`<div class="modal-detail"><strong>📅 Año:</strong> ${libro.año}</div>`);
  }
  
  if (isValidValue(libro.genero)) {
    detallesList.push(`<div class="modal-detail"><strong>📂 Materia:</strong> ${libro.genero}</div>`);
  }
  
  if (isValidValue(libro.ubicacion)) {
    detallesList.push(`<div class="modal-detail"><strong>📍 Ubicación:</strong> ${libro.ubicacion}</div>`);
  }
  
  if (isValidValue(libro.codigo) || isValidValue(libro.id)) {
    detallesList.push(`<div class="modal-detail"><strong>🔍 Código:</strong> ${libro.codigo || libro.id}</div>`);
  }
  
  if (isValidValue(libro.isbn)) {
    detallesList.push(`<div class="modal-detail"><strong>📚 ISBN:</strong> ${libro.isbn}</div>`);
  }
  
  if (isValidValue(libro.edicion)) {
    detallesList.push(`<div class="modal-detail"><strong>📄 Edición:</strong> ${libro.edicion}</div>`);
  }
  
  if (isValidValue(libro.cantidad)) {
    detallesList.push(`<div class="modal-detail"><strong>📊 Cantidad:</strong> ${libro.cantidad}</div>`);
  }
  
  if (isValidValue(libro.fechaAdquisicion)) {
    detallesList.push(`<div class="modal-detail"><strong>📆 Fecha de adquisición:</strong> ${libro.fechaAdquisicion}</div>`);
  }
  
  // Poblar el contenido del modal
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">${genreIcon}</div>
        <h2>📚 Detalles del Libro</h2>
        <button class="modal-close" onclick="closeBookDetails()">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="modal-details-grid">
          ${detallesList.join('')}
        </div>
        
        ${isValidValue(libro.descripcion) ? `
          <div class="modal-description">
            <h3>📝 Descripción</h3>
            <p>${libro.descripcion}</p>
          </div>
        ` : ''}
        
        <div class="modal-status">
          <span class="status-label">Estado del libro:</span>
          <span class="status-badge ${estadoClass}">${estadoTexto}</span>
        </div>
      </div>
    </div>
  `;
  
  // Mostrar el modal
  modal.style.display = 'flex';
  
  // Cerrar modal con ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeBookDetails();
    }
  });
}

function createBookDetailsModal() {
  const modal = document.createElement('div');
  modal.id = 'bookDetailsModal';
  modal.className = 'book-modal';
  
  // Cerrar modal al hacer clic en el fondo
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeBookDetails();
    }
  });
  
  return modal;
}

function closeBookDetails() {
  const modal = document.getElementById('bookDetailsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Navegación suave
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      
      // Validar que el selector no sea solo '#' o esté vacío
      if (!targetId || targetId === '#' || targetId.length <= 1) {
        return;
      }
      
      try {
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 70; // Altura del navbar
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      } catch (error) {
        console.warn('⚠️ Selector CSS inválido:', targetId, error);
      }
    });
  });
}

// Función para manejar la vista previa de Planner5D
function setupPlanner5DPreview() {
  const previewImage = document.querySelector('.preview-image');
  
  if (previewImage) {
    previewImage.addEventListener('click', function() {
      // Abrir el enlace en una nueva ventana
      window.open('https://planner5d.onelink.me/stDT/lfqcl8l2', '_blank');
      
      // Analytics o tracking (opcional)
      console.log('Usuario abrió el recorrido virtual de Planner5D');
    });
  }
}

// Inicializar controles de paginación
function initPaginationControls() {
  // Event listeners para botones de navegación
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const firstBtn = document.getElementById('firstPage');
  const lastBtn = document.getElementById('lastPage');
  const itemsSelect = document.getElementById('itemsPerPage');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', goToPrevPage);
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', goToNextPage);
  }
  
  if (firstBtn) {
    firstBtn.addEventListener('click', goToFirstPage);
  }
  
  if (lastBtn) {
    lastBtn.addEventListener('click', goToLastPage);
  }
  
  if (itemsSelect) {
    itemsSelect.addEventListener('change', function() {
      changeItemsPerPage(this.value);
    });
  }
  
  // Navegación con teclado (flechas izquierda/derecha para cambiar páginas)
  document.addEventListener('keydown', function(e) {
    // Solo si no estamos escribiendo en un input
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
      return;
    }
    
    if (e.key === 'ArrowLeft' && currentPage > 1) {
      e.preventDefault();
      goToPrevPage();
    } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
      e.preventDefault();
      goToNextPage();
    }
  });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Iniciando aplicación SIDAUTO BIBLIOTECA...');
  
  // Probar conexión antes de cargar datos
  const connectionOk = await testSupabaseConnection();
  
  if (connectionOk) {
    console.log('✅ Procediendo a cargar libros...');
    // Cargar libros desde Supabase
    await loadBooksFromSupabase();
    
    // Actualizar estadísticas después de cargar libros
    updateLibraryStats();
  } else {
    console.error('❌ No se pudo establecer conexión con Supabase');
    loadFallbackBooks();
    
    // Actualizar estadísticas con datos de fallback
    updateLibraryStats();
  }
  
  // Suscribirse a cambios en tiempo real (opcional)
  subscribeToBookChanges();
  
  // Inicializar sistema de búsqueda
  initSearchSystem();
  
  // Inicializar búsqueda rápida del navbar
  initQuickSearch();
  
  // Inicializar controles de paginación
  initPaginationControls();
  
  // Otras funcionalidades
  initSmoothScroll();
  setupPlanner5DPreview();
  
  // Agregar efectos de scroll para el navbar
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(44, 62, 80, 0.95)';
      navbar.style.backdropFilter = 'blur(10px)';
    } else {
      navbar.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
      navbar.style.backdropFilter = 'none';
    }
  });
});

// === FUNCIONALIDAD DE BÚSQUEDA RÁPIDA EN NAVEGACIÓN ===

// Función para crear el contenedor de sugerencias
function createSuggestionsContainer() {
  let container = document.getElementById('quickSearchSuggestions');
  if (!container) {
    container = document.createElement('div');
    container.id = 'quickSearchSuggestions';
    container.className = 'search-suggestions-popup';
    container.style.display = 'none';
    
    const quickSearchInput = document.getElementById('quickSearchInput');
    if (quickSearchInput && quickSearchInput.parentElement) {
      quickSearchInput.parentElement.style.position = 'relative';
      quickSearchInput.parentElement.appendChild(container);
    }
  }
  return container;
}



// Función para actualizar estadísticas en la página biblioteca
function updateLibraryStats() {
  if (!window.location.pathname.includes('biblioteca.html')) {
    console.log('📊 No estamos en biblioteca.html, saltando estadísticas');
    return;
  }
  
  console.log('📊 Iniciando actualización de estadísticas...');
  console.log('📊 Total de libros en allBooks:', allBooks.length);
  
  const totalBooksEl = document.getElementById('totalBooks');
  const availableBooksEl = document.getElementById('availableBooks');
  const borrowedBooksEl = document.getElementById('borrowedBooks');
  const totalGenresEl = document.getElementById('totalGenres');
  
  if (!totalBooksEl) {
    console.error('❌ No se encontraron elementos de estadísticas en la página');
    return;
  }
  
  if (allBooks.length > 0) {
    // Verificar algunos datos de ejemplo para debugging
    console.log('📊 Primeros 5 libros con datos:', allBooks.slice(0, 5).map(book => ({ 
      titulo: book.titulo, 
      estado: book.estado,
      ESTADO: book.ESTADO,
      genero: book.genero,
      GENERO: book.GENERO 
    })));
    
    // Verificar todos los valores únicos de ESTADO para debugging
    const uniqueStates = [...new Set([
      ...allBooks.map(book => book.ESTADO).filter(Boolean),
      ...allBooks.map(book => book.estado).filter(Boolean)
    ])];
    console.log('📊 Estados únicos encontrados:', uniqueStates);
    
    // Verificar algunos géneros para debugging
    const uniqueGenres = [...new Set([
      ...allBooks.map(book => book.GENERO).filter(Boolean),
      ...allBooks.map(book => book.genero).filter(Boolean)
    ])];
    console.log('📊 Géneros únicos encontrados:', uniqueGenres.slice(0, 10));
    
    const available = allBooks.filter(book => {
      const disponibilidad = (book.disponibilidad || 'DISPONIBLE').toUpperCase();
      return disponibilidad === 'DISPONIBLE';
    }).length;
    
    const borrowed = allBooks.filter(book => {
      const disponibilidad = (book.disponibilidad || 'DISPONIBLE').toUpperCase();
      return disponibilidad === 'PENDIENTE' || disponibilidad === 'PRESTADO' || disponibilidad === 'OCUPADO';
    }).length;
    
    const genres = new Set([
      ...allBooks.map(book => book.GENERO).filter(Boolean),
      ...allBooks.map(book => book.genero).filter(Boolean)
    ]).size;
    
    console.log('📊 Estadísticas calculadas:', { 
      total: allBooks.length, 
      available, 
      borrowed, 
      genres 
    });
    
    // Animación de conteo
    animateCounter(totalBooksEl, allBooks.length);
    animateCounter(availableBooksEl, available);
    animateCounter(borrowedBooksEl, borrowed);
    animateCounter(totalGenresEl, genres);
    
    console.log('✅ Estadísticas actualizadas correctamente');
  } else {
    console.warn('⚠️ No hay libros cargados para mostrar estadísticas');
  }
}

// Función para animar contadores
function animateCounter(element, targetValue) {
  if (!element) return;
  
  const startValue = 0;
  const duration = 1500; // 1.5 segundos
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
    
    element.textContent = currentValue.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = targetValue.toLocaleString();
    }
  }
  
  requestAnimationFrame(update);
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  initQuickSearch();
  initRentalSystem();
  
  // Las estadísticas ahora se actualizan directamente desde la función principal
  // después de cargar los libros, no necesitamos el intervalo aquí
});

// === SISTEMA DE ALQUILER ===
let selectedBook = null;

// Inicializar sistema de alquiler
function initRentalSystem() {
  const alquilarBtn = document.getElementById('alquilarBtn');
  const adminPanelBtn = document.getElementById('adminPanelBtn');
  
  if (alquilarBtn) {
    alquilarBtn.addEventListener('click', openRentalModal);
  }
  
  if (adminPanelBtn) {
    adminPanelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openAdminLoginModal();
    });
  }
  
  // Inicializar buscador de libros en modal
  const rentalBookSearch = document.getElementById('rentalBookSearch');
  if (rentalBookSearch) {
    initRentalBookSearch();
  }
  
  // Manejar envío del formulario
  const rentalForm = document.getElementById('rentalForm');
  if (rentalForm) {
    rentalForm.addEventListener('submit', handleRentalSubmit);
  }
  
  // Manejar formulario de login admin
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }
}

// Abrir modal de alquiler
function openRentalModal() {
  const modal = document.getElementById('alquilarModal');
  if (modal) {
    modal.style.display = 'flex';
    
    // Enfocar el buscador de libros
    setTimeout(() => {
      const bookSearch = document.getElementById('rentalBookSearch');
      if (bookSearch) {
        bookSearch.focus();
      }
    }, 100);
    
    // Cerrar con ESC
    document.addEventListener('keydown', handleModalKeydown);
    
    // Cerrar al hacer click fuera
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeRentalModal();
      }
    });
  }
}

// Cerrar modal de alquiler
function closeRentalModal() {
  const modal = document.getElementById('alquilarModal');
  if (modal) {
    modal.style.display = 'none';
    document.removeEventListener('keydown', handleModalKeydown);
    
    // Limpiar formulario
    clearRentalForm();
  }
}

// Manejar tecla ESC para cerrar modal
function handleModalKeydown(e) {
  if (e.key === 'Escape') {
    closeRentalModal();
  }
}

// Limpiar formulario de alquiler
function clearRentalForm() {
  const form = document.getElementById('rentalForm');
  if (form) {
    form.reset();
  }
  
  clearBookSelection();
  
  // Limpiar sugerencias
  const suggestions = document.getElementById('rentalBookSuggestions');
  if (suggestions) {
    suggestions.style.display = 'none';
  }
}

// Inicializar buscador de libros en modal
function initRentalBookSearch() {
  const bookSearch = document.getElementById('rentalBookSearch');
  const suggestions = document.getElementById('rentalBookSuggestions');
  
  if (!bookSearch || !suggestions) return;
  
  // Búsqueda en tiempo real
  bookSearch.addEventListener('input', function() {
    const query = this.value.trim();
    
    if (query.length >= 2 && allBooks && allBooks.length > 0) {
      showRentalSuggestions(query, suggestions);
    } else {
      hideSuggestions(suggestions);
    }
  });
  
  // Navegación con teclado
  bookSearch.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
      handleKeyNavigation(e, suggestions);
    }
  });
  
  // Ocultar sugerencias al perder foco
  bookSearch.addEventListener('blur', function() {
    setTimeout(() => {
      hideSuggestions(suggestions);
    }, 200);
  });
}

// Mostrar sugerencias de libros para alquiler
function showRentalSuggestions(query, container) {
  const suggestions = generateRentalSuggestions(query);
  
  if (suggestions.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  const suggestionsHTML = suggestions.map(suggestion => `
    <div class="suggestion-item" data-book-id="${suggestion.bookId}" data-query="${suggestion.query}">
      <div class="suggestion-icon">${suggestion.icon}</div>
      <div class="suggestion-content">
        <div class="suggestion-text">${suggestion.display}</div>
        <div class="suggestion-type">${suggestion.typeText}</div>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = suggestionsHTML;
  container.style.display = 'block';
  
  // Agregar event listeners a las sugerencias
  container.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', function() {
      const bookId = this.dataset.bookId;
      const book = allBooks.find(b => b.id == bookId);
      if (book) {
        selectBookForRental(book);
        hideSuggestions(container);
      }
    });
  });
}

// Generar sugerencias para el modal de alquiler (solo libros disponibles)
function generateRentalSuggestions(query) {
  const suggestions = [];
  const maxSuggestions = 6;
  const lowerQuery = query.toLowerCase();
  
  // Función helper para limpiar texto y buscar
  const cleanAndMatch = (text, query) => {
    if (!text) return false;
    return String(text).toLowerCase().replace(/\n/g, ' ').includes(query);
  };
  
  // Función para resaltar coincidencias
  const safeHighlight = (text, query) => {
    if (!text) return '';
    const cleanText = String(text).replace(/\n/g, ' ').trim();
    return highlightMatch(cleanText, query);
  };
  
  // Solo buscar libros disponibles
  const availableBooks = allBooks.filter(book => {
    const disponibilidad = (book.disponibilidad || 'DISPONIBLE').toUpperCase();
    return disponibilidad === 'DISPONIBLE';
  });
  
  // Búsqueda por título
  availableBooks.forEach(book => {
    if (cleanAndMatch(book.titulo, lowerQuery)) {
      suggestions.push({
        bookId: book.id,
        query: book.titulo.replace(/\n/g, ' ').trim(),
        display: `<strong>${safeHighlight(book.titulo, lowerQuery)}</strong>`,
        typeText: `por ${book.autor ? book.autor.replace(/\n/g, ' ').trim() : 'Autor desconocido'}`,
        icon: '📖'
      });
    }
  });
  
  // Búsqueda por autor
  availableBooks.forEach(book => {
    if (book.autor && cleanAndMatch(book.autor, lowerQuery)) {
      suggestions.push({
        bookId: book.id,
        query: book.titulo.replace(/\n/g, ' ').trim(),
        display: `<strong>${safeHighlight(book.titulo, lowerQuery)}</strong>`,
        typeText: `por ${safeHighlight(book.autor, lowerQuery)}`,
        icon: '👤'
      });
    }
  });
  
  // Búsqueda por código/ISBN
  availableBooks.forEach(book => {
    if ((book.codigo && cleanAndMatch(book.codigo, lowerQuery)) || 
        (book.isbn && cleanAndMatch(book.isbn, lowerQuery))) {
      suggestions.push({
        bookId: book.id,
        query: book.titulo.replace(/\n/g, ' ').trim(),
        display: `<strong>${safeHighlight(book.titulo, lowerQuery)}</strong>`,
        typeText: `Código: ${safeHighlight(book.codigo || book.isbn || book.id, lowerQuery)}`,
        icon: '🔍'
      });
    }
  });
  
  // Limitar número de sugerencias y remover duplicados
  return suggestions
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => s.bookId === suggestion.bookId)
    )
    .slice(0, maxSuggestions);
}

// Seleccionar libro para alquiler
function selectBookForRental(book) {
  selectedBook = book;
  
  const bookSearch = document.getElementById('rentalBookSearch');
  const selectedInfo = document.getElementById('selectedBookInfo');
  const selectedTitle = selectedInfo.querySelector('.selected-book-title');
  const selectedBookIdInput = document.getElementById('selectedBookId');
  
  if (bookSearch) {
    bookSearch.value = '';
    // Agregar indicador visual de que se seleccionó un libro
    bookSearch.placeholder = '✅ Libro seleccionado - Puedes buscar otro si deseas cambiar';
    bookSearch.style.borderColor = '#27ae60';
    bookSearch.style.backgroundColor = '#f8fff8';
  }
  
  // Llenar el campo oculto para validación del formulario
  if (selectedBookIdInput) {
    selectedBookIdInput.value = book.id || book.codigo || book.supabaseId;
    console.log('✅ Libro seleccionado para formulario:', selectedBookIdInput.value);
  }
  
  if (selectedInfo && selectedTitle) {
    selectedTitle.textContent = `📖 ${book.titulo} - ${book.autor || 'Autor desconocido'}`;
    selectedInfo.style.display = 'block';
  }
  
  // Ocultar sugerencias después de seleccionar
  const suggestions = document.getElementById('rentalBookSuggestions');
  if (suggestions) {
    suggestions.innerHTML = '';
    suggestions.style.display = 'none';
  }
}

// Limpiar selección de libro
function clearBookSelection() {
  selectedBook = null;
  
  const selectedInfo = document.getElementById('selectedBookInfo');
  const selectedBookIdInput = document.getElementById('selectedBookId');
  const bookSearch = document.getElementById('rentalBookSearch');
  
  if (selectedInfo) {
    selectedInfo.style.display = 'none';
  }
  
  // Limpiar el campo oculto
  if (selectedBookIdInput) {
    selectedBookIdInput.value = '';
    console.log('🧹 Selección de libro limpiada');
  }
  
  // Restaurar apariencia original del campo de búsqueda
  if (bookSearch) {
    bookSearch.placeholder = 'Buscar libro por título, autor, código...';
    bookSearch.style.borderColor = '';
    bookSearch.style.backgroundColor = '';
    bookSearch.focus();
  }
}

// Manejar envío del formulario de alquiler
async function handleRentalSubmit(e) {
  e.preventDefault();
  
  // Verificar tanto la variable global como el campo oculto
  const selectedBookIdInput = document.getElementById('selectedBookId');
  const hasSelectedBook = selectedBook && selectedBookIdInput && selectedBookIdInput.value;
  
  if (!hasSelectedBook) {
    console.warn('⚠️ Validación de libro fallida:');
    console.log('  - selectedBook:', !!selectedBook);
    console.log('  - selectedBookIdInput:', !!selectedBookIdInput);
    console.log('  - selectedBookIdInput.value:', selectedBookIdInput?.value);
    
    showNotification('warning', 'Libro no seleccionado', 'Por favor selecciona un libro antes de continuar.');
    
    // Enfocar el campo de búsqueda para facilitar la selección
    const bookSearch = document.getElementById('rentalBookSearch');
    if (bookSearch) {
      bookSearch.focus();
    }
    return;
  }
  
  const formData = new FormData(e.target);
  const usuario = formData.get('usuario').trim();
  const cedula = formData.get('cedula').trim();
  const telefono = formData.get('telefono').trim();
  
  if (!usuario || !cedula || !telefono) {
    showNotification('warning', 'Campos incompletos', 'Por favor completa todos los campos del formulario.');
    return;
  }
  
  // Validar cédula (básico)
  if (cedula.length < 7 || cedula.length > 20) {
    showNotification('warning', 'Cédula inválida', 'Por favor ingresa una cédula válida (7-20 dígitos).');
    return;
  }
  
  // Obtener referencia del botón al inicio
  const submitBtn = e.target.querySelector('.btn-submit');
  const originalText = submitBtn ? submitBtn.textContent : 'Enviar Solicitud';

  try {
    // Deshabilitar botón de envío
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Procesando...';
    }
    
    // Crear usuario en Supabase
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert([
        {
          usuario: usuario,
          cedula: cedula,
          telefono: telefono,
          tipo_usuario: 'cliente'
        }
      ])
      .select();
    
    if (userError && userError.code !== '23505') { // 23505 = duplicate key (usuario ya existe)
      throw userError;
    }
    
    // Cambiar disponibilidad del libro de DISPONIBLE a PENDIENTE
    const { error: bookError } = await supabase
      .from('libros')
      .update({ disponibilidad: 'PENDIENTE' })
      .eq('No', selectedBook.supabaseId || selectedBook.No);
    
    if (bookError) {
      console.error('Error al actualizar disponibilidad del libro:', bookError);
      throw bookError;
    }
    
    console.log('✅ Disponibilidad del libro actualizada a PENDIENTE');
    
    // Actualizar libro localmente
    const bookIndex = allBooks.findIndex(book => book.supabaseId === (selectedBook.supabaseId || selectedBook.No));
    if (bookIndex !== -1) {
      allBooks[bookIndex].disponibilidad = 'PENDIENTE';
      allBooks[bookIndex].estado = 'pendiente'; // Para compatibilidad con el sistema local
    }
    
    // Actualizar estadísticas si estamos en biblioteca
    if (window.location.pathname.includes('biblioteca.html')) {
      updateLibraryStats();
    }
    
    showNotification('success', '¡Solicitud Enviada!', 'El libro ha sido reservado y está pendiente de aprobación.');
    closeRentalModal();
    
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    
    if (error.code === '23505') {
      // Usuario ya existe, solo actualizar disponibilidad del libro
      try {
        const { error: bookError } = await supabase
          .from('libros')
          .update({ disponibilidad: 'PENDIENTE' })
          .eq('No', selectedBook.supabaseId || selectedBook.No);
        
        if (bookError) throw bookError;
        
        // Actualizar libro localmente
        const bookIndex = allBooks.findIndex(book => book.supabaseId === (selectedBook.supabaseId || selectedBook.No));
        if (bookIndex !== -1) {
          allBooks[bookIndex].disponibilidad = 'PENDIENTE';
          allBooks[bookIndex].estado = 'pendiente'; // Para compatibilidad con el sistema local
        }
        
        console.log('✅ Usuario existente - Disponibilidad del libro actualizada a PENDIENTE');
        
        // Actualizar estadísticas si estamos en biblioteca
        if (window.location.pathname.includes('biblioteca.html')) {
          updateLibraryStats();
        }
        
        showNotification('success', '¡Solicitud Enviada!', 'El usuario ya estaba registrado. El libro ha sido reservado.');
        closeRentalModal();
        
      } catch (bookError) {
        showNotification('error', 'Error de Sistema', 'Error al procesar la solicitud. Por favor intenta nuevamente.');
      }
    } else {
      showNotification('error', 'Error de Sistema', 'Error al procesar la solicitud. Por favor intenta nuevamente.');
    }
  } finally {
    // Rehabilitar botón
    const submitBtn = e.target.querySelector('.btn-submit');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

// === SISTEMA DE ADMINISTRADOR ===

// Abrir modal de login administrador
function openAdminLoginModal() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) {
    modal.style.display = 'flex';
    
    // Limpiar el formulario y mensajes previos
    const form = document.getElementById('adminLoginForm');
    if (form) {
      form.reset();
    }
    
    // Ocultar mensajes de estado previos
    hideAdminModalStatus();
    
    // Enfocar el campo usuario
    setTimeout(() => {
      const userInput = document.getElementById('adminUsuario');
      if (userInput) {
        userInput.focus();
      }
    }, 100);
    
    // Cerrar con ESC
    document.addEventListener('keydown', handleAdminModalKeydown);
    
    // Cerrar al hacer click fuera
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeAdminLoginModal();
      }
    });
  }
}

// Cerrar modal de login administrador
function closeAdminLoginModal() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) {
    modal.style.display = 'none';
    document.removeEventListener('keydown', handleAdminModalKeydown);
    
    // Limpiar formulario
    const form = document.getElementById('adminLoginForm');
    if (form) {
      form.reset();
    }
  }
}

// Manejar tecla ESC para cerrar modal admin
function handleAdminModalKeydown(e) {
  if (e.key === 'Escape') {
    closeAdminLoginModal();
  }
}

// Manejar login de administrador
async function handleAdminLogin(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const usuario = formData.get('usuario').trim();
  const contrasena = formData.get('contrasena').trim();
  
  // Log inicial del intento de login
  console.log('🔐 Intento de login de administrador iniciado');
  console.log('📋 Usuario:', usuario);
  
  if (!usuario || !contrasena) {
    console.warn('⚠️ Login fallido: Campos incompletos');
    showAdminLoginWarning('Por favor completa todos los campos');
    return;
  }
  
  // Obtener referencias del botón
  const submitBtn = e.target.querySelector('.btn-submit');
  const originalText = submitBtn ? submitBtn.textContent : '';
  
  try {
    // Limpiar mensajes anteriores
    hideAdminModalStatus();
    
    // Deshabilitar botón de envío
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verificando...';
    }
    
    // Mostrar estado de carga
    showAdminLoginLoading();
    
    console.log('🔍 Consultando base de datos de usuarios...');
    
    // Buscar usuario administrador en Supabase
    const { data: adminUser, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .eq('contrasena', contrasena) // En producción usar hash
      .eq('tipo_usuario', 'admin')
      .single();
    
    console.log('📊 Resultado de consulta DB:', {
      hasData: !!adminUser,
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message
    });
    
    if (error || !adminUser) {
      console.warn('❌ Login fallido: Credenciales inválidas o sin permisos');
      console.log('📝 Detalles del error:', error);
      
      showAdminLoginError('Usuario o contraseña incorrectos, o no tienes permisos de administrador');
      
      showNotification(
        'admin-error', 
        'Acceso Denegado', 
        'Usuario o contraseña incorrectos, o no tienes permisos de administrador.'
      );
      return;
    }
    
    // Login exitoso
    console.log('✅ Login exitoso para usuario:', adminUser.usuario);
    console.log('🎯 ID de usuario:', adminUser.id);
    console.log('🔑 Tipo de usuario:', adminUser.tipo_usuario);
    
    // Crear sesión de admin
    const adminSession = {
      id: adminUser.id,
      usuario: adminUser.usuario,
      tipo_usuario: adminUser.tipo_usuario,
      loginTime: Date.now(),
      loginDate: new Date().toISOString()
    };
    
    // Guardar sesión en localStorage Y sessionStorage para máxima compatibilidad
    const sessionData = JSON.stringify(adminSession);
    
    console.log('💾 Intentando guardar sesión...');
    console.log('📋 Datos de sesión a guardar:', adminSession);
    
    try {
      // Guardar en localStorage
      localStorage.setItem('sidauto_admin', sessionData);
      console.log('✅ Guardado en localStorage: OK');
      
      // Guardar también en sessionStorage como backup
      sessionStorage.setItem('sidauto_admin', sessionData);
      console.log('✅ Guardado en sessionStorage: OK');
      
      // Forzar que se escriba al almacenamiento
      localStorage.setItem('sidauto_admin_test', 'test');
      localStorage.removeItem('sidauto_admin_test');
      
    } catch (storageError) {
      console.error('❌ Error al guardar en storage:', storageError);
      throw new Error('Error al guardar sesión: ' + storageError.message);
    }
    
    // Verificar que ambas sesiones se guardaron correctamente
    const savedLocalSession = localStorage.getItem('sidauto_admin');
    const savedSessionSession = sessionStorage.getItem('sidauto_admin');
    
    if (savedLocalSession && savedSessionSession) {
      console.log('✅ Verificación de sesión: OK en ambos storages');
      console.log('📄 localStorage recuperado:', JSON.parse(savedLocalSession));
      console.log('📄 sessionStorage recuperado:', JSON.parse(savedSessionSession));
    } else {
      console.error('❌ Error: La sesión no se guardó correctamente');
      console.log('localStorage:', !!savedLocalSession);
      console.log('sessionStorage:', !!savedSessionSession);
      throw new Error('Error al guardar sesión');
    }
    
    // Mostrar estados de éxito
    showAdminLoginSuccess();
    
    showNotification(
      'admin-success', 
      '¡Login Exitoso!', 
      'Redirigiendo al panel de administradores...'
    );
    
    console.log('🚀 Iniciando redirección a admin.html');
    
    // Verificar una vez más que la sesión está guardada antes de redirigir
    setTimeout(() => {
      console.log('🔍 Verificación final antes de redirección...');
      
      // Verificar acceso a localStorage
      try {
        localStorage.setItem('test_access', 'ok');
        localStorage.removeItem('test_access');
        console.log('✅ localStorage accesible');
      } catch (e) {
        console.error('❌ localStorage no accesible:', e);
      }
      
      const verifyLocalSession = localStorage.getItem('sidauto_admin');
      const verifySessionSession = sessionStorage.getItem('sidauto_admin');
      
      console.log('📄 localStorage contiene:', !!verifyLocalSession);
      console.log('📄 sessionStorage contiene:', !!verifySessionSession);
      
      if (verifyLocalSession || verifySessionSession) {
        console.log('✅ Sesión verificada antes de redirección');
        console.log('📄 Contenido localStorage:', verifyLocalSession);
        console.log('📄 Contenido sessionStorage:', verifySessionSession);
        
        closeAdminLoginModal();
        
        // Usar replace en lugar de href para evitar problemas de historial
        window.location.replace('admin.html');
      } else {
        console.error('❌ CRÍTICO: Sesión no encontrada en ningún storage antes de redirección');
        console.log('🔍 Contenido completo de localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          console.log(`  ${key}: ${localStorage.getItem(key)}`);
        }
        showAdminLoginError('Error al crear sesión. Intenta nuevamente.');
      }
    }, 2000);
    
  } catch (error) {
    console.error('💥 Error crítico en handleAdminLogin:', error);
    console.log('📋 Stack trace:', error.stack);
    
    showAdminLoginError('Error del sistema. Por favor intenta nuevamente.');
    
    showNotification(
      'error', 
      'Error del Sistema', 
      'Error al verificar las credenciales. Por favor intenta nuevamente.'
    );
  } finally {
    // Rehabilitar botón
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
    
    console.log('🏁 Proceso de login finalizado');
  }
}

// Sistema migrado completamente a Supabase - funciones legacy removidas
