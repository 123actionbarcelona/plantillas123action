// Estado de la aplicación
let templates = [];
let filteredTemplates = [];
let categories = [];
let tags = [];
let selectedCategory = 'all';
let selectedTags = new Set();
let editingId = null;
let authToken = null;
let currentUser = null;

// URL de la API (cambiar según tu configuración)
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

// =================================
// FUNCIONES DE AUTENTICACIÓN
// =================================

// Inicializar autenticación
async function initAuth() {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    authToken = token;
    try {
      const isValid = await verifyToken();
      if (isValid) {
        showMainApp();
        return;
      }
    } catch (error) {
      console.log('Token inválido, redirigiendo a login');
    }
  }
  
  showLoginScreen();
}

// Verificar token con el servidor
async function verifyToken() {
  try {
    const response = await fetch(`${API_URL}/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Mostrar pantalla de login
function showLoginScreen() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
  setupLoginListeners();
}

// Mostrar aplicación principal
function showMainApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  
  // Actualizar info del usuario
  if (currentUser) {
    document.getElementById('userInfo').textContent = currentUser.username;
  }
  
  setupEventListeners();
  loadTemplates();
  loadCategories();
  loadTags();
  updateStats();
  
  // Auto-actualizar cada 30 segundos para sincronización
  setInterval(() => {
    loadTemplates(true);
  }, 30000);
}

// Configurar listeners del login
function setupLoginListeners() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Manejar login
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  
  // Mostrar estado de carga
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Iniciando sesión...';
  loginBtn.disabled = true;
  loginError.classList.add('hidden');
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Login exitoso
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      
      showToast('Login exitoso', 'success');
      showMainApp();
    } else {
      // Error en login
      loginError.textContent = data.error;
      loginError.classList.remove('hidden');
    }
  } catch (error) {
    loginError.textContent = 'Error de conexión. Verifica que el servidor esté ejecutándose.';
    loginError.classList.remove('hidden');
  } finally {
    // Restaurar botón
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i><span>Iniciar Sesión</span>';
    loginBtn.disabled = false;
  }
}

// Logout
function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  templates = [];
  filteredTemplates = [];
  showLoginScreen();
  showToast('Sesión cerrada exitosamente', 'success');
}

// Obtener headers con autenticación
function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

// Manejar errores de autenticación
function handleAuthError(response) {
  if (response.status === 401 || response.status === 403) {
    logout();
    return true;
  }
  return false;
}

// =================================
// CONFIGURACIÓN DE EVENT LISTENERS
// =================================

// Configurar event listeners
function setupEventListeners() {
  // Botón logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Botón gestionar usuarios
  document.getElementById('manageUsersBtn').addEventListener('click', openUserManagement);
  
  // Botón gestionar categorías
  const manageCatBtn = document.getElementById('manageCategoriesBtn');
  if (manageCatBtn) {
    manageCatBtn.addEventListener('click', openCategoriesModal);
    console.log('Event listener añadido a manageCategoriesBtn');
  } else {
    console.error('Botón manageCategoriesBtn no encontrado');
  }
  
  // Botón agregar plantilla
  document.getElementById('addTemplateBtn').addEventListener('click', () => {
    openAddModal();
  });

  // Formulario agregar plantilla
  document.getElementById('addTemplateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addTemplate();
  });

  // Formulario editar plantilla
  document.getElementById('editTemplateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    updateTemplate();
  });

  // Botones cancelar
  document.getElementById('cancelAddBtn').addEventListener('click', closeAddModal);
  document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);

  // Click fuera del modal para cerrar
  document.getElementById('addTemplateModal').addEventListener('click', (e) => {
    if (e.target.id === 'addTemplateModal') {
      closeAddModal();
    }
  });

  document.getElementById('editTemplateModal').addEventListener('click', (e) => {
    if (e.target.id === 'editTemplateModal') {
      closeEditModal();
    }
  });

  // Búsqueda
  document.getElementById('searchBtn').addEventListener('click', toggleSearch);
  document.getElementById('clearSearch').addEventListener('click', clearSearch);
  document.getElementById('searchInput').addEventListener('input', (e) => {
    filterTemplates(e.target.value);
  });
}

// Cargar plantillas desde el servidor
async function loadTemplates(silent = false) {
  if (!silent) showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/templates`, {
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    if (!response.ok) throw new Error('Error al cargar plantillas');
    
    templates = await response.json();
    filteredTemplates = [...templates];
    renderTemplates();
    
    if (!silent) {
      showToast('Plantillas cargadas exitosamente');
    }
  } catch (error) {
    console.error('Error cargando plantillas:', error);
    if (!silent) {
      showToast('Error al cargar plantillas. Intentando modo offline...', 'error');
      loadOfflineTemplates();
    }
  } finally {
    showLoading(false);
  }
}

// Cargar plantillas offline (fallback)
function loadOfflineTemplates() {
  const stored = localStorage.getItem('emailTemplates_backup');
  if (stored) {
    templates = JSON.parse(stored);
    filteredTemplates = [...templates];
    renderTemplates();
    showToast('Modo offline activado', 'warning');
  }
}

// Guardar backup local
function saveBackup() {
  localStorage.setItem('emailTemplates_backup', JSON.stringify(templates));
}

// Renderizar plantillas
function renderTemplates() {
  const grid = document.getElementById('templatesGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (filteredTemplates.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  grid.innerHTML = filteredTemplates.map((template) => {
    const categoryColor = template.category_color || '#6b7280';
    const categoryName = template.category_name || 'Sin categoría';
    const categoryIcon = template.category_icon || '';
    
    return `
      <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden template-card relative" data-id="${template.id}">
        <div class="category-border" style="background-color: ${categoryColor}"></div>
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="category-badge" style="background-color: ${categoryColor}20; color: ${categoryColor}">
                  ${categoryIcon ? `<i class="fas ${categoryIcon} text-xs"></i>` : ''}
                  ${escapeHtml(categoryName)}
                </span>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">${escapeHtml(template.title)}</h3>
              <p class="text-gray-600 text-sm">${escapeHtml(template.description)}</p>
              ${template.tags && template.tags.length > 0 ? `
                <div class="template-tags">
                  ${template.tags.map(tag => `
                    <span class="template-tag" 
                          style="background-color: ${tag.color}20; color: ${tag.color}"
                          onclick="toggleTagFilter('${tag.id}')">
                      ${tag.icon ? `<i class="fas ${tag.icon}"></i>` : ''}
                      ${escapeHtml(tag.name)}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div class="flex gap-2">
              <button onclick="showQuickCategoryMenu(event, '${template.id}')" 
                class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Cambiar categoría">
                <i class="fas fa-tag"></i>
              </button>
              <button onclick="editTemplate('${template.id}')" 
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="window.location.href='editor.html?edit=${template.id}'" 
                class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Editor Visual">
                <i class="fas fa-magic"></i>
              </button>
              <button onclick="deleteTemplate('${template.id}')" 
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
              <button onclick="syncTemplate('${template.id}')" 
                class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Sincronizar">
                <i class="fas fa-sync"></i>
              </button>
            </div>
          </div>
          
          <div class="template-preview bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <iframe srcdoc="${template.html.replace(/"/g, '&quot;')}" 
              class="w-full h-48 rounded border-0"></iframe>
          </div>
          
          <div class="flex gap-2">
            <button onclick="copyTemplate('${template.id}')" 
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <i class="fas fa-copy"></i>
              Copiar Código
            </button>
            <button onclick="sendEmailWithTemplate('${template.id}')" 
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <i class="fas fa-paper-plane"></i>
              Enviar Email
            </button>
            <button onclick="previewTemplate('${template.id}')" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          
          ${template.updated_at ? `
            <div class="mt-3 text-xs text-gray-500 text-right">
              <i class="fas fa-clock"></i> Actualizado: ${new Date(template.updated_at).toLocaleString()}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  saveBackup();
}

// Agregar nueva plantilla
async function addTemplate() {
  const title = document.getElementById('templateTitle').value;
  const description = document.getElementById('templateDescription').value;
  const html = document.getElementById('templateHTML').value;
  const category_id = document.getElementById('templateCategory').value || null;
  const tagIds = getSelectedTags('templateTags');
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, html, category_id })
    });
    
    if (handleAuthError(response)) return;
    if (!response.ok) throw new Error('Error al crear plantilla');
    
    const newTemplate = await response.json();
    
    // Asignar tags si hay alguno seleccionado
    if (tagIds.length > 0) {
      await fetch(`${API_URL}/templates/${newTemplate.id}/tags`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tagIds })
      });
      // Recargar para obtener los tags
      await loadTemplates();
    } else {
      templates.unshift(newTemplate);
      filteredTemplates = [...templates];
      renderTemplates();
    }
    
    closeAddModal();
    showToast('Plantilla agregada exitosamente');
    updateStats();
    
    // Limpiar formulario
    document.getElementById('addTemplateForm').reset();
  } catch (error) {
    console.error('Error agregando plantilla:', error);
    showToast('Error al agregar plantilla', 'error');
  } finally {
    showLoading(false);
  }
}

