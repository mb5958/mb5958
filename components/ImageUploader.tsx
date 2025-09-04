import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageFile } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: ImageFile | null) => void;
  imageFile: ImageFile | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, imageFile }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imageFile) {
      setImagePreview(`data:${imageFile.mimeType};base64,${imageFile.base64}`);
      setFileName(imageFile.name);
    } else {
      setImagePreview(null);
      setFileName(null);
    }
  }, [imageFile]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = useCallback(async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      const imageFile: ImageFile = {
        name: file.name,
        base64: base64,
        mimeType: file.type,
      };
      onImageUpload(imageFile);
    }
  }, [onImageUpload]);

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files?.[0] ?? null);
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    handleFileChange(event.dataTransfer.files?.[0] ?? null);
  }, [handleFileChange]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageUpload(null);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 transition-all duration-300 h-96">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">{title}</h2>
      {imagePreview ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <img src={imagePreview} alt="Preview" className="max-h-64 object-contain rounded-lg shadow-lg" />
          <p className="text-sm text-gray-400 mt-2 truncate max-w-full px-4">{fileName}</p>
          <button onClick={handleClear} className="absolute top-2 right-2 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors">
            <TrashIcon />
          </button>
        </div>
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center text-center cursor-pointer rounded-lg p-4 transition-colors duration-300 ${isDragOver ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
          <UploadIcon />
          <p className="mt-4 text-gray-300">
            <span className="font-semibold text-brand-secondary">点击上传</span> 或拖拽文件至此
          </p>
          <p className="text-xs text-gray-500 mt-1">支持 PNG, JPG, WEBP 等格式</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;