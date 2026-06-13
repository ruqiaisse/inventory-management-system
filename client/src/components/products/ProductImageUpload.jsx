import { useEffect, useRef, useState } from "react";
/* eslint-disable react-hooks/set-state-in-effect */
import { deleteImage, uploadImage } from "../../services/uploadService";

function ProductImageUpload({ currentImage, onImageUploaded, onImageRemoved }) {
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const getFilenameFromUrl = (url) => {
    if (!url) return "";
    return url.split("/").pop();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("[Upload] File selected:", file.name, "Size:", file.size, "Type:", file.type);

    if (!file.type.startsWith("image/")) {
      console.warn("[Upload] Invalid file type:", file.type);
      setError("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.warn("[Upload] File too large:", file.size);
      setError("File too large. Max 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);
    setError("");

    try {
      console.log("[Upload] Uploading...");
      const imageUrl = await uploadImage(file);
      console.log("[Upload] Success! URL:", imageUrl);
      onImageUploaded(imageUrl);
    } catch (uploadError) {
      console.error("[Upload] Failed:", uploadError.message);
      const errorMsg = uploadError.message || "Upload failed. Please try again.";
      setError(errorMsg);
      setPreview(currentImage || "");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    const filename = getFilenameFromUrl(preview || currentImage);

    if (filename) {
      try {
        await deleteImage(filename);
      } catch (removeError) {
        console.error("Unable to delete image:", removeError);
      }
    }

    setPreview("");
    setUploading(false);
    setError("");
    onImageRemoved();
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Product Image</label>
      <div
        className="relative rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-slate-400 hover:bg-slate-100 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {uploading ? (
          <div className="py-12 text-slate-600">Uploading...</div>
        ) : preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Product preview"
              className="mx-auto h-48 w-48 rounded-3xl object-cover"
            />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleRemove();
              }}
              className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="py-12">
            <p className="text-sm font-semibold text-slate-900">Click to upload or drag image here</p>
            <p className="mt-2 text-xs text-slate-500">PNG, JPG, WEBP · max 5MB</p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

export default ProductImageUpload;