// Editar plantilla
async function editTemplate(id) {
  const template = templates.find(t => t.id === id);
  if (!template) return;
  
  editingId = id;
  
  document.getElementById('editTemplateTitle').value = template.title;
  document.getElementById('editTemplateDescription').value = template.description;
  document.getElementById('editTemplateHTML').value = template.html;
  
  // Cargar categoría si existe
  const categorySelect = document.getElementById('editTemplateCategory');
  if (categorySelect) {
    categorySelect.value = template.category_id || '';
  }
  
  // Cargar tags seleccionados
  const templateTagIds = template.tags ? template.tags.map(t => t.id) : [];
  setSelectedTags('editTemplateTags', templateTagIds);
  
  document.getElementById('editTemplateModal').classList.remove('hidden');
}

// Actualizar plantilla
async function updateTemplate() {
  if (!editingId) return;
  
  const title = document.getElementById('editTemplateTitle').value;
  const description = document.getElementById('editTemplateDescription').value;
  const html = document.getElementById('editTemplateHTML').value;
  const category_id = document.getElementById('editTemplateCategory')?.value || null;
  const tagIds = getSelectedTags('editTemplateTags');
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/templates/${editingId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, html, category_id })
    });
    
    if (handleAuthError(response)) return;
    if (!response.ok) throw new Error('Error al actualizar plantilla');
    
    const updatedTemplate = await response.json();
    
    // Actualizar tags
    await fetch(`${API_URL}/templates/${editingId}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tagIds })
    });
    
    // Recargar plantillas para obtener los tags actualizados
    await loadTemplates();
    
    closeEditModal();
    showToast('Plantilla actualizada exitosamente');
    updateStats();
  } catch (error) {
    console.error('Error actualizando plantilla:', error);
    showToast('Error al actualizar plantilla', 'error');
  } finally {
    showLoading(false);
  }
}

// Eliminar plantilla
async function deleteTemplate(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla? Esta acción se sincronizará en todos los dispositivos.')) {
    return;
  }
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    if (!response.ok) throw new Error('Error al eliminar plantilla');
    
    templates = templates.filter(t => t.id !== id);
    filteredTemplates = [...templates];
    renderTemplates();
    showToast('Plantilla eliminada exitosamente', 'error');
    updateStats();
  } catch (error) {
    console.error('Error eliminando plantilla:', error);
    showToast('Error al eliminar plantilla', 'error');
  } finally {
    showLoading(false);
  }
}

// Sincronizar plantilla individual
async function syncTemplate(id) {
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    if (!response.ok) throw new Error('Error al sincronizar');
    
    const updatedTemplate = await response.json();
    const index = templates.findIndex(t => t.id === id);
    
    if (index !== -1) {
      templates[index] = updatedTemplate;
      filteredTemplates = [...templates];
      renderTemplates();
      showToast('Plantilla sincronizada');
    }
  } catch (error) {
    console.error('Error sincronizando:', error);
    showToast('Error al sincronizar', 'error');
  } finally {
    showLoading(false);
  }
}

// Copiar al portapapeles
function copyTemplate(id) {
  const template = templates.find(t => t.id === id);
  if (!template) return;
  
  navigator.clipboard.writeText(template.html).then(() => {
    showToast('Código copiado al portapapeles');
  }).catch(err => {
    console.error('Error al copiar:', err);
    showToast('Error al copiar el código', 'error');
  });
}

// Vista previa en nueva ventana
function previewTemplate(id) {
  const template = templates.find(t => t.id === id);
  if (!template) return;
  
  const win = window.open('', '_blank');
  win.document.write(template.html);
  win.document.close();
}

// Filtrar plantillas
function filterTemplates(query) {
  if (!query) {
    filteredTemplates = [...templates];
  } else {
    const searchTerm = query.toLowerCase();
    filteredTemplates = templates.filter(template => 
      template.title.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm)
    );
  }
  renderTemplates();
}

// Toggle búsqueda
function toggleSearch() {
  const searchBar = document.getElementById('searchBar');
  searchBar.classList.toggle('hidden');
  if (!searchBar.classList.contains('hidden')) {
    document.getElementById('searchInput').focus();
  }
}

// Limpiar búsqueda
function clearSearch() {
  document.getElementById('searchInput').value = '';
  filterTemplates('');
  document.getElementById('searchBar').classList.add('hidden');
}

// Actualizar estadísticas
async function updateStats() {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    if (!response.ok) throw new Error('Error al cargar estadísticas');
    
    const stats = await response.json();
    
    document.getElementById('totalTemplates').textContent = stats.total;
    
    if (stats.lastUpdate) {
      const date = new Date(stats.lastUpdate);
      document.getElementById('lastUpdate').textContent = date.toLocaleDateString('es-ES');
    }
    
    const sizeInKB = (stats.totalSize / 1024).toFixed(2);
    document.getElementById('storageUsed').textContent = `${sizeInKB} KB`;
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

// Modal functions
function openAddModal() {
  document.getElementById('addTemplateModal').classList.remove('hidden');
  document.getElementById('templateTitle').focus();
}

function closeAddModal() {
  document.getElementById('addTemplateModal').classList.add('hidden');
  document.getElementById('addTemplateForm').reset();
}

function closeEditModal() {
  document.getElementById('editTemplateModal').classList.add('hidden');
  editingId = null;
}

// Mostrar indicador de carga
function showLoading(show) {
  const existingLoader = document.getElementById('loadingIndicator');
  
  if (show) {
    if (!existingLoader) {
      const loader = document.createElement('div');
      loader.id = 'loadingIndicator';
      loader.className = 'fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
      loader.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>Sincronizando...</span>
      `;
      document.body.appendChild(loader);
    }
  } else {
    if (existingLoader) {
      existingLoader.remove();
    }
  }
}

