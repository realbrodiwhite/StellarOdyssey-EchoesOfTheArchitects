import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  useCompanion, 
  companionTemplates, 
  CompanionPersonality 
} from '@/lib/stores/useCompanion';

interface CompanionSelectionProps {
  onClose: () => void;
}

const CompanionSelection: React.FC<CompanionSelectionProps> = ({ onClose }) => {
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customPersonality, setCustomPersonality] = useState<CompanionPersonality>(CompanionPersonality.Logical);
  const [isCustom, setIsCustom] = useState(false);
  
  const { selectCompanion, createCompanion } = useCompanion();
  
  const handleSelectCompanion = (id: string) => {
    setSelectedCompanionId(id);
    setIsCustom(false);
  };
  
  const handleActivateCompanion = () => {
    if (isCustom) {
      if (customName.trim()) {
        createCompanion(customName.trim(), customPersonality);
        onClose();
      }
    } else if (selectedCompanionId) {
      selectCompanion(selectedCompanionId);
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-gray-900 border border-blue-500 rounded-lg w-full max-w-4xl overflow-hidden shadow-xl"
      >
        <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Select AI Companion</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-400 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 mb-6">
            Choose an AI companion to assist you throughout your journey. Each companion has unique personality traits and specializations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Standard companion templates */}
            {companionTemplates.map(companion => (
              <div
                key={companion.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedCompanionId === companion.id && !isCustom
                    ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                    : 'border-gray-700 bg-gray-800 hover:border-blue-400'
                }`}
                onClick={() => handleSelectCompanion(companion.id)}
              >
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                    {companion.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{companion.name}</h3>
                    <div className="text-xs text-blue-300">{companion.fullName}</div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm">
                  <div className="text-blue-200 mb-1">
                    <span className="font-semibold">Personality:</span> {companion.personality}
                  </div>
                  <div className="text-gray-300 mb-2">
                    <span className="font-semibold">Specialization:</span> {companion.specialization}
                  </div>
                  <p className="text-gray-400 text-xs border-t border-gray-700 pt-2 mt-2">
                    {companion.backstory}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Custom companion option */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isCustom
                  ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                  : 'border-gray-700 bg-gray-800 hover:border-blue-400'
              }`}
              onClick={() => {
                setIsCustom(true);
                setSelectedCompanionId(null);
              }}
            >
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-3">
                  +
                </div>
                <div>
                  <h3 className="font-bold text-white">Custom AI</h3>
                  <div className="text-xs text-green-300">Create your own companion</div>
                </div>
              </div>
              
              {isCustom && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Companion Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Personality</label>
                    <select
                      value={customPersonality}
                      onChange={(e) => setCustomPersonality(e.target.value as CompanionPersonality)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {Object.values(CompanionPersonality).map(personality => (
                        <option key={personality} value={personality}>
                          {personality}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {!isCustom && (
                <p className="text-gray-400 text-sm">
                  Create a custom AI companion with a personality of your choice.
                </p>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-300 mr-3 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleActivateCompanion}
              disabled={(!selectedCompanionId && !isCustom) || (isCustom && !customName.trim())}
              className={`px-4 py-2 rounded-md ${
                (!selectedCompanionId && !isCustom) || (isCustom && !customName.trim())
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Activate Companion
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanionSelection;