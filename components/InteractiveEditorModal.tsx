import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageFile } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface InteractiveEditorModalProps {
  personImage: ImageFile;
  clothingImage: ImageFile;
  onSave: (compositeImage: string) => void;
  onClose: () => void;
}

const InteractiveEditorModal: React.FC<InteractiveEditorModalProps> = ({
  personImage,
  clothingImage,
  onSave,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const clothingRef = useRef<HTMLImageElement>(null);
  const personImgRef = useRef<HTMLImageElement>(null);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.5, rotation: 0 });
  const [interaction, setInteraction] = useState<{
    type: 'drag' | 'scale' | 'rotate';
    startX: number;
    startY: number;
    initialTransform: typeof transform;
  } | null>(null);

  // Initialize clothing position to center
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setTransform(prev => ({ ...prev, x: width / 2, y: height / 2 }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'drag' | 'scale' | 'rotate') => {
    e.preventDefault();
    e.stopPropagation();
    setInteraction({
      type,
      startX: e.clientX,
      startY: e.clientY,
      initialTransform: { ...transform },
    });
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interaction || !clothingRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - interaction.startX;
    const dy = e.clientY - interaction.startY;
    const { initialTransform } = interaction;

    if (interaction.type === 'drag') {
      setTransform(prev => ({ ...prev, x: initialTransform.x + dx, y: initialTransform.y + dy }));
    } else if (interaction.type === 'scale') {
      const scaleDelta = dx / 100;
      setTransform(prev => ({ ...prev, scale: Math.max(0.1, initialTransform.scale + scaleDelta) }));
    } else if (interaction.type === 'rotate') {
      const clothingRect = clothingRef.current.getBoundingClientRect();
      const centerX = clothingRect.left + clothingRect.width / 2;
      const centerY = clothingRect.top + clothingRect.height / 2;
      
      const angleStart = Math.atan2(interaction.startY - centerY, interaction.startX - centerX);
      const angleNow = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const angleDiff = angleNow - angleStart;
      
      setTransform(prev => ({ ...prev, rotation: initialTransform.rotation + angleDiff * (180 / Math.PI) }));
    }
  }, [interaction]);

  const handleMouseUp = useCallback(() => {
    setInteraction(null);
  }, []);
  
  const handleSave = () => {
    if (!personImgRef.current || !clothingRef.current) return;

    const canvas = document.createElement('canvas');
    const person = personImgRef.current;
    canvas.width = person.naturalWidth;
    canvas.height = person.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw person image
    ctx.drawImage(person, 0, 0);

    // Calculate clothing position and size relative to the natural image dimensions
    const scaleX = person.naturalWidth / person.width;
    const scaleY = person.naturalHeight / person.height;
    
    const clothingImg = new Image();
    clothingImg.crossOrigin = "anonymous";
    clothingImg.src = `data:${clothingImage.mimeType};base64,${clothingImage.base64}`;
    clothingImg.onload = () => {
      ctx.save();
      // Translate and rotate canvas
      ctx.translate(transform.x * scaleX, transform.y * scaleY);
      ctx.rotate(transform.rotation * (Math.PI / 180));
      
      // Draw clothing image
      const w = clothingImg.naturalWidth * transform.scale * scaleX;
      const h = clothingImg.naturalHeight * transform.scale * scaleY;
      ctx.drawImage(clothingImg, -w / 2, -h / 2, w, h);
      ctx.restore();

      onSave(canvas.toDataURL('image/png'));
    }
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="bg-gray-800 rounded-xl p-4 shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">交互式编辑器</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                <CloseIcon />
            </button>
        </div>

        <div ref={containerRef} className="flex-grow w-full h-full relative overflow-hidden bg-gray-900 rounded-lg">
          <img
            ref={personImgRef}
            src={`data:${personImage.mimeType};base64,${personImage.base64}`}
            alt="Person"
            className="w-full h-full object-contain"
            crossOrigin="anonymous"
          />
          <div
            ref={clothingRef}
            className="absolute cursor-move"
            style={{
              left: `${transform.x}px`,
              top: `${transform.y}px`,
              transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
              width: `${200 * transform.scale}px`, // Base width * scale
              touchAction: 'none',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            <img
              src={`data:${clothingImage.mimeType};base64,${clothingImage.base64}`}
              alt="Clothing"
              className="w-full h-full object-contain pointer-events-none"
              crossOrigin="anonymous"
            />
             {/* Scale Handle */}
            <div 
              className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white cursor-nwse-resize"
              onMouseDown={(e) => handleMouseDown(e, 'scale')}
            />
            {/* Rotate Handle */}
            <div 
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-6 bg-blue-500 cursor-alias"
              onMouseDown={(e) => handleMouseDown(e, 'rotate')}
            >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-4 pt-4 border-t border-gray-700">
            <button onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                取消
            </button>
            <button onClick={handleSave} className="px-6 py-2 bg-brand-secondary rounded-lg font-semibold hover:bg-blue-500 transition-colors">
                保存布局
            </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveEditorModal;
