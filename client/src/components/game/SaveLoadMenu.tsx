import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSaveManager, SaveData } from '@/lib/stores/useSaveManager';

interface SaveLoadMenuProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
}

const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({ isOpen, onClose, mode }) => {
  const [newSaveName, setNewSaveName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { saveGame, loadGame, deleteSave, getSaves } = useSaveManager();
  
  // Get all saves
  const saves = getSaves();
  
  const handleSaveGame = () => {
    if (!newSaveName.trim()) {
      setErrorMessage('Please enter a save name');
      return;
    }
    
    try {
      const saveId = saveGame(newSaveName.trim());
      setSuccessMessage(`Game saved as "${newSaveName}"`);
      setNewSaveName('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving game:', error);
      setErrorMessage('Failed to save game. Please try again.');
    }
  };
  
  const handleLoadGame = (saveId: string) => {
    try {
      const success = loadGame(saveId);
      if (success) {
        setSuccessMessage('Game loaded successfully');
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 1000);
      } else {
        setErrorMessage('Failed to load save. Data may be corrupted.');
      }
    } catch (error) {
      console.error('Error loading game:', error);
      setErrorMessage('Failed to load game. Please try again.');
    }
  };
  
  const handleDeleteSave = (saveId: string, event: React.MouseEvent) => {
    // Prevent the click from triggering the parent's onClick
    event.stopPropagation();
    
    try {
      deleteSave(saveId);
      setSuccessMessage('Save deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting save:', error);
      setErrorMessage('Failed to delete save. Please try again.');
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-gray-900 border border-blue-500 rounded-lg w-full max-w-xl overflow-hidden shadow-xl"
      >
        <div className="p-4 bg-gradient-to-r from-blue-900 to-purple-900 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {mode === 'save' ? 'Save Game' : 'Load Game'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-400 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {/* Error and success messages */}
          {errorMessage && (
            <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 p-3 rounded-md mb-4">
              {errorMessage}
              <button 
                onClick={() => setErrorMessage('')}
                className="float-right text-red-200 hover:text-red-400"
              >
                ×
              </button>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-900 bg-opacity-50 border border-green-500 text-green-200 p-3 rounded-md mb-4">
              {successMessage}
              <button 
                onClick={() => setSuccessMessage('')}
                className="float-right text-green-200 hover:text-green-400"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Save game form */}
          {mode === 'save' && (
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-1">Save Name</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSaveName}
                  onChange={(e) => setNewSaveName(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter save name..."
                />
                <button
                  onClick={handleSaveGame}
                  disabled={!newSaveName.trim()}
                  className={`px-4 py-2 rounded-md ${
                    !newSaveName.trim()
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          )}
          
          {/* Save list */}
          <div>
            <h3 className="text-gray-300 text-lg font-semibold mb-3">
              {mode === 'save' ? 'Existing Saves' : 'Saved Games'}
            </h3>
            
            {saves.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-4 text-gray-400 text-center">
                No saved games found
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {saves
                  .sort((a, b) => b.timestamp - a.timestamp) // Sort newest first
                  .map((save: SaveData, index: number) => (
                    <div
                      key={save.id}
                      onClick={() => mode === 'load' && handleLoadGame(save.id)}
                      className={`bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-750 transition-all ${
                        mode === 'load' ? 'cursor-pointer' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-white">{save.name}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(save.timestamp)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {mode === 'save' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadGame(save.id);
                              }}
                              className="px-2 py-1 bg-blue-700 text-xs text-white rounded hover:bg-blue-600 transition"
                            >
                              Load
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteSave(save.id, e)}
                            className="px-2 py-1 bg-red-700 text-xs text-white rounded hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          {/* Footer buttons */}
          <div className="border-t border-gray-700 pt-4 mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SaveLoadMenu;