// components/shared/image-upload.tsx
"use client";

import { useState, useRef } from "react";
import { X, ImagePlus, Loader, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 4 }: ImageUploadProps) {
  const [uploading, setUploading] = useState<number[]>([]); // indices being uploaded
  const [error,     setError]     = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const uploadFile = async (file: File, index: number): Promise<string | null> => {
    if (!cloudName || !uploadPreset) {
      setError("Cloudinary is not configured. Check your .env.local file.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "campusmart/products");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Upload failed");
    }

    const data = await res.json();
    return data.secure_url as string;
  };

  const handleFiles = async (files: FileList) => {
    setError("");
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);

    // Validate types and sizes
    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5MB.");
        return;
      }
    }

    // Track which slots are uploading
    const startIndex = images.length;
    const indices = toUpload.map((_, i) => startIndex + i);
    setUploading(indices);

    // Upload all files in parallel
    try {
      const urls = await Promise.all(
        toUpload.map((file, i) => uploadFile(file, startIndex + i))
      );
      const successful = urls.filter(Boolean) as string[];
      onChange([...images, ...successful]);
    } catch (err: any) {
      setError(err.message || "One or more uploads failed. Please try again.");
    } finally {
      setUploading([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const isFull    = images.length >= maxImages;
  const isLoading = uploading.length > 0;

  return (
    <>
      <style>{`
        .img-upload-wrap  { display: flex; flex-direction: column; gap: 12px; }

        .img-drop-zone    { border: 1.5px dashed var(--border); border-radius: 12px; padding: 32px 20px;
                            text-align: center; cursor: pointer; transition: all 0.2s;
                            background: var(--bg-elevated); }
        .img-drop-zone:hover:not(.disabled) { border-color: var(--accent);
                                               background: rgba(0,212,255,0.04); }
        .img-drop-zone.dragover { border-color: var(--accent); background: rgba(0,212,255,0.06);
                                   transform: scale(1.01); }
        .img-drop-zone.disabled { opacity: 0.5; cursor: not-allowed; }

        .drop-icon        { width: 40px; height: 40px; border-radius: 10px; margin: 0 auto 12px;
                            background: rgba(0,212,255,0.1); display: flex;
                            align-items: center; justify-content: center; color: var(--accent); }
        .drop-title       { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
        .drop-sub         { font-size: 12px; color: var(--text-muted); }
        .drop-sub span    { color: var(--accent); font-weight: 500; }
        .drop-limit       { font-size: 11px; color: var(--text-subtle); margin-top: 6px; }

        .img-grid         { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        @media (max-width: 500px) { .img-grid { grid-template-columns: repeat(3, 1fr); } }

        .img-slot         { aspect-ratio: 1; border-radius: 10px; overflow: hidden; position: relative;
                            background: var(--bg-elevated); border: 1px solid var(--border-muted); }
        .img-slot img     { width: 100%; height: 100%; object-fit: cover; }
        .img-slot.uploading { display: flex; align-items: center; justify-content: center; }
        .upload-spinner   { width: 20px; height: 20px; border: 2px solid var(--border);
                            border-top-color: var(--accent); border-radius: 50%;
                            animation: spin 0.8s linear infinite; }

        .img-remove       { position: absolute; top: 5px; right: 5px; width: 22px; height: 22px;
                            border-radius: 50%; background: rgba(0,0,0,0.75); border: none;
                            cursor: pointer; display: flex; align-items: center; justify-content: center;
                            color: white; opacity: 0; transition: opacity 0.15s; }
        .img-slot:hover .img-remove { opacity: 1; }
        .img-remove:hover { background: var(--red); }

        .img-primary-badge { position: absolute; bottom: 5px; left: 5px; padding: 2px 7px;
                             border-radius: 4px; font-size: 9px; font-weight: 700;
                             background: rgba(0,212,255,0.85); color: #0a0f1e;
                             letter-spacing: 0.04em; }

        .img-error        { display: flex; align-items: center; gap: 7px; padding: 10px 12px;
                            border-radius: 9px; font-size: 12px; color: var(--red);
                            background: rgba(255,77,109,0.08); border: 1px solid rgba(255,77,109,0.2); }

        .img-count        { font-size: 12px; color: var(--text-subtle); text-align: right; }

        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>

      <div className="img-upload-wrap">
        {/* Preview grid */}
        {(images.length > 0 || isLoading) && (
          <div className="img-grid">
            {/* Existing images */}
            {images.map((url, i) => (
              <div key={url} className="img-slot">
                <img src={url} alt={`Product image ${i + 1}`} />
                <button
                  type="button"
                  className="img-remove"
                  onClick={() => removeImage(i)}
                >
                  <X size={11} />
                </button>
                {i === 0 && <span className="img-primary-badge">COVER</span>}
              </div>
            ))}

            {/* Uploading placeholders */}
            {uploading.map(i => (
              <div key={`uploading-${i}`} className="img-slot uploading">
                <span className="upload-spinner" />
              </div>
            ))}
          </div>
        )}

        {/* Drop zone — hide when full */}
        {!isFull && (
          <div
            className={`img-drop-zone ${isLoading ? "disabled" : ""}`}
            onClick={() => !isLoading && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="drop-icon">
              {isLoading
                ? <Loader size={18} style={{animation:"spin 1s linear infinite"}} />
                : <ImagePlus size={18} />
              }
            </div>
            <div className="drop-title">
              {isLoading ? "Uploading..." : "Upload product images"}
            </div>
            <div className="drop-sub">
              {isLoading
                ? "Please wait while your images upload"
                : <><span>Click to browse</span> or drag and drop</>
              }
            </div>
            <div className="drop-limit">
              JPG, PNG, WEBP · Max 5MB each · {images.length}/{maxImages} uploaded
            </div>
          </div>
        )}

        {isFull && (
          <p className="img-count">
            ✓ {maxImages}/{maxImages} images uploaded.{" "}
            <button
              type="button"
              style={{background:"none",border:"none",color:"var(--accent)",cursor:"pointer",fontSize:12,padding:0}}
              onClick={() => onChange([])}
            >
              Clear all
            </button>
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="img-error">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>
    </>
  );
}