// Variables globales
let allBooks = [];
let filteredBooks = [];
let suggestionsVisible = false;

// Variables de paginación
let currentPage = 1;
let itemsPerPage = 20;
let totalPages = 1;

// Cargar libros desde el archivo JSON actualizado
async function loadBooksFromJSON() {
  try {
    console.log('✅ Cargando libros desde JSON actualizado...');
    
    const response = await fetch('./data/libros.json');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const rawData = await response.json();
    console.log('📚 Datos cargados desde JSON:', `${rawData.length} registros`);
    
    // Transformar los datos del nuevo formato al formato esperado
    allBooks = rawData.map((item, index) => ({
      id: `LIB${String(item.No).padStart(3, '0')}`,
      titulo: item['TITULO\n245$A'] || 'Sin título',
      autor: item['AUTOR\n1XX'] || 'Autor desconocido',
      isbn: item['ISBN\n020$A'] || '',
      editorial: item['EDITORIAL \n264$B'] || 'Editorial desconocida',
      año: parseInt(item['AÑO DE PUBLICACIÓN']) || 0,
      genero: item['MATERIA'] || 'Sin clasificar',
      categoria: item['MATERIA'] || 'General',
      ubicacion: item['UBICACIÓN '] || 'No especificada',
      codigo: item['CÓDIGO'] || '',
      estado: 'disponible', // Por defecto disponible
      descripcion: `Libro de ${item['MATERIA'] || 'literatura'} publicado en ${item['AÑO DE PUBLICACIÓN'] || 'fecha desconocida'}.`,
      fechaAdquisicion: item['FECHA DE ADQUISICIÓN '] || '',
      edicion: item['No. EDICION\n'] || '1era',
      cantidad: item['CANTIDAD '] || '1',
      tags: [
        item['MATERIA']?.toLowerCase(),
        item['AUTOR\n1XX']?.split(' ')[0]?.toLowerCase(),
        item['AÑO DE PUBLICACIÓN']
      ].filter(Boolean)
    }));
    
    console.log(`✅ Se transformaron ${allBooks.length} libros exitosamente`);
    
    // Mostrar mensaje de bienvenida por defecto
    displayBooks([]);
    
    // Mostrar mensaje de bienvenida en contador
    updateSearchResults(0, 'welcome');
    
    // Actualizar estadísticas
    updateBookStatistics();
    
    // Poblar filtros con las nuevas categorías
    populateFiltersFromBooks();
    
    console.log('📚 Libros disponibles:', allBooks.slice(0, 5).map(book => book.titulo));
    console.log(`📊 Total de libros: ${allBooks.length}`);
    
  } catch (error) {
    console.error('❌ Error al cargar libros:', error);
    loadFallbackBooks();
  }
}