// Mostrar notificación toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  
  // Cambiar color según el tipo
  let bgColor = 'bg-green-600';
  let icon = 'fa-check-circle';
  
  if (type === 'error') {
    bgColor = 'bg-red-600';
    icon = 'fa-exclamation-circle';
  } else if (type === 'warning') {
    bgColor = 'bg-yellow-600';
    icon = 'fa-exclamation-triangle';
  }
  
  toast.className = `fixed bottom-8 right-8 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg toast z-50 flex items-center gap-3`;
  toast.querySelector('i').className = `fas ${icon}`;
  
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Función para escapar HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Verificar conexión con el servidor
async function checkServerConnection() {
  try {
    const response = await fetch(`${API_URL}/templates`);
    return response.ok;
  } catch {
    return false;
  }
}

// Verificar conexión al cargar
checkServerConnection().then(isConnected => {
  if (!isConnected) {
    showToast('No se puede conectar al servidor. Modo offline activado.', 'warning');
    loadOfflineTemplates();
  }
});

// =================================
// GESTIÓN DE USUARIOS
// =================================

let users = [];
let editingUserId = null;

// Abrir modal de gestión de usuarios
async function openUserManagement() {
  document.getElementById('userManagementModal').classList.remove('hidden');
  await loadUsers();
  setupUserManagementListeners();
}

// Cerrar modal de gestión de usuarios
function closeUserManagement() {
  document.getElementById('userManagementModal').classList.add('hidden');
  document.getElementById('createUserForm').reset();
}

// Cerrar modal de edición de usuario
function closeEditUser() {
  document.getElementById('editUserModal').classList.add('hidden');
  document.getElementById('editUserForm').reset();
  editingUserId = null;
}

// Configurar listeners de gestión de usuarios
function setupUserManagementListeners() {
  // Solo configurar una vez
  if (document.getElementById('createUserForm').hasEventListener) return;
  
  // Marcar que ya tiene listeners
  document.getElementById('createUserForm').hasEventListener = true;
  
  // Crear usuario
  document.getElementById('createUserForm').addEventListener('submit', handleCreateUser);
  
  // Editar usuario
  document.getElementById('editUserForm').addEventListener('submit', handleEditUser);
  
  // Cerrar modales
  document.getElementById('closeUserModal').addEventListener('click', closeUserManagement);
  document.getElementById('cancelEditUser').addEventListener('click', closeEditUser);
  
  // Click fuera del modal para cerrar
  document.getElementById('userManagementModal').addEventListener('click', (e) => {
    if (e.target.id === 'userManagementModal') {
      closeUserManagement();
    }
  });
  
  document.getElementById('editUserModal').addEventListener('click', (e) => {
    if (e.target.id === 'editUserModal') {
      closeEditUser();
    }
  });
}

// Cargar usuarios desde el servidor
async function loadUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    if (!response.ok) throw new Error('Error al cargar usuarios');
    
    users = await response.json();
    renderUsers();
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    showToast('Error al cargar usuarios', 'error');
  }
}

