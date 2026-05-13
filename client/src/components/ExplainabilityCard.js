import React from 'react';

const ExplainabilityCard = ({ predictionData, onClose }) => {
    if (!predictionData) return null;

    const { bloodGroup, baseDemand, finalPrediction, factors } = predictionData;

    return (
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            {/* Header section with Close Button */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        AI Logic: {bloodGroup} Demand
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Historical Base Average: <span className="font-semibold text-gray-700">{baseDemand} Units</span>
                    </p>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                )}
            </div>

            {/* Waterfall Body */}
            <div className="p-6 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dynamic Adjustments (SHAP)</p>
                
                {factors.map((factor, index) => {
                    const isIncrease = factor.type === 'increase';
                    
                    return (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-gray-700 font-medium">{factor.feature}</span>
                            
                            <span className={`px-3 py-1 rounded-md font-bold text-sm flex items-center ${
                                isIncrease 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : 'bg-green-100 text-green-700 border border-green-200'
                            }`}>
                                {isIncrease ? '+' : ''}{factor.impact}
                                {isIncrease 
                                    ? <i className="fa-solid fa-arrow-trend-up ml-2 opacity-70"></i>
                                    : <i className="fa-solid fa-arrow-trend-down ml-2 opacity-70"></i>
                                }
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Footer with Final Prediction */}
            <div className="bg-gray-800 p-6 border-t-4 border-red-500">
                <div className="flex justify-between items-center">
                    <span className="text-gray-200 font-medium text-lg">Final Predicted Need</span>
                    <span className="text-white font-extrabold text-3xl">{finalPrediction} <span className="text-sm font-normal text-gray-400">Units</span></span>
                </div>
            </div>
        </div>
    );
};

export default ExplainabilityCard;
