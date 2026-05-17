import React, { useState } from 'react';
import './ImageUpload.css';

function ImageUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      onChange(data.url);
      setPreview(data.url);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url) => {
    setPreview(url);
    onChange(url);
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">{label}</label>

      <div className="upload-options">
        <div className="upload-option">
          <label className="upload-button">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            {uploading ? 'Uploading...' : '📁 Choose File'}
          </label>
          <span className="upload-hint">Max 5MB</span>
        </div>

        <div className="upload-divider">
          <span>OR</span>
        </div>

        <div className="upload-option">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Paste image URL"
            className="url-input"
            disabled={uploading}
          />
        </div>
      </div>

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button
            type="button"
            onClick={handleRemove}
            className="remove-preview"
            disabled={uploading}
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;