// Renderizar lista de usuarios
function renderUsers() {
  const usersList = document.getElementById('usersList');
  
  if (users.length === 0) {
    usersList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-users text-4xl mb-4"></i>
        <p>No hay usuarios adicionales</p>
      </div>
    `;
    return;
  }
  
  usersList.innerHTML = users.map(user => {
    const isCurrentUser = user.id === currentUser.id;
    const createdDate = new Date(user.created_at).toLocaleDateString('es-ES');
    
    return `
      <div class="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-purple-600 text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-800">${escapeHtml(user.username)}</span>
              ${isCurrentUser ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Tú</span>' : ''}
            </div>
            ${user.email ? `<p class="text-gray-600 text-sm"><i class="fas fa-envelope mr-1"></i>${escapeHtml(user.email)}</p>` : ''}
            <p class="text-gray-500 text-xs">Creado: ${createdDate}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="editUser('${user.id}')" 
            class="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center gap-1"
            title="Editar usuario">
            <i class="fas fa-edit"></i>
            <span class="hidden md:inline">Editar</span>
          </button>
          ${!isCurrentUser ? `
            <button onclick="deleteUser('${user.id}', '${escapeHtml(user.username)}')" 
              class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
              title="Eliminar usuario">
              <i class="fas fa-trash"></i>
              <span class="hidden md:inline">Eliminar</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Manejar creación de usuario
async function handleCreateUser(e) {
  e.preventDefault();
  
  const username = document.getElementById('newUsername').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const password = document.getElementById('newPassword').value;
  
  if (password.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, email, password })
    });
    
    if (handleAuthError(response)) return;
    
    const data = await response.json();
    
    if (!response.ok) {
      showToast(data.error, 'error');
      return;
    }
    
    users.unshift(data);
    renderUsers();
    document.getElementById('createUserForm').reset();
    showToast('Usuario creado exitosamente', 'success');
    
  } catch (error) {
    console.error('Error creando usuario:', error);
    showToast('Error al crear usuario', 'error');
  } finally {
    showLoading(false);
  }
}

// Editar usuario
async function editUser(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;
  
  editingUserId = id;
  document.getElementById('editUserId').value = id;
  document.getElementById('editUsername').value = user.username;
  document.getElementById('editEmail').value = user.email || '';
  document.getElementById('editPassword').value = '';
  
  document.getElementById('editUserModal').classList.remove('hidden');
}

// Manejar edición de usuario
async function handleEditUser(e) {
  e.preventDefault();
  
  if (!editingUserId) return;
  
  const username = document.getElementById('editUsername').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const password = document.getElementById('editPassword').value;
  
  if (password && password.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }
  
  showLoading(true);
  
  try {
    const payload = { username, email };
    if (password) {
      payload.password = password;
    }
    
    const response = await fetch(`${API_URL}/users/${editingUserId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    
    if (handleAuthError(response)) return;
    
    const data = await response.json();
    
    if (!response.ok) {
      showToast(data.error, 'error');
      return;
    }
    
    const index = users.findIndex(u => u.id === editingUserId);
    if (index !== -1) {
      users[index] = data;
      renderUsers();
    }
    
    closeEditUser();
    showToast('Usuario actualizado exitosamente', 'success');
    
    // Si es el usuario actual, actualizar la info del header
    if (editingUserId === currentUser.id) {
      currentUser = { ...currentUser, ...data };
      document.getElementById('userInfo').textContent = currentUser.username;
    }
    
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    showToast('Error al actualizar usuario', 'error');
  } finally {
    showLoading(false);
  }
}

// Eliminar usuario
async function deleteUser(id, username) {
  if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"?`)) {
    return;
  }
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    
    if (!response.ok) {
      const data = await response.json();
      showToast(data.error, 'error');
      return;
    }
    
    users = users.filter(u => u.id !== id);
    renderUsers();
    showToast('Usuario eliminado exitosamente', 'error');
    
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    showToast('Error al eliminar usuario', 'error');
  } finally {
    showLoading(false);
  }
}

// =================================
// FUNCIONES DE ENVÍO DE EMAIL
// =================================

// Obtener variables de una plantilla
async function getTemplateVariables(templateId) {
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}/variables`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText);
      throw new Error('Error obteniendo variables');
    }
    
    const data = await response.json();
    console.log('Variables detectadas para plantilla', templateId, ':', data.variables);
    return data.variables || [];
  } catch (error) {
    console.error('Error obteniendo variables:', error);
    return [];
  }
}

// Función principal para enviar email con plantilla
async function sendEmailWithTemplate(templateId) {
  const template = templates.find(t => t.id === templateId);
  if (!template) {
    console.error('Plantilla no encontrada:', templateId);
    return;
  }
  
  console.log('Enviando email con plantilla:', template.title);
  
  // Primero obtener las variables de la plantilla
  const variables = await getTemplateVariables(templateId);
  console.log('Variables obtenidas:', variables);
  
  // Crear y mostrar el modal de envío
  showEmailModal(template, variables);
}

// Mostrar modal de envío de email
function showEmailModal(template, variables) {
  console.log('showEmailModal llamado con variables:', variables);
  
  // Asegurar que variables es un array
  if (!Array.isArray(variables)) {
    console.warn('Variables no es un array, convirtiendo:', variables);
    variables = [];
  }
  
  // Crear el modal si no existe
  let modal = document.getElementById('emailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'emailModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center hidden';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="modal-backdrop absolute inset-0 bg-black bg-opacity-50" onclick="closeEmailModal()"></div>
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden slide-in">
      <div class="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
        <h2 class="text-2xl font-bold flex items-center gap-3">
          <i class="fas fa-paper-plane"></i>
          Enviar Email con Gmail
        </h2>
      </div>
      <form id="emailForm" class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <input type="hidden" id="emailTemplateId" value="${template.id}">
        
        <!-- Información del destinatario -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <i class="fas fa-user"></i> Información del Destinatario
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">
                <i class="fas fa-envelope mr-2"></i>Email del Destinatario
              </label>
              <input type="email" id="recipientEmail" required 
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                placeholder="cliente@ejemplo.com">
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">
                <i class="fas fa-heading mr-2"></i>Asunto del Email
              </label>
              <input type="text" id="emailSubject" required 
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                placeholder="Asunto del correo" value="${escapeHtml(template.title)}">
            </div>
          </div>
        </div>
        
        <!-- Variables dinámicas -->
        ${variables.length > 0 ? `
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 class="font-bold text-yellow-900 mb-3 flex items-center gap-2">
              <i class="fas fa-magic"></i> Personalización del Mensaje
            </h3>
            <p class="text-sm text-gray-600 mb-4">Esta plantilla contiene variables personalizables. Completa los valores:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="variablesContainer">
              ${variables.map(variable => `
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">
                    {{${variable}}}
                  </label>
                  <input type="text" 
                    data-variable="${variable}"
                    class="variable-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-yellow-500"
                    placeholder="Valor para ${variable}">
                </div>
              `).join('')}
            </div>
          </div>
        ` : '<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center text-gray-600"><i class="fas fa-info-circle mr-2"></i>Esta plantilla no contiene variables personalizables</div>'}
        
        <!-- Preview -->
        <div class="mb-6">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i class="fas fa-eye"></i> Vista Previa del Email
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <iframe id="emailPreview" srcdoc="${template.html.replace(/"/g, '&quot;')}" 
              class="w-full h-64 rounded border-0"></iframe>
          </div>
        </div>
        
        <!-- Botones -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onclick="closeEmailModal()" 
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          ${variables.length > 0 ? `
            <button type="button" onclick="updateEmailPreview()" 
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <i class="fas fa-sync"></i>
              Actualizar Preview
            </button>
          ` : ''}
          <button type="submit" 
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <i class="fas fa-paper-plane"></i>
            Enviar Email
          </button>
        </div>
      </form>
    </div>
  `;
  
  // Agregar evento al formulario
  document.getElementById('emailForm').addEventListener('submit', handleEmailSubmit);
  
  // Agregar eventos a los inputs de variables para actualizar preview automáticamente
  document.querySelectorAll('.variable-input').forEach(input => {
    input.addEventListener('input', debounce(updateEmailPreview, 500));
  });
  
  // Mostrar el modal
  modal.classList.remove('hidden');
}

