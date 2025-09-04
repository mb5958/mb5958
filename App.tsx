import React, { useState, useCallback } from 'react';
import { ImageFile } from './types';
import { generateStyledImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Header from './components/Header';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageFile | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!personImage || !clothingImage) {
      setError('请同时上传人物和服装图片。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const generatedImage = await generateStyledImage(personImage, clothingImage);
      if (generatedImage) {
        setResultImage(generatedImage);
      } else {
        setError('人工智能无法生成图片。请尝试不同的图片。');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : '发生未知错误。');
    } finally {
      setIsLoading(false);
    }
  }, [personImage, clothingImage]);

  const canGenerate = personImage && clothingImage && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="flex-grow flex flex-col items-center">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ImageUploader title="上传人物图片" onImageUpload={setPersonImage} />
          <ImageUploader title="上传服装图片" onImageUpload={setClothingImage} />
        </div>

        <div className="w-full max-w-7xl flex justify-center mb-8">
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
      </main>
    </div>
  );
};

export default App;