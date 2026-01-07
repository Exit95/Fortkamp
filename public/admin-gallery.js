// Admin Panel JavaScript für Galerie-System

let services = [];
let projects = [];
let editingServiceIndex = -1;
let editingProjectIndex = -1;

// Tab switching
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.classList.remove('active');
    el.classList.add('opacity-60');
  });
  
  document.getElementById(`${tab}-tab`).classList.remove('hidden');
  document.getElementById(`tab-${tab}`).classList.remove('opacity-60');
  document.getElementById(`tab-${tab}`).classList.add('active');
}

// Load data on page load
async function loadData() {
  try {
    const [servicesRes, projectsRes] = await Promise.all([
      fetch('/api/services'),
      fetch('/api/projects')
    ]);
    
    services = await servicesRes.json();
    projects = await projectsRes.json();
    
    renderServices();
    renderProjects();
  } catch (error) {
    console.error('Failed to load data:', error);
    alert('Fehler beim Laden der Daten');
  }
}

// Render services list
function renderServices() {
  const list = document.getElementById('services-list');
  if (!list) return;
  
  list.innerHTML = services.map((service, index) => `
    <div class="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 class="font-bold">${service.title}</h3>
        <p class="text-sm text-gray-600">${service.shortDescription || ''}</p>
        <p class="text-xs text-gray-500 mt-1">${service.images?.length || 0} Bilder</p>
      </div>
      <div class="flex gap-2">
        <button onclick="editService(${index})" class="bg-blue-600 text-white px-3 py-1 rounded">Bearbeiten</button>
        <button onclick="deleteService(${index})" class="bg-red-600 text-white px-3 py-1 rounded">Löschen</button>
      </div>
    </div>
  `).join('');
}

// Render projects list
function renderProjects() {
  const list = document.getElementById('projects-list');
  if (!list) return;
  
  list.innerHTML = projects.map((project, index) => `
    <div class="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 class="font-bold">${project.title}</h3>
        <p class="text-sm text-gray-600">${project.summary || ''}</p>
        <p class="text-xs text-gray-500 mt-1">${project.images?.length || 0} Bilder</p>
      </div>
      <div class="flex gap-2">
        <button onclick="editProject(${index})" class="bg-blue-600 text-white px-3 py-1 rounded">Bearbeiten</button>
        <button onclick="deleteProject(${index})" class="bg-red-600 text-white px-3 py-1 rounded">Löschen</button>
      </div>
    </div>
  `).join('');
}

// Add new service
function addService() {
  editingServiceIndex = -1;
  document.getElementById('service-id').value = '';
  document.getElementById('service-title').value = '';
  document.getElementById('service-slug').value = '';
  document.getElementById('service-description').value = '';
  document.getElementById('service-features').value = '';
  document.getElementById('service-order').value = services.length + 1;
  
  // Clear gallery
  if (window.setImages_servicegallery) {
    window.setImages_servicegallery([]);
  }
  
  document.getElementById('service-modal').classList.remove('hidden');
}

// Edit service
function editService(index) {
  editingServiceIndex = index;
  const service = services[index];
  
  document.getElementById('service-id').value = service.id || '';
  document.getElementById('service-title').value = service.title || '';
  document.getElementById('service-slug').value = service.slug || '';
  document.getElementById('service-description').value = service.shortDescription || '';
  document.getElementById('service-features').value = (service.features || []).join('\n');
  document.getElementById('service-order').value = service.order || 1;
  
  // Load images into gallery
  if (window.setImages_servicegallery && service.images) {
    window.setImages_servicegallery(service.images);
  }
  
  document.getElementById('service-modal').classList.remove('hidden');
}

// Delete service
function deleteService(index) {
  if (confirm('Leistung wirklich löschen?')) {
    services.splice(index, 1);
    renderServices();
  }
}

// Close service modal
function closeServiceModal() {
  document.getElementById('service-modal').classList.add('hidden');
}

// Save service
document.getElementById('service-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const service = {
    id: document.getElementById('service-id').value || document.getElementById('service-slug').value,
    slug: document.getElementById('service-slug').value,
    title: document.getElementById('service-title').value,
    shortDescription: document.getElementById('service-description').value,
    features: document.getElementById('service-features').value.split('\n').filter(f => f.trim()),
    order: parseInt(document.getElementById('service-order').value) || 1,
    images: window.getImages_servicegallery ? window.getImages_servicegallery() : []
  };
  
  if (editingServiceIndex >= 0) {
    services[editingServiceIndex] = service;
  } else {
    services.push(service);
  }
  
  renderServices();
  closeServiceModal();
});

// Add new project
function addProject() {
  editingProjectIndex = -1;
  document.getElementById('project-id').value = '';
  document.getElementById('project-title').value = '';
  document.getElementById('project-slug').value = '';
  document.getElementById('project-client').value = '';
  document.getElementById('project-location').value = '';
  document.getElementById('project-summary').value = '';
  document.getElementById('project-featured').checked = false;

  // Clear gallery
  if (window.setImages_projectgallery) {
    window.setImages_projectgallery([]);
  }

  document.getElementById('project-modal').classList.remove('hidden');
}

