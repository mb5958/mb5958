import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-10">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
        人工智能虚拟试穿
      </h1>
      <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
        在购买前看看衣服穿在您身上的效果。上传您的照片和服装即可开始。
      </p>
    </header>
  );
};

export default Header;