// Datos de fallback (simplificados para debug)
// Datos de fallback (mensaje de error si JSON no carga)
function loadFallbackBooks() {
  console.log('🔄 Usando datos de fallback');
  
  allBooks = [
    {
      id: 'FALL001',
      titulo: 'Error de Carga - JSON no disponible',
      autor: 'Sistema SIDAUTO',
      isbn: '',
      editorial: 'Sistema',
      año: 2025,
      genero: 'Sistema',
      categoria: 'Error',
      ubicacion: 'N/A',
      codigo: 'ERROR001',
      estado: 'error',
      descripcion: 'No se pudo cargar la base de datos de libros. Verifica que el archivo data/libros.json esté disponible.',
      fechaAdquisicion: '',
      edicion: '1era',
      cantidad: '0',
      tags: ['error', 'sistema', 'json']
    }
  ];
  
  filteredBooks = [];
  displayBooks([]);
  updateBookStatistics();
  updateSearchResults(0, 'error');
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

// Crear tarjeta de libro actualizada para la nueva estructura
function createBookCard(libro) {
  const estadoClass = libro.estado || 'disponible';
  const estadoTexto = {
    'disponible': '✅ Disponible',
    'prestado': '📤 Prestado',
    'reservado': '📋 Reservado',
    'sistema': '⚙️ Sistema',
    'error': '❌ Error'
  }[estadoClass] || '✅ Disponible';
  
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

  // Limpiar y formatear datos
  const titulo = (libro.titulo || 'Sin título').replace(/\n/g, ' ').trim();
  const autor = (libro.autor || 'Autor desconocido').replace(/\n/g, ' ').trim();
  const editorial = (libro.editorial || 'Editorial desconocida').replace(/\n/g, ' ').trim();
  const año = libro.año && libro.año > 0 ? libro.año : 'N/D';
  const genero = (libro.genero || 'Sin clasificar').replace(/\n/g, ' ').trim();
  const ubicacion = (libro.ubicacion || 'No especificada').replace(/\n/g, ' ').trim();
  const codigo = (libro.codigo || libro.id || 'N/A').replace(/\n/g, ' ').trim();

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
          <p class="book-description">${libro.descripcion || `Libro de ${genero.toLowerCase()} disponible en ${ubicacion}`}</p>
        </div>
        
        <div class="book-footer">
          <div class="book-details">
            <div class="detail-row">
              <span class="detail-label">📏 Editorial:</span>
              <span>${editorial}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Año:</span>
              <span>${año}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📂 Materia:</span>
              <span>${genero}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📍 Ubicación:</span>
              <span>${ubicacion}</span>
            </div>
            ${libro.isbn ? `
            <div class="detail-row">
              <span class="detail-label">🔍 ISBN:</span>
              <span>${libro.isbn}</span>
            </div>` : ''}
          </div>
          
          <div class="book-status ${estadoClass}">${estadoTexto}</div>
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
    if (libro.estado === 'disponible') {
      stats.disponibles++;
    } else if (libro.estado === 'prestado') {
      stats.prestados++;
    } else if (libro.estado === 'reservado') {
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
  quickSearchInput.parentNode.appendChild(suggestionsContainer);
  
  // Búsqueda con sugerencias (independiente)
  quickSearchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase().trim();
    
    if (query.length > 0) {
      showSuggestions(query, suggestionsContainer);
    } else {
      hideSuggestions(suggestionsContainer);
    }
  });
  
  // Navegación con teclado
  quickSearchInput.addEventListener('keydown', function(e) {
    handleKeyNavigation(e, suggestionsContainer);
  });
  
  // Ocultar sugerencias al perder foco (con delay para permitir clics)
  quickSearchInput.addEventListener('blur', function() {
    setTimeout(() => {
      hideSuggestions(suggestionsContainer);
    }, 150);
  });
  
  // Ocultar sugerencias con ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideSuggestions(suggestionsContainer);
      quickSearchInput.blur();
    }
  });
  
  // Al hacer Enter, ejecutar búsqueda y ir a la sección
  quickSearchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = this.value.trim();
      if (query.length > 0) {
        executeSearch(query);
        hideSuggestions(suggestionsContainer);
      }
    }
  });
}

// Crear contenedor de sugerencias
function createSuggestionsContainer() {
  const container = document.createElement('div');
  container.className = 'search-suggestions-popup';
  container.style.display = 'none';
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
  
  const detalles = `
📚 DETALLES DEL LIBRO

📖 Título: ${libro.titulo || 'Sin título'}
👤 Autor: ${libro.autor || 'Autor desconocido'}
🏢 Editorial: ${libro.editorial || 'Editorial desconocida'}
📅 Año: ${libro.año && libro.año > 0 ? libro.año : 'No especificado'}
📂 Materia: ${libro.genero || 'Sin clasificar'}
📍 Ubicación: ${libro.ubicacion || 'No especificada'}
🔍 Código: ${libro.codigo || libro.id || 'N/A'}
${libro.isbn ? `📚 ISBN: ${libro.isbn}` : ''}
${libro.edicion ? `📄 Edición: ${libro.edicion}` : ''}
${libro.cantidad ? `📊 Cantidad: ${libro.cantidad}` : ''}

📝 Descripción: ${libro.descripcion || 'Sin descripción disponible'}

🎯 Estado: ${libro.estado === 'disponible' ? '✅ Disponible' : 
             libro.estado === 'prestado' ? '📤 Prestado' : 
             libro.estado === 'reservado' ? '📋 Reservado' : '❓ No definido'}

${libro.fechaAdquisicion ? `📆 Fecha de adquisición: ${libro.fechaAdquisicion}` : ''}

¡Próximamente más funcionalidades!
  `.trim();
  
  alert(detalles);
}

// Navegación suave
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 70; // Altura del navbar
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
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
document.addEventListener('DOMContentLoaded', function() {
  // Cargar libros desde JSON
  loadBooksFromJSON();
  
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

// Función para intentar cargar libros desde Open Library API (opcional)
async function loadBooksFromAPI() {
  try {
    const response = await fetch('https://openlibrary.org/subjects/fiction.json?limit=6');
    const data = await response.json();
    
    if (data.works && data.works.length > 0) {
      const apiBooks = data.works.map(work => ({
        title: work.title,
        author: work.authors && work.authors.length > 0 ? work.authors[0].name : 'Autor desconocido',
        description: work.first_sentence ? work.first_sentence.join(' ') : 'Descripción no disponible.',
        cover: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : null
      }));
      
      return apiBooks;
    }
  } catch (error) {
    console.log('No se pudieron cargar libros de la API, usando datos locales:', error);
  }
  
  return booksData; // Fallback a datos locales
}

// Puedes descomentar esta línea si quieres probar la API
// loadBooksFromAPI().then(books => console.log('Libros cargados:', books));
