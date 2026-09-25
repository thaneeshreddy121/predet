import React, { useState } from "react";
import SymptomPredictor from "./SymptomPredictor";

const Predict = () => {

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [precautions, setPrecautions] = useState([]);
  const [precautionsLoading, setPrecautionsLoading] = useState(false);

  const handlePredictionStart = () => {
    setIsPredicting(true);
    setPrediction(null);
    setPrecautions([]);
  };

  const fetchPrecautions = async (diseases) => {
    setPrecautionsLoading(true);
    try {
      if (!Array.isArray(diseases)) {
        diseases = [diseases]; // Ensure diseases is always an array
      }
  
      const precautionsData = await Promise.all(
        diseases.map(async (disease) => {
          const response = await fetch(`${BASE_URL}/user/disease/precautions?disease=${encodeURIComponent(disease)}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch precautions for ${disease}`);
          }
          return response.json();
        })
      );
  
      console.log("Precautions:", precautionsData);
      setPrecautions(precautionsData);
    } catch (error) {
      console.error("Error fetching precautions:", error);
      setPrecautions([]);
    } finally {
      setPrecautionsLoading(false);
    }
  };
  
  const handlePredictionResult = async (predictionData) => {
    setIsPredicting(false);
    
    // Ensure predictionData is an object, take the first element if it's an array
    const finalPrediction = Array.isArray(predictionData) ? predictionData[0] : predictionData;
    setPrediction(finalPrediction);
    
    if (finalPrediction && finalPrediction.final_prediction) {
      const diseases = Array.isArray(finalPrediction.final_prediction)
        ? finalPrediction.final_prediction
        : [finalPrediction.final_prediction]; // Convert to array if it's a string
      
      fetchPrecautions(diseases);
    }
  };

  // Glassmorphism style
  const glassmorphismStyle = {
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent">
      {/* Two-column layout with independent heights */}
      <div className="container mx-auto px-4 py-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto">
          {/* Prediction Column - Height based on content */}
          <div className="prediction-column">
            <div style={glassmorphismStyle} className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Symptom Analysis</h2>
              <SymptomPredictor 
                onPredictionStart={handlePredictionStart}
                onPredictionResult={handlePredictionResult} 
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column space-y-6">
            {/* Precautions Box */}
            <div style={glassmorphismStyle} className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-black">Disease Precautions</h2>
              
              {isPredicting ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="animate-pulse mb-4">
                    <svg className="w-16 h-16 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p className="text-lg text-black">Processing your symptoms...</p>
                </div>
              ) : precautionsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : precautions && precautions.length > 0 ? (
                <div className="space-y-6">
                  {precautions.map((item, idx) => (
                    <div key={idx} className="space-y-4">
                      <h3 className="text-xl font-semibold text-black mb-2">
                        {item.disease} Precautions
                      </h3>
                      <ul className="list-disc list-inside text-black space-y-2">
                        {item.precautions
                          .filter(precaution => precaution !== "nan")
                          .map((precaution, index) => (
                            <li key={index} className="text-sm">
                              {precaution}
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <p className="text-lg text-white">No precautions found for this condition</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

</div>
  );
};

export default Predict;