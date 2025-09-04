import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultDisplayProps {
  isLoading: boolean;
  resultImage: string | null;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    <h3 className="text-xl font-semibold text-gray-200">正在生成您的图片...</h3>
    <p className="text-gray-400 mt-2">人工智能正在施展魔法，请稍候片刻。</p>
  </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, resultImage, error }) => {

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${resultImage}`;
    link.download = 'virtual-try-on.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-6 border border-gray-700 min-h-[30rem] flex items-center justify-center shadow-lg">
      {isLoading && <LoadingSpinner />}
      {error && !isLoading && (
        <div className="text-center text-red-400">
          <h3 className="text-2xl font-bold mb-2">发生错误</h3>
          <p>{error}</p>
        </div>
      )}
      {resultImage && !isLoading && (
        <div className="w-full text-center">
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">您的虚拟试穿已准备就绪！</h3>
            <img 
                src={`data:image/png;base64,${resultImage}`} 
                alt="Generated virtual try-on" 
                className="rounded-lg shadow-2xl mx-auto max-w-full max-h-[25rem] object-contain" 
            />
            <button
              onClick={handleDownload}
              className={`
                mt-6 px-6 py-3 bg-brand-primary text-white font-bold text-base rounded-lg shadow-md
                flex items-center justify-center gap-2 transition-all duration-300 mx-auto
                hover:bg-blue-800 hover:shadow-lg transform hover:-translate-y-0.5
              `}
            >
              <DownloadIcon />
              下载图片
            </button>
        </div>
      )}
      {!isLoading && !resultImage && !error && (
        <div className="text-center text-gray-500">
          <h3 className="text-2xl font-semibold mb-2">结果将在此处显示</h3>
          <p>上传图片后，点击“开始虚拟试穿”查看结果。</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;