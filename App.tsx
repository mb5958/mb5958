import React, { useState, useCallback, useEffect } from 'react';
import { ImageFile, HistoryItem } from './types';
import { generateStyledImage, generateRefinedImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Header from './components/Header';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';
import InteractiveEditorModal from './components/InteractiveEditorModal';
import HistoryPanel from './components/HistoryPanel';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageFile | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('virtual-try-on-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error("Failed to load history from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('virtual-try-on-history', JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save history to localStorage:", err);
    }
  }, [history]);

  const handleGenerate = useCallback(async () => {
    if (!personImage || (!clothingImage && !compositeImage)) {
      setError('请上传所需图片。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      let generatedImage: string | null = null;
      if (compositeImage) {
        const compositeFile: ImageFile = {
          name: 'composite.png',
          base64: compositeImage.split(',')[1],
          mimeType: 'image/png',
        };
        generatedImage = await generateRefinedImage(compositeFile);
      } else if (personImage && clothingImage) {
        generatedImage = await generateStyledImage(personImage, clothingImage);
      }

      if (generatedImage) {
        setResultImage(generatedImage);
        if (personImage && clothingImage) {
          const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            personImage,
            clothingImage,
            resultImage: generatedImage,
          };
          setHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]);
        }
      } else {
        setError('人工智能无法生成图片。请尝试不同的图片。');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : '发生未知错误。');
    } finally {
      setIsLoading(false);
    }
  }, [personImage, clothingImage, compositeImage]);

  const handleEditorSave = (image: string) => {
    setCompositeImage(image);
    setIsEditorOpen(false);
  };

  const handlePersonImageUpload = (file: ImageFile | null) => {
    setPersonImage(file);
    setCompositeImage(null);
  };
  
  const handleClothingImageUpload = (file: ImageFile | null) => {
    setClothingImage(file);
    setCompositeImage(null);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setPersonImage(item.personImage);
    setClothingImage(item.clothingImage);
    setResultImage(item.resultImage);
    setCompositeImage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const canGenerate = (personImage && (clothingImage || compositeImage)) && !isLoading;
  const canFineTune = personImage && clothingImage;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
      {isEditorOpen && personImage && clothingImage && (
        <InteractiveEditorModal
          personImage={personImage}
          clothingImage={clothingImage}
          onSave={handleEditorSave}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      <Header />
      <main className="flex-grow flex flex-col items-center">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ImageUploader title="上传人物图片" onImageUpload={handlePersonImageUpload} imageFile={personImage} />
          <ImageUploader title="上传服装图片" onImageUpload={handleClothingImageUpload} imageFile={clothingImage} />
        </div>
        
        {compositeImage && (
          <div className="w-full max-w-2xl mb-8 text-center">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">您的自定义布局预览</h3>
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-dashed border-brand-secondary">
              <img src={compositeImage} alt="Custom Placement Preview" className="max-h-96 object-contain rounded-lg shadow-lg mx-auto" />
            </div>
          </div>
        )}

        <div className="w-full max-w-7xl flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <button
            onClick={() => setIsEditorOpen(true)}
            disabled={!canFineTune}
            className={`
              px-8 py-4 bg-gray-700 text-white font-bold text-lg rounded-lg shadow-lg
              flex items-center justify-center gap-3 transition-all duration-300
              ${canFineTune ? 'hover:bg-gray-600 hover:shadow-xl transform hover:-translate-y-1' : 'cursor-not-allowed opacity-50'}
            `}
          >
            微调位置
          </button>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`
              px-8 py-4 bg-brand-secondary text-white font-bold text-lg rounded-lg shadow-lg
              flex items-center justify-center gap-3 transition-all duration-300
              ${canGenerate ? 'hover:bg-blue-500 hover:shadow-xl transform hover:-translate-y-1' : 'bg-gray-600 cursor-not-allowed opacity-50'}
            `}
          >
            {isLoading ? '生成中...' : '开始虚拟试穿'}
            {!isLoading && <ArrowRightIcon />}
          </button>
        </div>

        <ResultDisplay isLoading={isLoading} resultImage={resultImage} error={error} />

        <div className="w-full max-w-7xl mt-12">
            <HistoryPanel history={history} onSelect={handleHistorySelect} onClear={handleClearHistory} />
        </div>
      </main>
    </div>
  );
};

export default App;