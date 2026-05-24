import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { sanitizeFileName } from '../utils/sanitize';

// Security: Sanitize user input to prevent XSS
const sanitizeText = (text: string): string => {
  return text.replace(/[<>"'&]/g, (match) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match] || match;
  });
};

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  title?: string;
  description?: string;
}

export function ImageUpload({ 
  onUpload, 
  maxFiles = 10, 
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMB = 5,
  title = "Upload Images",
  description = "Drag and drop images or click to browse"
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image to reduce file size
  const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], sanitizeFileName(file.name), {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    
    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];
      
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        alert(`File ${sanitizeText(file.name)} is not a supported image format.`);
        continue;
      }
      
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${sanitizeText(file.name)} is too large. Maximum size is ${maxSizeMB}MB.`);
        continue;
      }
      
      setUploading(true);
      setUploadProgress((i / files.length) * 100);
      
      // Compress image
      const compressedFile = await compressImage(file);
      validFiles.push(compressedFile);
      
      // Create preview
      const preview = URL.createObjectURL(compressedFile);
      newPreviews.push(preview);
    }
    
    setPreviewImages(prev => [...prev, ...newPreviews]);
    setUploadProgress(100);
    
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      onUpload(validFiles);
    }, 500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removePreview = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card 
        className={`border-2 border-dashed transition-all cursor-pointer hover:border-blue-500 ${
          dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{description}</p>
              <p className="text-sm text-gray-500">
                Supports JPEG, PNG, WebP • Max {maxSizeMB}MB per file • Up to {maxFiles} files
              </p>
            </div>
            <Button variant="outline" className="mt-2">
              <Camera className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleChange}
        className="hidden"
      />

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Compressing and uploading images...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewImages.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removePreview(index);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Cover Photo Upload Component
interface CoverPhotoUploadProps {
  currentCover?: string;
  onUpload: (file: File) => void;
}

export function CoverPhotoUpload({ currentCover, onUpload }: CoverPhotoUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentCover);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // Compress and upload
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Set cover photo dimensions (16:9 aspect ratio)
      const targetWidth = 1920;
      const targetHeight = 1080;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], sanitizeFileName(file.name), {
            type: file.type,
            lastModified: Date.now()
          });
          onUpload(compressedFile);
        }
      }, file.type, 0.9);
    };
    
    img.src = previewUrl;
  };

  return (
    <div className="space-y-4">
      <div 
        className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer group hover:opacity-90 transition-opacity"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Cover photo" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Click to upload cover photo</p>
              <p className="text-sm text-gray-400">Recommended: 1920x1080px</p>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary">
            <Camera className="h-4 w-4 mr-2" />
            Change Cover Photo
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}