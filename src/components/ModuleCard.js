import React from 'react';

const ModuleCard = ({ title, icon, description, onClick }) => (
  <div 
    className="bg-gray-800 rounded-lg p-6 hover:shadow-lg hover:shadow-blue-900/20 transition-all cursor-pointer transform hover:-translate-y-1 card-hover"
    onClick={onClick}
  >
    <div className="text-4xl mb-4 text-blue-400">
      <i className={`fa fa-${icon}`}></i>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
    <div className="mt-4 text-blue-400 flex items-center">
      <span>查看详情</span>
      <i className="fa fa-arrow-right ml-2"></i>
    </div>
  </div>
);

export default ModuleCard;
    
