// Variables globales
let allBooks = [];
let filteredBooks = [];
let suggestionsVisible = false;

// Datos de los libros embebidos (solución para CORS)
const booksData = {
  "metadata": {
    "version": "1.0",
    "ultimaActualizacion": "2025-09-11",
    "totalLibros": 8,
    "biblioteca": "SIDAUTO BIBLIOTECA"
  },
  "libros": [
    {
      "id": "LIB001",
      "titulo": "Cien años de soledad",
      "autor": "Gabriel García Márquez",
      "isbn": "9780060883287",
      "editorial": "Harper & Row",
      "año": 1967,
      "genero": "Realismo Mágico",
      "categoria": "Literatura Latinoamericana",
      "ubicacion": "A-1-01",
      "estado": "disponible",
      "descripcion": "Una obra maestra del realismo mágico que narra la historia de la familia Buendía a través de varias generaciones.",
      "portada": "https://covers.openlibrary.org/b/isbn/9780060883287-M.jpg",
      "tags": ["realismo mágico", "familia", "generaciones", "macondo", "clásico"]
    },
    {
      "id": "LIB002",
      "titulo": "Don Quijote de la Mancha",
      "autor": "Miguel de Cervantes",
      "isbn": "9780142437230",
      "editorial": "Penguin Classics",
      "año": 1605,
      "genero": "Novela de Caballería",
      "categoria": "Literatura Española",
      "ubicacion": "A-1-02",
      "estado": "disponible",
      "descripcion": "Las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.",
      "portada": "https://covers.openlibrary.org/b/isbn/9780142437230-M.jpg",
      "tags": ["caballería", "aventura", "hidalgo", "sancho panza", "clásico"]
    },
    {
      "id": "LIB003",
      "titulo": "El Amor en los Tiempos del Cólera",
      "autor": "Gabriel García Márquez",
      "isbn": "9780307389732",
      "editorial": "Vintage Books",
      "año": 1985,
      "genero": "Romance",
      "categoria": "Literatura Latinoamericana",
      "ubicacion": "A-1-03",
      "estado": "disponible",
      "descripcion": "Una historia de amor que trasciende el tiempo y las circunstancias.",
      "portada": "https://covers.openlibrary.org/b/isbn/9780307389732-M.jpg",
      "tags": ["amor", "romance", "tiempo", "cólera", "garcía márquez"]
    },
    {
      "id": "LIB004",
      "titulo": "La Casa de los Espíritus",
      "autor": "Isabel Allende",
      "isbn": "9780553383805",
      "editorial": "Plaza & Janés",
      "año": 1982,
      "genero": "Realismo Mágico",
      "categoria": "Literatura Latinoamericana",
      "ubicacion": "A-1-04",
      "estado": "prestado",
      "fechaDevolucion": "2025-09-20",
      "prestadoA": "María González",
      "descripcion": "Una saga familiar que mezcla realismo mágico con crítica social.",
      "portada": "https://covers.openlibrary.org/b/isbn/9780553383805-M.jpg",
      "tags": ["familia", "espíritus", "saga", "crítica social", "chile"]
    },
    {
      "id": "LIB005",
      "titulo": "El Túnel",
      "autor": "Ernesto Sabato",
      "isbn": "9788432217770",
      "editorial": "Seix Barral",
      "año": 1948,
      "genero": "Novela Psicológica",
      "categoria": "Literatura Argentina",
      "ubicacion": "A-1-05",
      "estado": "disponible",
      "descripcion": "Una novela psicológica que explora la obsesión y la soledad humana.",
      "portada": "https://covers.openlibrary.org/b/isbn/9788432217770-M.jpg",
      "tags": ["psicológica", "obsesión", "soledad", "túnel", "argentina"]
    },
    {
      "id": "LIB006",
      "titulo": "Rayuela",
      "autor": "Julio Cortázar",
      "isbn": "9788437604572",
      "editorial": "Cátedra",
      "año": 1963,
      "genero": "Literatura Experimental",
      "categoria": "Literatura Argentina",
      "ubicacion": "A-1-06",
      "estado": "disponible",
      "descripcion": "Una obra experimental que desafía las convenciones narrativas tradicionales.",
      "portada": "https://covers.openlibrary.org/b/isbn/9788437604572-M.jpg",
      "tags": ["experimental", "rayuela", "cortázar", "narrativa", "vanguardia"]
    },
    {
      "id": "LIB007",
      "titulo": "Pedro Páramo",
      "autor": "Juan Rulfo",
      "isbn": "9780802133908",
      "editorial": "Fondo de Cultura Económica",
      "año": 1955,
      "genero": "Realismo Mágico",
      "categoria": "Literatura Mexicana",
      "ubicacion": "A-1-07",
      "estado": "disponible",
      "descripcion": "Una obra fundamental de la literatura mexicana que narra la búsqueda de un hijo por su padre en un pueblo fantasmal.",
      "portada": "https://covers.openlibrary.org/b/isbn/9780802133908-M.jpg",
      "tags": ["méxico", "fantasmal", "padre", "hijo", "comala"]
    },
    {
      "id": "LIB008",
      "titulo": "Crónica de una Muerte Anunciada",
      "autor": "Gabriel García Márquez",
      "isbn": "9780307475893",
      "editorial": "Vintage Español",
      "año": 1981,
      "genero": "Novela Corta",
      "categoria": "Literatura Latinoamericana",
      "ubicacion": "A-1-08",
      "estado": "reservado",
      "reservadoPor": "Carlos Méndez",
      "fechaReserva": "2025-09-10",
      "descripcion": "Una investigación literaria sobre un crimen anunciado que nadie pudo evitar.",
      "portada": "https://covers.openlibrary.org/b/isbn/9780307475893-M.jpg",
      "tags": ["crónica", "muerte", "crimen", "anunciada", "honor"]
    }
  ],
  "categorias": [
    "Literatura Latinoamericana",
    "Literatura Española", 
    "Literatura Argentina",
    "Literatura Mexicana"
  ],
  "generos": [
    "Realismo Mágico",
    "Novela de Caballería",
    "Romance",
    "Novela Psicológica",
    "Literatura Experimental",
    "Novela Corta"
  ],
  "editoriales": [
    "Harper & Row",
    "Penguin Classics",
    "Vintage Books",
    "Plaza & Janés",
    "Seix Barral",
    "Cátedra",
    "Fondo de Cultura Económica",
    "Vintage Español"
  ],
  "estadisticas": {
    "disponibles": 5,
    "prestados": 1,
    "reservados": 2,
    "total": 8
  }
};