// Cerrar modal de email
function closeEmailModal() {
  const modal = document.getElementById('emailModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Actualizar preview del email
async function updateEmailPreview() {
  const templateId = document.getElementById('emailTemplateId').value;
  const variables = {};
  
  // Recoger valores de las variables
  document.querySelectorAll('.variable-input').forEach(input => {
    variables[input.dataset.variable] = input.value;
  });
  
  try {
    const response = await fetch(`${API_URL}/templates/${templateId}/preview`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variables })
    });
    
    if (!response.ok) throw new Error('Error generando preview');
    
    const data = await response.json();
    document.getElementById('emailPreview').srcdoc = data.html;
    showToast('Preview actualizado', 'success');
  } catch (error) {
    console.error('Error actualizando preview:', error);
    showToast('Error actualizando preview', 'error');
  }
}

// Manejar envío del email
async function handleEmailSubmit(e) {
  e.preventDefault();
  
  const templateId = document.getElementById('emailTemplateId').value;
  const recipientEmail = document.getElementById('recipientEmail').value;
  const subject = document.getElementById('emailSubject').value;
  
  // Recoger valores de las variables
  const variables = {};
  document.querySelectorAll('.variable-input').forEach(input => {
    variables[input.dataset.variable] = input.value;
  });
  
  showLoading(true);
  
  try {
    // Enviar email usando el backend
    const response = await fetch(`${API_URL}/templates/${templateId}/send`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: subject,
        variables: variables
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error enviando email');
    }
    
    showToast('✅ ¡Email enviado exitosamente!', 'success');
    closeEmailModal();
    
    // Guardar en historial local (opcional)
    const history = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    history.unshift({
      to: recipientEmail,
      subject: subject,
      templateId: templateId,
      variables: variables,
      sentAt: new Date().toISOString()
    });
    localStorage.setItem('emailHistory', JSON.stringify(history.slice(0, 50))); // Mantener últimos 50
    
  } catch (error) {
    console.error('Error:', error);
    
    if (error.message.includes('EMAIL_USER') || error.message.includes('EMAIL_PASS')) {
      showToast('⚠️ Email no configurado en el servidor. Configura el archivo .env', 'error');
      alert(`Para configurar el envío de emails:
      
1. Abre el archivo .env en la raíz del proyecto
2. Añade tu email de Gmail: EMAIL_USER=tu-email@gmail.com
3. Genera una contraseña de aplicación en Gmail:
   - Ve a https://myaccount.google.com/security
   - Activa verificación en 2 pasos
   - Busca "Contraseñas de aplicaciones"
   - Genera una nueva para "Correo"
4. Añade la contraseña: EMAIL_PASS=tu-contraseña-de-16-caracteres
5. Reinicia el servidor`);
    } else {
      showToast('❌ ' + error.message, 'error');
    }
  } finally {
    showLoading(false);
  }
}


// Función de debounce para optimizar actualizaciones
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Hacer global las funciones que necesita el HTML
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;
window.syncTemplate = syncTemplate;
window.copyTemplate = copyTemplate;
window.previewTemplate = previewTemplate;
window.sendEmailWithTemplate = sendEmailWithTemplate;
window.closeEmailModal = closeEmailModal;
window.updateEmailPreview = updateEmailPreview;
window.openUserManagement = openUserManagement;
window.closeUserManagement = closeUserManagement;
window.closeEditUser = closeEditUser;
window.editUser = editUser;
window.deleteUser = deleteUser;

// =================================
// FUNCIONES DE CATEGORÍAS
// =================================

// Cargar categorías
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) throw new Error('Error cargando categorías');
    
    categories = await response.json();
    renderCategoryFilters();
    updateCategorySelects();
    
  } catch (error) {
    console.error('Error cargando categorías:', error);
    categories = [];
  }
}

// Renderizar filtros de categoría
function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  const currentFilters = container.querySelectorAll('.category-chip:not([data-category="all"])');
  currentFilters.forEach(chip => chip.remove());
  
  categories.forEach(category => {
    const chip = document.createElement('button');
    chip.dataset.category = category.id;
    chip.className = 'category-chip px-4 py-2 rounded-full text-white transition-all';
    chip.style.backgroundColor = category.color;
    chip.innerHTML = `
      ${category.icon ? `<i class="fas ${category.icon} mr-2"></i>` : ''}
      ${category.name}
    `;
    chip.addEventListener('click', () => filterByCategory(category.id));
    container.appendChild(chip);
  });
  
  // Actualizar chip activo
  updateActiveChip();
}

// Filtrar por categoría
function filterByCategory(categoryId) {
  selectedCategory = categoryId;
  updateActiveChip();
  filterTemplates();
}

// Actualizar chip activo
function updateActiveChip() {
  document.querySelectorAll('.category-chip').forEach(chip => {
    if (chip.dataset.category === selectedCategory) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

// Actualizar selects de categorías
function updateCategorySelects() {
  const selects = ['templateCategory', 'editTemplateCategory'];
  
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML = '<option value="">Sin categoría</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
      });
    }
  });
}

// Abrir modal de categorías
function openCategoriesModal() {
  console.log('Abriendo modal de categorías...');
  const modal = document.getElementById('categoriesModal');
  if (modal) {
    modal.classList.remove('hidden');
    loadCategoryStats();
  } else {
    console.error('Modal de categorías no encontrado');
  }
}

// Cerrar modal de categorías
function closeCategoriesModal() {
  document.getElementById('categoriesModal').classList.add('hidden');
}

