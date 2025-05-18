import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCompanion } from '@/lib/stores/useCompanion';
import CrewInteractionHub from './CrewInteractionHub';

interface CrewQuartersInterfaceProps {
  onClose: () => void;
  location?: string;
}

const CrewQuartersInterface: React.FC<CrewQuartersInterfaceProps> = ({
  onClose,
  location = 'ship_quarters'
}) => {
  const { availableCompanions } = useCompanion();
  const [showInteractions, setShowInteractions] = useState(false);
  
  // Calculate how many crew members are available
  const crewCount = availableCompanions.length;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40">
      <motion.div 
        className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Crew Quarters</h2>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        {/* Main content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Crew overview */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Crew Status</h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">Available Crew</span>
                  <span className="text-blue-400 font-semibold">{crewCount}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Crew Morale</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mr-2">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: '75%' }}
                        />
                      </div>
                      <span className="text-green-400">Good</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Rest Cycle</span>
                    <span className="text-yellow-400">Alpha Shift</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowInteractions(true)}
                  >
                    Interact with Crew
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Quarters Facilities</h3>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="text-blue-400 mr-2">•</span>
                      <span className="text-gray-300">Recreation Area</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-400 mr-2">•</span>
                      <span className="text-gray-300">Mess Hall</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-400 mr-2">•</span>
                      <span className="text-gray-300">Personal Quarters</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-400 mr-2">•</span>
                      <span className="text-gray-300">Meeting Room</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Right side - Crew information and activities */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Current Activities</h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                {availableCompanions.length > 0 ? (
                  <div className="space-y-4">
                    {availableCompanions.slice(0, 3).map((companion, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm mr-3">
                            {companion.name.charAt(0)}
                          </div>
                          <span className="text-gray-300">{companion.name}</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                          {index === 0 ? "Research" : index === 1 ? "Maintenance" : "Off Duty"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No crew members available</p>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-3">Ship Log</h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-52 overflow-auto">
                <div className="space-y-3">
                  <div className="border-b border-gray-700 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Crew Rotation Completed</span>
                      <span className="text-xs text-gray-400">Ship Time: 0800</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">All crew positions covered for current mission parameters.</p>
                  </div>
                  
                  <div className="border-b border-gray-700 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Maintenance Report</span>
                      <span className="text-xs text-gray-400">Ship Time: 0630</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Engineering completed routine checks on life support systems.</p>
                  </div>
                  
                  <div className="border-b border-gray-700 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Supply Inventory</span>
                      <span className="text-xs text-gray-400">Ship Time: 0545</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Weekly inventory completed. All supplies at acceptable levels.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Crew Interaction Hub overlay */}
      <AnimatePresence>
        {showInteractions && (
          <CrewInteractionHub 
            onClose={() => setShowInteractions(false)}
            location={location}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrewQuartersInterface;