import React, { useEffect, useState } from "react";

const inputClasses =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-dark disabled:cursor-not-allowed disabled:bg-light-tertiary";
const primaryButtonClasses =
  "inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-tertiary disabled:cursor-not-allowed disabled:opacity-60";
const dangerButtonClasses =
  "inline-flex items-center justify-center rounded-full border border-error/20 bg-[#fff2f2] px-4 py-2 text-sm font-semibold text-error transition hover:bg-[#ffe8e6] disabled:cursor-not-allowed disabled:opacity-60";

function ImageUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
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
      formData.append("image", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
      setPreview(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      setPreview(value || "");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleUrlChange = (url) => {
    setPreview(url);
    onChange(url);
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-dark">{label}</label>

      <div className="space-y-4 rounded-[28px] border border-border bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className={primaryButtonClasses}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? "Uploading..." : "Choose File"}
          </label>

          <span className="text-sm text-dark-secondary">Max 5MB</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-dark">
            Image URL
          </label>
          <input
            type="text"
            value={value || ""}
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder="Paste image URL"
            className={inputClasses}
            disabled={uploading}
          />
        </div>
      </div>

      {preview ? (
        <div className="max-w-md overflow-hidden rounded-[28px] border border-border bg-white shadow-card">
          <img
            src={preview}
            alt="Preview"
            className="block max-h-80 w-full object-cover"
          />
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={handleRemove}
              className={dangerButtonClasses}
              disabled={uploading}
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ImageUpload;
