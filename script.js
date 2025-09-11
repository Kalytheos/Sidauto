// Datos de libros de ejemplo (simulando una API)
const booksData = [
  {
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    description: "Una obra maestra del realismo mágico que narra la historia de la familia Buendía a través de varias generaciones.",
    cover: "https://covers.openlibrary.org/b/isbn/9780060883287-M.jpg"
  },
  {
    title: "Don Quijote de la Mancha",
    author: "Miguel de Cervantes",
    description: "Las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.",
    cover: "https://covers.openlibrary.org/b/isbn/9780142437230-M.jpg"
  },
  {
    title: "El Amor en los Tiempos del Cólera",
    author: "Gabriel García Márquez",
    description: "Una historia de amor que trasciende el tiempo y las circunstancias.",
    cover: "https://covers.openlibrary.org/b/isbn/9780307389732-M.jpg"
  },
  {
    title: "La Casa de los Espíritus",
    author: "Isabel Allende",
    description: "Una saga familiar que mezcla realismo mágico con crítica social.",
    cover: "https://covers.openlibrary.org/b/isbn/9780553383805-M.jpg"
  },
  {
    title: "El Túnel",
    author: "Ernesto Sabato",
    description: "Una novela psicológica que explora la obsesión y la soledad humana.",
    cover: "https://covers.openlibrary.org/b/isbn/9788432217770-M.jpg"
  },
  {
    title: "Rayuela",
    author: "Julio Cortázar",
    description: "Una obra experimental que desafía las convenciones narrativas tradicionales.",
    cover: "https://covers.openlibrary.org/b/isbn/9788437604572-M.jpg"
  },
  {
    title: "Pedro Páramo",
    author: "Juan Rulfo",
    description: "Una obra fundamental de la literatura mexicana que narra la búsqueda de un hijo por su padre en un pueblo fantasmal.",
    cover: "https://covers.openlibrary.org/b/isbn/9780802133908-M.jpg"
  },
  {
    title: "Crónica de una Muerte Anunciada",
    author: "Gabriel García Márquez",
    description: "Una investigación literaria sobre un crimen anunciado que nadie pudo evitar.",
    cover: "https://covers.openlibrary.org/b/isbn/9780307475893-M.jpg"
  }
];

// Función para crear una tarjeta de libro
function createBookCard(book) {
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
    <div class="book-card" onclick="openBookDetails('${book.title}', '${book.author}')">
      <img src="${book.cover}" alt="${book.title}" class="book-cover" 
           onerror="this.src='${fallbackImage}'" />
      <div class="book-info">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">por ${book.author}</p>
        <p class="book-description">${book.description}</p>
      </div>
    </div>
  `;
}

// Función para cargar los libros
function loadBooks() {
  const booksGrid = document.getElementById('booksGrid');
  
  // Simular carga asíncrona
  setTimeout(() => {
    const booksHTML = booksData.map(book => createBookCard(book)).join('');
    booksGrid.innerHTML = booksHTML;
  }, 1000);
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
  loadBooks();
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