// Edit project
function editProject(index) {
  editingProjectIndex = index;
  const project = projects[index];

  document.getElementById('project-id').value = project.id || '';
  document.getElementById('project-title').value = project.title || '';
  document.getElementById('project-slug').value = project.slug || '';
  document.getElementById('project-client').value = project.client || '';
  document.getElementById('project-location').value = project.location || '';
  document.getElementById('project-summary').value = project.summary || '';
  document.getElementById('project-featured').checked = project.featured || false;

  // Load images into gallery
  if (window.setImages_projectgallery && project.images) {
    window.setImages_projectgallery(project.images);
  }

  document.getElementById('project-modal').classList.remove('hidden');
}

// Delete project
function deleteProject(index) {
  if (confirm('Projekt wirklich löschen?')) {
    projects.splice(index, 1);
    renderProjects();
  }
}

// Close project modal
function closeProjectModal() {
  document.getElementById('project-modal').classList.add('hidden');
}

// Save project
document.getElementById('project-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const project = {
    id: document.getElementById('project-id').value || Date.now().toString(),
    slug: document.getElementById('project-slug').value,
    title: document.getElementById('project-title').value,
    client: document.getElementById('project-client').value,
    location: document.getElementById('project-location').value,
    summary: document.getElementById('project-summary').value,
    featured: document.getElementById('project-featured').checked,
    images: window.getImages_projectgallery ? window.getImages_projectgallery() : [],
    services: [],
    tags: []
  };

  if (editingProjectIndex >= 0) {
    projects[editingProjectIndex] = project;
  } else {
    projects.push(project);
  }

  renderProjects();
  closeProjectModal();
});

// Save all services
async function saveServices() {
  try {
    const response = await fetch('/api/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(services)
    });

    if (response.ok) {
      alert('Leistungen erfolgreich gespeichert!');
    } else {
      throw new Error('Save failed');
    }
  } catch (error) {
    console.error('Save error:', error);
    alert('Fehler beim Speichern');
  }
}

// Save all projects
async function saveProjects() {
  try {
    const response = await fetch('/api/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projects)
    });

    if (response.ok) {
      alert('Projekte erfolgreich gespeichert!');
    } else {
      throw new Error('Save failed');
    }
  } catch (error) {
    console.error('Save error:', error);
    alert('Fehler beim Speichern');
  }
}

// Handle image upload for services
function setupServiceUploader() {
  const uploader = document.getElementById('service-image-upload');
  if (!uploader) return;

  uploader.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const slug = document.getElementById('service-slug').value || 'general';
    const progressBar = document.getElementById('service-progress-bar');
    const progressText = document.getElementById('service-progress-text');
    const progressContainer = document.getElementById('service-upload-progress');

    if (progressContainer) progressContainer.classList.remove('hidden');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (progressText) progressText.textContent = `Uploading ${file.name}... (${i + 1}/${files.length})`;
        if (progressBar) progressBar.style.width = `${((i + 1) / files.length) * 100}%`;

        const result = await window.uploadImage(file, 'service', slug);

        // Add to images list
        addServiceImage(result.url, result.key, file.name);
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`Upload failed for ${file.name}: ${error.message}`);
      }
    }

    if (progressContainer) progressContainer.classList.add('hidden');
    if (progressBar) progressBar.style.width = '0%';
    uploader.value = '';
  });
}

function addServiceImage(url, key, alt) {
  const list = document.getElementById('service-images-list');
  if (!list) return;

  const div = document.createElement('div');
  div.className = 'relative';
  div.innerHTML = `
    <img src="${url}" alt="${alt}" class="w-full h-24 object-cover rounded">
    <button onclick="removeServiceImage('${key}')" class="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs">×</button>
  `;
  list.appendChild(div);
}

function removeServiceImage(key) {
  // TODO: Implement removal
  console.log('Remove image:', key);
}

// Handle image upload for projects
function setupProjectUploader() {
  const uploader = document.getElementById('project-image-upload');
  if (!uploader) return;

  uploader.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const slug = document.getElementById('project-slug').value || 'general';
    const progressBar = document.getElementById('project-progress-bar');
    const progressText = document.getElementById('project-progress-text');
    const progressContainer = document.getElementById('project-upload-progress');

    if (progressContainer) progressContainer.classList.remove('hidden');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (progressText) progressText.textContent = `Uploading ${file.name}... (${i + 1}/${files.length})`;
        if (progressBar) progressBar.style.width = `${((i + 1) / files.length) * 100}%`;

        const result = await window.uploadImage(file, 'project', slug);

        // Add to images list
        addProjectImage(result.url, result.key, file.name);
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`Upload failed for ${file.name}: ${error.message}`);
      }
    }

    if (progressContainer) progressContainer.classList.add('hidden');
    if (progressBar) progressBar.style.width = '0%';
    uploader.value = '';
  });
}

function addProjectImage(url, key, alt) {
  const list = document.getElementById('project-images-list');
  if (!list) return;

  const div = document.createElement('div');
  div.className = 'relative';
  div.innerHTML = `
    <img src="${url}" alt="${alt}" class="w-full h-24 object-cover rounded">
    <button onclick="removeProjectImage('${key}')" class="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs">×</button>
  `;
  list.appendChild(div);
}

function removeProjectImage(key) {
  // TODO: Implement removal
  console.log('Remove image:', key);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  // Setup uploaders after a short delay to ensure components are loaded
  setTimeout(() => {
    setupServiceUploader();
    setupProjectUploader();
  }, 100);
});