// Cargar estadísticas de categorías
async function loadCategoryStats() {
  try {
    const response = await fetch(`${API_URL}/categories/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) throw new Error('Error cargando estadísticas');
    
    const stats = await response.json();
    renderCategoriesList(stats);
    
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

// Renderizar lista de categorías
function renderCategoriesList(categoriesWithStats) {
  const tbody = document.getElementById('categoriesList');
  tbody.innerHTML = '';
  
  categoriesWithStats.forEach((category, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-4 py-3">
        <button class="text-gray-400 hover:text-gray-600 cursor-move">
          <i class="fas fa-grip-vertical"></i>
        </button>
      </td>
      <td class="px-4 py-3 font-medium">${category.name}</td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded" style="background-color: ${category.color}"></div>
          <span class="text-sm text-gray-600">${category.color}</span>
        </div>
      </td>
      <td class="px-4 py-3">
        ${category.icon ? `<i class="fas ${category.icon}"></i>` : '-'}
      </td>
      <td class="px-4 py-3">
        <span class="bg-gray-100 px-2 py-1 rounded text-sm">${category.template_count}</span>
      </td>
      <td class="px-4 py-3 text-right">
        <button onclick="editCategory('${category.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteCategory('${category.id}')" class="text-red-600 hover:text-red-800">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Añadir categoría
async function addCategory(e) {
  e.preventDefault();
  
  const name = document.getElementById('categoryName').value;
  const color = document.getElementById('categoryColor').value;
  const icon = document.getElementById('categoryIcon').value;
  
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ name, color, icon })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error creando categoría');
    }
    
    showToast('Categoría creada exitosamente');
    document.getElementById('addCategoryForm').reset();
    loadCategories();
    loadCategoryStats();
    
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}

// Eliminar categoría
async function deleteCategory(id) {
  if (!confirm('¿Estás seguro de eliminar esta categoría? Las plantillas no se eliminarán.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) throw new Error('Error eliminando categoría');
    
    showToast('Categoría eliminada exitosamente');
    loadCategories();
    loadCategoryStats();
    
  } catch (error) {
    console.error('Error:', error);
    showToast('Error eliminando categoría', 'error');
  }
}

// Setup de listeners para categorías
document.addEventListener('DOMContentLoaded', () => {
  // Filtro "Todas"
  const allChip = document.querySelector('[data-category="all"]');
  if (allChip) {
    allChip.addEventListener('click', () => filterByCategory('all'));
  }
  
  // Modal de categorías
  const closeBtn = document.getElementById('closeCategoriesModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCategoriesModal);
  }
  
  // Formulario de añadir categoría
  const addForm = document.getElementById('addCategoryForm');
  if (addForm) {
    addForm.addEventListener('submit', addCategory);
  }
});

// =================================
// ASIGNACIÓN RÁPIDA Y BULK ACTIONS
// =================================

let selectedTemplates = new Set();
let currentTemplateForCategory = null;

// Mostrar menú de categorías rápido
function showQuickCategoryMenu(event, templateId) {
  event.stopPropagation();
  currentTemplateForCategory = templateId;
  
  const menu = document.getElementById('quickCategoryMenu');
  const optionsContainer = document.getElementById('quickCategoryOptions');
  
  // Limpiar opciones anteriores
  optionsContainer.innerHTML = '';
  
  // Añadir opción "Sin categoría"
  const noCategoryOption = document.createElement('button');
  noCategoryOption.className = 'w-full px-4 py-2 text-left hover:bg-gray-100 text-sm';
  noCategoryOption.innerHTML = '<i class="fas fa-times-circle mr-2 text-gray-400"></i>Sin categoría';
  noCategoryOption.onclick = () => assignQuickCategory(null);
  optionsContainer.appendChild(noCategoryOption);
  
  // Añadir categorías
  categories.forEach(category => {
    const option = document.createElement('button');
    option.className = 'w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center gap-2';
    option.innerHTML = `
      <div class="w-4 h-4 rounded" style="background-color: ${category.color}"></div>
      ${category.icon ? `<i class="fas ${category.icon}"></i>` : ''}
      ${category.name}
    `;
    option.onclick = () => assignQuickCategory(category.id);
    optionsContainer.appendChild(option);
  });
  
  // Posicionar el menú
  const rect = event.target.getBoundingClientRect();
  menu.style.top = rect.bottom + 'px';
  menu.style.left = rect.left + 'px';
  menu.classList.remove('hidden');
  
  // Cerrar al hacer click fuera
  setTimeout(() => {
    document.addEventListener('click', hideQuickCategoryMenu);
  }, 100);
}

// Ocultar menú de categorías
function hideQuickCategoryMenu() {
  document.getElementById('quickCategoryMenu').classList.add('hidden');
  document.removeEventListener('click', hideQuickCategoryMenu);
}

// Asignar categoría rápidamente
async function assignQuickCategory(categoryId) {
  if (!currentTemplateForCategory) return;
  
  try {
    const response = await fetch(`${API_URL}/templates/assign-category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        templateIds: [currentTemplateForCategory],
        categoryId: categoryId
      })
    });
    
    if (!response.ok) throw new Error('Error asignando categoría');
    
    showToast('Categoría actualizada');
    hideQuickCategoryMenu();
    loadTemplates();
    
  } catch (error) {
    console.error('Error:', error);
    showToast('Error asignando categoría', 'error');
  }
}

// Activar modo de selección múltiple
function enableBulkSelection() {
  const templates = document.querySelectorAll('.template-card');
  templates.forEach(card => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'template-checkbox absolute top-4 left-4 w-5 h-5 z-10';
    checkbox.dataset.templateId = card.dataset.id;
    checkbox.onchange = () => updateBulkSelection();
    card.appendChild(checkbox);
  });
  
  document.getElementById('bulkActionsBar').classList.remove('hidden');
  updateBulkSelection();
}

// Actualizar selección bulk
function updateBulkSelection() {
  selectedTemplates.clear();
  const checkboxes = document.querySelectorAll('.template-checkbox:checked');
  checkboxes.forEach(cb => selectedTemplates.add(cb.dataset.templateId));
  
  document.getElementById('selectedCount').textContent = 
    `${selectedTemplates.size} plantilla${selectedTemplates.size !== 1 ? 's' : ''} seleccionada${selectedTemplates.size !== 1 ? 's' : ''}`;
}

// Cancelar selección bulk
function cancelBulkSelection() {
  selectedTemplates.clear();
  document.querySelectorAll('.template-checkbox').forEach(cb => cb.remove());
  document.getElementById('bulkActionsBar').classList.add('hidden');
}

// Asignar categoría en bulk
async function assignCategoryBulk() {
  if (selectedTemplates.size === 0) {
    showToast('Selecciona al menos una plantilla', 'error');
    return;
  }
  
  // Mostrar diálogo de selección de categoría
  const categoryId = prompt('Ingresa el ID de la categoría (deja vacío para "Sin categoría"):');
  
  try {
    const response = await fetch(`${API_URL}/templates/assign-category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        templateIds: Array.from(selectedTemplates),
        categoryId: categoryId || null
      })
    });
    
    if (!response.ok) throw new Error('Error asignando categorías');
    
    const result = await response.json();
    showToast(`${result.affected} plantillas actualizadas`);
    cancelBulkSelection();
    loadTemplates();
    
  } catch (error) {
    console.error('Error:', error);
    showToast('Error asignando categorías', 'error');
  }
}

// Eliminar en bulk
async function deleteBulk() {
  if (selectedTemplates.size === 0) {
    showToast('Selecciona al menos una plantilla', 'error');
    return;
  }
  
  if (!confirm(`¿Estás seguro de eliminar ${selectedTemplates.size} plantilla(s)?`)) {
    return;
  }
  
  let deleted = 0;
  for (const templateId of selectedTemplates) {
    try {
      const response = await fetch(`${API_URL}/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) deleted++;
    } catch (error) {
      console.error('Error eliminando plantilla:', error);
    }
  }
  
  showToast(`${deleted} plantillas eliminadas`);
  cancelBulkSelection();
  loadTemplates();
}