// Cargar libros desde datos embebidos (solución para CORS)
function loadBooksFromJSON() {
  try {
    console.log('✅ Cargando libros desde datos embebidos...');
    
    if (booksData && booksData.libros && Array.isArray(booksData.libros)) {
      allBooks = booksData.libros;
      console.log(`✅ Se cargaron ${allBooks.length} libros exitosamente`);
      
      // Mostrar mensaje de bienvenida por defecto
      displayBooks([]); // Mostrar mensaje de bienvenida
      
      // Mostrar mensaje de bienvenida en contador
      updateSearchResults(0, 'welcome');
      
      // Actualizar estadísticas
      updateBookStatistics();
      
      // Poblar filtros
      populateFilters(booksData);
      
      console.log('📚 Libros disponibles:', allBooks.map(book => book.titulo));
    } else {
      console.error('❌ Estructura de datos incorrecta');
      throw new Error('Estructura de datos incorrecta');
    }
  } catch (error) {
    console.error('❌ Error al cargar libros:', error);
    loadFallbackBooks();
  }
}

// Datos de fallback (simplificados para debug)
function loadFallbackBooks() {
  console.log('🔄 Usando datos de fallback');
  const fallbackData = [
    {
      id: "LIB001",
      titulo: "Cien años de soledad",
      autor: "Gabriel García Márquez",
      editorial: "Harper & Row",
      año: 1967,
      genero: "Realismo Mágico",
      estado: "disponible",
      descripcion: "Una obra maestra del realismo mágico que narra la historia de la familia Buendía a través de varias generaciones.",
      portada: "https://covers.openlibrary.org/b/isbn/9780060883287-M.jpg",
      tags: ["realismo mágico", "familia", "generaciones", "macondo", "clásico"]
    },
    {
      id: "LIB002",
      titulo: "Don Quijote de la Mancha",
      autor: "Miguel de Cervantes",
      editorial: "Penguin Classics",
      año: 1605,
      genero: "Novela de Caballería",
      estado: "disponible",
      descripcion: "Las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.",
      portada: "https://covers.openlibrary.org/b/isbn/9780142437230-M.jpg",
      tags: ["caballería", "aventura", "hidalgo", "sancho panza", "clásico"]
    }
  ];
  
  allBooks = fallbackData;
  filteredBooks = [];
  displayBooks([]);
  updateBookStatistics();
}

