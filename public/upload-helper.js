// Simple Upload Helper für Fortkamp Admin

async function uploadImage(file, type, category) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('category', category);

  const response = await fetch('/api/upload-simple', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return await response.json();
}

// Export globally
window.uploadImage = uploadImage;

