// Simple Upload Helper für Fortkamp Admin

async function uploadImage(file, type, category) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('category', category);

    console.log('Uploading:', { filename: file.name, type, category, size: file.size });

    const response = await fetch('/api/upload-simple', {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);

      let errorMessage = 'Upload failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Upload success:', result);
    return result;

  } catch (error) {
    console.error('Upload exception:', error);
    throw error;
  }
}

// Export globally
window.uploadImage = uploadImage;