// Añadir botón de selección múltiple
document.addEventListener('DOMContentLoaded', () => {
  // Añadir botón de selección múltiple al header
  const header = document.querySelector('header .flex.items-center.gap-3');
  if (header) {
    const bulkBtn = document.createElement('button');
    bulkBtn.id = 'bulkSelectBtn';
    bulkBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors';
    bulkBtn.innerHTML = '<i class="fas fa-check-square mr-2"></i>Selección';
    bulkBtn.onclick = enableBulkSelection;
    header.insertBefore(bulkBtn, header.children[1]);
  }
  
  // Listener para "Seleccionar todo"
  const selectAll = document.getElementById('selectAllTemplates');
  if (selectAll) {
    selectAll.onchange = () => {
      const checkboxes = document.querySelectorAll('.template-checkbox');
      checkboxes.forEach(cb => cb.checked = selectAll.checked);
      updateBulkSelection();
    };
  }
});

// Exportar funciones para uso global
window.openCategoriesModal = openCategoriesModal;
window.closeCategoriesModal = closeCategoriesModal;
window.deleteCategory = deleteCategory;
// Editar categoría
async function editCategory(categoryId) {
  // Buscar la categoría actual
  const category = categories.find(c => c.id === categoryId);
  if (!category) return;
  
  // Llenar el formulario con los datos actuales
  document.getElementById('editCategoryId').value = category.id;
  document.getElementById('editCategoryName').value = category.name;
  document.getElementById('editCategoryColor').value = category.color;
  document.getElementById('editCategoryColorText').value = category.color;
  document.getElementById('editCategoryIcon').value = category.icon || '';
  
  // Actualizar preview del icono
  updateIconPreview(category.icon);
  
  // Mostrar el modal
  document.getElementById('editCategoryModal').classList.remove('hidden');
}

// Cerrar modal de edición
function closeEditCategoryModal() {
  document.getElementById('editCategoryModal').classList.add('hidden');
}

// Actualizar preview del icono
function updateIconPreview(icon) {
  const preview = document.getElementById('editCategoryIconPreview');
  if (icon) {
    preview.innerHTML = `<i class="fas ${icon}"></i>`;
  } else {
    preview.innerHTML = '<i class="fas fa-question text-gray-400"></i>';
  }
}

// Guardar cambios de categoría
async function saveCategoryChanges(e) {
  e.preventDefault();
  
  const id = document.getElementById('editCategoryId').value;
  const name = document.getElementById('editCategoryName').value;
  const color = document.getElementById('editCategoryColor').value;
  const icon = document.getElementById('editCategoryIcon').value;
  
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ name, color, icon })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error actualizando categoría');
    }
    
    showToast('Categoría actualizada exitosamente');
    closeEditCategoryModal();
    loadCategories();
    loadCategoryStats();
    loadTemplates(); // Recargar plantillas para actualizar los badges
    
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}

// Event listeners para el modal de edición
document.addEventListener('DOMContentLoaded', () => {
  // Formulario de editar categoría
  const editForm = document.getElementById('editCategoryForm');
  if (editForm) {
    editForm.addEventListener('submit', saveCategoryChanges);
  }
  
  // Sincronizar color picker con texto
  const colorPicker = document.getElementById('editCategoryColor');
  const colorText = document.getElementById('editCategoryColorText');
  
  if (colorPicker && colorText) {
    colorPicker.addEventListener('change', (e) => {
      colorText.value = e.target.value;
    });
    
    colorText.addEventListener('input', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        colorPicker.value = e.target.value;
      }
    });
  }
  
  // Preview del icono
  const iconInput = document.getElementById('editCategoryIcon');
  if (iconInput) {
    iconInput.addEventListener('input', (e) => {
      updateIconPreview(e.target.value);
    });
  }
});

window.editCategory = editCategory;
window.closeEditCategoryModal = closeEditCategoryModal;
window.showQuickCategoryMenu = showQuickCategoryMenu;
window.assignCategoryBulk = assignCategoryBulk;
window.deleteBulk = deleteBulk;
window.cancelBulkSelection = cancelBulkSelection;

// =================================
// SISTEMA DE TAGS
// =================================

// Cargar tags
async function loadTags() {
  try {
    const response = await fetch(`${API_URL}/tags`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) throw new Error('Error cargando tags');
    
    tags = await response.json();
    renderTagFilters();
    updateTagCheckboxes();
    
  } catch (error) {
    console.error('Error cargando tags:', error);
    tags = [];
  }
}

// Renderizar filtros de tags
function renderTagFilters() {
  const container = document.getElementById('tagFilters');
  if (!container) return;
  
  // Mantener el botón "Todos"
  const allButton = container.querySelector('[data-tag="all"]');
  container.innerHTML = '';
  if (allButton) container.appendChild(allButton);
  
  tags.forEach(tag => {
    const chip = document.createElement('button');
    chip.dataset.tagId = tag.id;
    chip.className = 'tag-chip px-3 py-1.5 rounded-full text-white transition-all';
    chip.style.backgroundColor = tag.color;
    chip.innerHTML = `
      ${tag.icon ? `<i class="fas ${tag.icon} mr-1"></i>` : ''}
      ${tag.name}
    `;
    chip.addEventListener('click', () => toggleTagFilter(tag.id));
    container.appendChild(chip);
  });
}

// Toggle filtro de tag
function toggleTagFilter(tagId) {
  if (tagId === 'all') {
    selectedTags.clear();
  } else {
    if (selectedTags.has(tagId)) {
      selectedTags.delete(tagId);
    } else {
      selectedTags.add(tagId);
    }
  }
  
  updateActiveTagChips();
  filterTemplates();
}