// Poblar selectores de filtros
function populateFilters(data) {
  const genreSelect = document.getElementById('genreFilter');
  const editorialSelect = document.getElementById('editorialFilter');
  const yearSelect = document.getElementById('yearFilter');
  
  if (!genreSelect || !editorialSelect || !yearSelect) {
    console.log('⚠️ Algunos selectores de filtros no encontrados');
    return;
  }
  
  // Poblar géneros
  if (data.generos) {
    data.generos.forEach(genero => {
      const option = document.createElement('option');
      option.value = genero;
      option.textContent = genero;
      genreSelect.appendChild(option);
    });
  }
  
  // Poblar editoriales
  if (data.editoriales) {
    data.editoriales.forEach(editorial => {
      const option = document.createElement('option');
      option.value = editorial;
      option.textContent = editorial;
      editorialSelect.appendChild(option);
    });
  }
  
  // Poblar años (únicos, ordenados)
  if (data.libros) {
    const years = [...new Set(data.libros.map(libro => libro.año))].sort((a, b) => b - a);
    years.forEach(año => {
      const option = document.createElement('option');
      option.value = año;
      option.textContent = año;
      yearSelect.appendChild(option);
    });
  }
}

// Crear tarjeta de libro mejorada
function createBookCard(libro) {
  const estadoClass = libro.estado || 'disponible';
  const estadoTexto = {
    'disponible': 'Disponible',
    'prestado': 'Prestado',
    'reservado': 'Reservado'
  }[estadoClass] || 'Disponible';
  
  const fallbackImage = `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2c3e50;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#bookGrad)" rx="8"/>
      <rect x="20" y="30" width="260" height="4" fill="rgba(255,255,255,0.3)" rx="2"/>
      <rect x="20" y="50" width="200" fill="rgba(255,255,255,0.8)" rx="2" height="20"/>
      <rect x="20" y="80" width="160" fill="rgba(255,255,255,0.6)" rx="2" height="16"/>
      <rect x="20" y="350" width="260" height="4" fill="rgba(255,255,255,0.3)" rx="2"/>
      <circle cx="150" cy="200" r="40" fill="rgba(255,255,255,0.2)"/>
      <path d="M130 185 L130 215 L170 200 Z" fill="rgba(255,255,255,0.8)"/>
    </svg>
  `)}`;

  return `
    <div class="book-card" onclick="openBookDetails('${libro.titulo}', '${libro.autor}')">
      <img src="${libro.portada}" alt="${libro.titulo}" class="book-cover" 
           onerror="this.src='${fallbackImage}'" />
      <div class="book-info">
        <div class="book-content">
          <h3 class="book-title">${libro.titulo}</h3>
          <p class="book-author">por ${libro.autor}</p>
          <p class="book-description">${libro.descripcion}</p>
        </div>
        
        <div class="book-footer">
          <div class="book-details">
            <div class="detail-row">
              <span class="detail-label">Editorial:</span>
              <span>${libro.editorial}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Año:</span>
              <span>${libro.año}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Género:</span>
              <span>${libro.genero}</span>
            </div>
          </div>
          
          <div class="book-status ${estadoClass}">${estadoTexto}</div>
        </div>
      </div>
    </div>
  `;
}

// Mostrar libros
function displayBooks(books) {
  const booksGrid = document.getElementById('booksGrid');
  
  if (!booksGrid) return;
  
  if (books.length === 0) {
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
  
  const booksHTML = books.map(book => createBookCard(book)).join('');
  booksGrid.innerHTML = booksHTML;
}

// Actualizar contador de resultados
function updateSearchResults(count, state = 'search') {
  const resultsSpan = document.getElementById('searchResults');
  if (!resultsSpan) return;
  
  switch (state) {
    case 'welcome':
      // Estado inicial - mensaje de bienvenida
      resultsSpan.innerHTML = `Utiliza la búsqueda para explorar nuestra colección`;
      break;
    case 'search':
      // Resultados de búsqueda
      resultsSpan.innerHTML = `Mostrando <strong>${count}</strong> ${count === 1 ? 'libro' : 'libros'}`;
      break;
    case 'no-results':
      // Sin resultados
      resultsSpan.innerHTML = `No se encontraron libros con esos criterios`;
      break;
    case 'total':
      // Mostrar todos los libros (cuando se hace "limpiar filtros")
      resultsSpan.innerHTML = `Mostrando <strong>${count}</strong> ${count === 1 ? 'libro' : 'libros'} de nuestra colección`;
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
      
      applyFilters();
    });
  }
}

// Aplicar filtros de búsqueda
function applyFilters() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const selectedGenre = document.getElementById('genreFilter').value;
  const selectedEditorial = document.getElementById('editorialFilter').value;
  const selectedYear = document.getElementById('yearFilter').value;
  const selectedStatus = document.getElementById('statusFilter').value;
  
  filteredBooks = allBooks.filter(libro => {
    // Búsqueda por texto
    const matchesSearch = query === '' || 
      libro.titulo.toLowerCase().includes(query) ||
      libro.autor.toLowerCase().includes(query) ||
      libro.editorial.toLowerCase().includes(query) ||
      libro.genero.toLowerCase().includes(query) ||
      (libro.tags && libro.tags.some(tag => tag.toLowerCase().includes(query)));
    
    // Filtro por género
    const matchesGenre = selectedGenre === '' || libro.genero === selectedGenre;
    
    // Filtro por editorial
    const matchesEditorial = selectedEditorial === '' || libro.editorial === selectedEditorial;
    
    // Filtro por año
    const matchesYear = selectedYear === '' || libro.año.toString() === selectedYear;
    
    // Filtro por estado
    const matchesStatus = selectedStatus === '' || libro.estado === selectedStatus;
    
    return matchesSearch && matchesGenre && matchesEditorial && matchesYear && matchesStatus;
  });
  
  displayBooks(filteredBooks);
  
  // Determinar el estado del contador basado en los filtros
  const hasActiveFilters = query || selectedGenre || selectedEditorial || selectedYear || selectedStatus;
  
  if (!hasActiveFilters) {
    // No hay filtros activos - estado de bienvenida
    updateSearchResults(0, 'welcome');
  } else if (filteredBooks.length === 0) {
    // Hay filtros pero no resultados
    updateSearchResults(0, 'no-results');
  } else if (filteredBooks.length === allBooks.length) {
    // Mostrando todos los libros (por ejemplo, búsqueda muy general)
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
  
  console.log('📊 Estadísticas actualizadas:', stats);
  
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
  const maxSuggestions = 6;
  
  // Búsqueda por título
  allBooks.forEach(book => {
    if (book.titulo.toLowerCase().includes(query)) {
      suggestions.push({
        query: book.titulo,
        display: `<strong>${highlightMatch(book.titulo, query)}</strong>`,
        type: 'title',
        typeText: `por ${book.autor}`,
        icon: '📖'
      });
    }
  });
  
  // Búsqueda por autor
  const authors = [...new Set(allBooks.map(book => book.autor))];
  authors.forEach(author => {
    if (author.toLowerCase().includes(query)) {
      const bookCount = allBooks.filter(book => book.autor === author).length;
      suggestions.push({
        query: author,
        display: `<strong>${highlightMatch(author, query)}</strong>`,
        type: 'author',
        typeText: `${bookCount} libro${bookCount > 1 ? 's' : ''}`,
        icon: '👤'
      });
    }
  });
  
  // Búsqueda por género
  const genres = [...new Set(allBooks.map(book => book.genero))];
  genres.forEach(genre => {
    if (genre.toLowerCase().includes(query)) {
      const bookCount = allBooks.filter(book => book.genero === genre).length;
      suggestions.push({
        query: genre,
        display: `<strong>${highlightMatch(genre, query)}</strong>`,
        type: 'genre',
        typeText: `${bookCount} libro${bookCount > 1 ? 's' : ''}`,
        icon: '📚'
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

// Función para mostrar detalles del libro (placeholder)
function openBookDetails(title, author) {
  alert(`Detalles del libro:\n\nTítulo: ${title}\nAutor: ${author}\n\n¡Próximamente más funcionalidades!`);
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

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Cargar libros desde JSON
  loadBooksFromJSON();
  
  // Inicializar sistema de búsqueda
  initSearchSystem();
  
  // Inicializar búsqueda rápida del navbar
  initQuickSearch();
  
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
