// Admin Panel JavaScript für Galerie-System

let services = [];
let projects = [];
let editingServiceIndex = -1;
let editingProjectIndex = -1;
let currentServiceImages = [];
let currentProjectImages = [];

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

  if (services.length === 0) {
    list.innerHTML = '<p class="text-gray-500 text-center py-4">Keine Leistungen vorhanden</p>';
    return;
  }

  list.innerHTML = services.map((service, index) => `
    <div class="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 class="font-bold">${service.title}</h3>
        <p class="text-sm text-gray-600">${service.shortDescription || ''}</p>
        <p class="text-xs text-gray-500 mt-1">${service.images?.length || 0} Bilder</p>
      </div>
      <div class="flex gap-2">
        <button onclick="editService(${index})" style="background-color: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem;">Bearbeiten</button>
        <button onclick="deleteService(${index})" style="background-color: #dc2626; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem;">Löschen</button>
      </div>
    </div>
  `).join('');
}

// Render projects list
function renderProjects() {
  const list = document.getElementById('projects-list');
  if (!list) return;

  if (projects.length === 0) {
    list.innerHTML = '<p class="text-gray-500 text-center py-4">Keine Projekte vorhanden</p>';
    return;
  }

  list.innerHTML = projects.map((project, index) => `
    <div class="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 class="font-bold">${project.title}</h3>
        <p class="text-sm text-gray-600">${project.summary || ''}</p>
        <p class="text-xs text-gray-500 mt-1">${project.images?.length || 0} Bilder</p>
      </div>
      <div class="flex gap-2">
        <button onclick="editProject(${index})" style="background-color: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem;">Bearbeiten</button>
        <button onclick="deleteProject(${index})" style="background-color: #dc2626; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem;">Löschen</button>
      </div>
    </div>
  `).join('');
}

// Add new service
function addService() {
  editingServiceIndex = -1;
  currentServiceImages = [];
  document.getElementById('service-id').value = '';
  document.getElementById('service-title').value = '';
  document.getElementById('service-slug').value = '';
  document.getElementById('service-description').value = '';
  document.getElementById('service-features').value = '';
  document.getElementById('service-order').value = services.length + 1;
  document.getElementById('service-images-list').innerHTML = '';

  document.getElementById('service-modal').classList.remove('hidden');
}

// Edit service
function editService(index) {
  editingServiceIndex = index;
  const service = services[index];

  // Handle both old format (image: string) and new format (images: array)
  if (service.images && Array.isArray(service.images)) {
    currentServiceImages = [...service.images];
  } else if (service.image) {
    currentServiceImages = [{ src: service.image, alt: service.title || '' }];
  } else {
    currentServiceImages = [];
  }

  document.getElementById('service-id').value = service.id || '';
  document.getElementById('service-title').value = service.title || '';
  document.getElementById('service-slug').value = service.slug || '';
  document.getElementById('service-description').value = service.shortDescription || '';
  document.getElementById('service-features').value = (service.features || []).join('\n');
  document.getElementById('service-order').value = service.order || 1;

  // Render existing images
  renderServiceImages();

  document.getElementById('service-modal').classList.remove('hidden');
}

// Render service images
function renderServiceImages() {
  const list = document.getElementById('service-images-list');
  if (!list) return;

  if (currentServiceImages.length === 0) {
    list.innerHTML = '<p style="color: #6b7280; font-size: 0.875rem;">Keine Bilder vorhanden</p>';
    return;
  }

  list.innerHTML = currentServiceImages.map((img, i) => `
    <div style="position: relative;">
      <img src="${img.src}" alt="${img.alt || ''}" style="width: 100%; height: 6rem; object-fit: cover; border-radius: 0.25rem;">
      <button type="button" onclick="removeServiceImageByIndex(${i})" style="position: absolute; top: 0.25rem; right: 0.25rem; background-color: #dc2626; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; border: none; cursor: pointer;">×</button>
    </div>
  `).join('');
}

function removeServiceImageByIndex(index) {
  currentServiceImages.splice(index, 1);
  renderServiceImages();
}

// Delete service
async function deleteService(index) {
  if (confirm('Leistung wirklich löschen?')) {
    services.splice(index, 1);
    renderServices();
    // Auto-save after delete
    await saveServices();
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
    images: currentServiceImages
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
  currentProjectImages = [];
  document.getElementById('project-id').value = '';
  document.getElementById('project-title').value = '';
  document.getElementById('project-slug').value = '';
  document.getElementById('project-client').value = '';
  document.getElementById('project-location').value = '';
  document.getElementById('project-summary').value = '';
  document.getElementById('project-featured').checked = false;
  document.getElementById('project-images-list').innerHTML = '';

  document.getElementById('project-modal').classList.remove('hidden');
}

// Edit project
function editProject(index) {
  editingProjectIndex = index;
  const project = projects[index];
  currentProjectImages = project.images || [];

  document.getElementById('project-id').value = project.id || '';
  document.getElementById('project-title').value = project.title || '';
  document.getElementById('project-slug').value = project.slug || '';
  document.getElementById('project-client').value = project.client || '';
  document.getElementById('project-location').value = project.location || '';
  document.getElementById('project-summary').value = project.summary || '';
  document.getElementById('project-featured').checked = project.featured || false;

  // Render existing images
  renderProjectImages();

  document.getElementById('project-modal').classList.remove('hidden');
}

// Render project images
function renderProjectImages() {
  const list = document.getElementById('project-images-list');
  if (!list) return;

  if (currentProjectImages.length === 0) {
    list.innerHTML = '<p style="color: #6b7280; font-size: 0.875rem;">Keine Bilder vorhanden</p>';
    return;
  }

  list.innerHTML = currentProjectImages.map((img, i) => `
    <div style="position: relative;">
      <img src="${img.src}" alt="${img.alt || ''}" style="width: 100%; height: 6rem; object-fit: cover; border-radius: 0.25rem;">
      <button type="button" onclick="removeProjectImageByIndex(${i})" style="position: absolute; top: 0.25rem; right: 0.25rem; background-color: #dc2626; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; border: none; cursor: pointer;">×</button>
    </div>
  `).join('');
}

function removeProjectImageByIndex(index) {
  currentProjectImages.splice(index, 1);
  renderProjectImages();
}

// Delete project
async function deleteProject(index) {
  if (confirm('Projekt wirklich löschen?')) {
    projects.splice(index, 1);
    renderProjects();
    // Auto-save after delete
    await saveProjects();
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
    images: currentProjectImages,
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
  currentServiceImages.push({ src: url, alt: alt, key: key });
  renderServiceImages();
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
  currentProjectImages.push({ src: url, alt: alt, key: key });
  renderProjectImages();
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