// Actualizar chips activos
function updateActiveTagChips() {
  document.querySelectorAll('.tag-chip').forEach(chip => {
    const tagId = chip.dataset.tagId;
    if (tagId === 'all' && selectedTags.size === 0) {
      chip.classList.add('active');
    } else if (selectedTags.has(tagId)) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

// Filtrar plantillas por categoría y tags
function filterTemplates() {
  filteredTemplates = templates.filter(template => {
    // Filtro de categoría
    if (selectedCategory !== 'all' && template.category_id !== selectedCategory) {
      return false;
    }
    
    // Filtro de tags
    if (selectedTags.size > 0) {
      const templateTagIds = template.tags ? template.tags.map(t => t.id) : [];
      const hasAllTags = Array.from(selectedTags).every(tagId => 
        templateTagIds.includes(tagId)
      );
      if (!hasAllTags) return false;
    }
    
    return true;
  });
  
  renderTemplates(filteredTemplates);
}

// Actualizar checkboxes de tags en formularios
function updateTagCheckboxes() {
  updateTagCheckboxesInContainer('templateTags');
  updateTagCheckboxesInContainer('editTemplateTags');
}

function updateTagCheckboxesInContainer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  tags.forEach(tag => {
    const label = document.createElement('label');
    label.className = 'flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded';
    label.innerHTML = `
      <input type="checkbox" value="${tag.id}" class="tag-checkbox">
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" 
            style="background-color: ${tag.color}20; color: ${tag.color}">
        ${tag.icon ? `<i class="fas ${tag.icon}"></i>` : ''}
        ${tag.name}
      </span>
    `;
    container.appendChild(label);
  });
}

// Obtener tags seleccionados de un formulario
function getSelectedTags(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  
  const checkboxes = container.querySelectorAll('.tag-checkbox:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// Establecer tags seleccionados en un formulario
function setSelectedTags(containerId, tagIds) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.querySelectorAll('.tag-checkbox').forEach(cb => {
    cb.checked = tagIds.includes(cb.value);
  });
}

// Abrir modal de tags
function openTagsModal() {
  document.getElementById('tagsModal').classList.remove('hidden');
  loadTagsList();
}

// Cerrar modal de tags
function closeTagsModal() {
  document.getElementById('tagsModal').classList.add('hidden');
}

// Cargar lista de tags con estadísticas
async function loadTagsList() {
  const tbody = document.getElementById('tagsList');
  tbody.innerHTML = '';
  
  // Contar uso de cada tag
  const tagUsage = {};
  tags.forEach(tag => {
    tagUsage[tag.id] = templates.filter(t => 
      t.tags && t.tags.some(tt => tt.id === tag.id)
    ).length;
  });
  
  tags.forEach(tag => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-4 py-3 font-medium">
        <span class="inline-flex items-center gap-1">
          ${tag.icon ? `<i class="fas ${tag.icon}"></i>` : ''}
          ${tag.name}
        </span>
      </td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded" style="background-color: ${tag.color}"></div>
          <span class="text-sm text-gray-600">${tag.color}</span>
        </div>
      </td>
      <td class="px-4 py-3">
        ${tag.icon ? `<i class="fas ${tag.icon}"></i>` : '-'}
      </td>
      <td class="px-4 py-3">
        <span class="bg-gray-100 px-2 py-1 rounded text-sm">${tagUsage[tag.id] || 0}</span>
      </td>
      <td class="px-4 py-3 text-right">
        <button onclick="editTag('${tag.id}')" class="text-purple-600 hover:text-purple-800 mr-2">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteTag('${tag.id}')" class="text-red-600 hover:text-red-800">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Añadir tag
async function addTag(e) {
  e.preventDefault();
  
  const name = document.getElementById('tagName').value;
  const color = document.getElementById('tagColor').value;
  const icon = document.getElementById('tagIcon').value;
  
  try {
    const response = await fetch(`${API_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ name, color, icon })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error creando tag');
    }
    
    showToast('Tag creado exitosamente');
    document.getElementById('addTagForm').reset();
    loadTags();
    loadTagsList();
    
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}

// Editar tag
async function editTag(tagId) {
  const tag = tags.find(t => t.id === tagId);
  if (!tag) return;
  
  document.getElementById('editTagId').value = tag.id;
  document.getElementById('editTagName').value = tag.name;
  document.getElementById('editTagColor').value = tag.color;
  document.getElementById('editTagColorText').value = tag.color;
  document.getElementById('editTagIcon').value = tag.icon || '';
  
  updateTagIconPreview(tag.icon);
  document.getElementById('editTagModal').classList.remove('hidden');
}

// Cerrar modal de edición de tag
function closeEditTagModal() {
  document.getElementById('editTagModal').classList.add('hidden');
}

// Actualizar preview del icono de tag
function updateTagIconPreview(icon) {
  const preview = document.getElementById('editTagIconPreview');
  if (icon) {
    preview.innerHTML = `<i class="fas ${icon}"></i>`;
  } else {
    preview.innerHTML = '<i class="fas fa-question text-gray-400"></i>';
  }
}

// Guardar cambios de tag
async function saveTagChanges(e) {
  e.preventDefault();
  
  const id = document.getElementById('editTagId').value;
  const name = document.getElementById('editTagName').value;
  const color = document.getElementById('editTagColor').value;
  const icon = document.getElementById('editTagIcon').value;
  
  try {
    const response = await fetch(`${API_URL}/tags/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ name, color, icon })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error actualizando tag');
    }
    
    showToast('Tag actualizado exitosamente');
    closeEditTagModal();
    loadTags();
    loadTagsList();
    loadTemplates();
    
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}

// Eliminar tag
async function deleteTag(id) {
  if (!confirm('¿Estás seguro de eliminar este tag? Se quitará de todas las plantillas.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/tags/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) throw new Error('Error eliminando tag');
    
    showToast('Tag eliminado exitosamente');
    loadTags();
    loadTagsList();
    loadTemplates();
    
  } catch (error) {
    console.error('Error:', error);
    showToast('Error eliminando tag', 'error');
  }
}

// Event listeners para tags
document.addEventListener('DOMContentLoaded', () => {
  // Formulario de añadir tag
  const addTagForm = document.getElementById('addTagForm');
  if (addTagForm) {
    addTagForm.addEventListener('submit', addTag);
  }
  
  // Formulario de editar tag
  const editTagForm = document.getElementById('editTagForm');
  if (editTagForm) {
    editTagForm.addEventListener('submit', saveTagChanges);
  }
  
  // Sincronizar color picker con texto para tags
  const tagColorPicker = document.getElementById('editTagColor');
  const tagColorText = document.getElementById('editTagColorText');
  
  if (tagColorPicker && tagColorText) {
    tagColorPicker.addEventListener('change', (e) => {
      tagColorText.value = e.target.value;
    });
    
    tagColorText.addEventListener('input', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        tagColorPicker.value = e.target.value;
      }
    });
  }
  
  // Preview del icono de tag
  const tagIconInput = document.getElementById('editTagIcon');
  if (tagIconInput) {
    tagIconInput.addEventListener('input', (e) => {
      updateTagIconPreview(e.target.value);
    });
  }
  
  // Filtro "Todos" para tags
  const allTagChip = document.querySelector('[data-tag="all"]');
  if (allTagChip) {
    allTagChip.addEventListener('click', () => toggleTagFilter('all'));
  }
});

// Exportar funciones de tags
window.openTagsModal = openTagsModal;
window.closeTagsModal = closeTagsModal;
window.editTag = editTag;
window.closeEditTagModal = closeEditTagModal;
window.deleteTag = deleteTag;
