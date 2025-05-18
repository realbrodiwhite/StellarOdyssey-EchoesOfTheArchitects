import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements } from '@/lib/stores/useAchievements';
import CompanionChat from './CompanionChat';
import StarQuestManager from './StarQuestManager';
import StoryRecord from './StoryRecord';
import SpaceNavigation from './SpaceNavigation';
import CrewQuartersInterface from './CrewQuartersInterface';
import { Layers, AlertCircle, BarChart3, Zap, Award, Bot, Map, BookOpen, Navigation, Users } from 'lucide-react';

interface ForearmPadProps {
  onClose: () => void;
}

const ForearmPad: React.FC<ForearmPadProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('status');
  const [showCompanionChat, setShowCompanionChat] = useState(false);
  const [showStoryRecord, setShowStoryRecord] = useState(false);
  const [showCrewQuarters, setShowCrewQuarters] = useState(false);
  
  const { hasUnlockedCompanionAI, achievements } = useAchievements();
  
  // Define the available tabs
  const tabs = [
    { id: 'status', label: 'Status', icon: <BarChart3 size={18} /> },
    { id: 'systems', label: 'Systems', icon: <Layers size={18} /> },
    { id: 'navigation', label: 'Navigation', icon: <Navigation size={18} /> },
    { id: 'missions', label: 'Missions', icon: <Map size={18} /> },
    { id: 'crew', label: 'Crew', icon: <Users size={18} /> },
    { id: 'story', label: 'Story', icon: <BookOpen size={18} /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertCircle size={18} /> },
    { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> }
  ];
  
  // If companion AI is unlocked, add it as a tab
  if (hasUnlockedCompanionAI()) {
    tabs.push({ id: 'companion', label: 'A.I.', icon: <Bot size={18} /> });
  }
  
  // Mock data for demonstration
  const systemStatus = [
    { name: 'Life Support', status: 'Nominal', value: 98 },
    { name: 'Navigation', status: 'Active', value: 100 },
    { name: 'Propulsion', status: 'Nominal', value: 92 },
    { name: 'Shields', status: 'Reduced', value: 67 },
    { name: 'Communications', status: 'Nominal', value: 100 }
  ];
  
  const alerts = [
    { 
      id: '1', 
      title: 'Shield Power Low', 
      description: 'Main shield power below 70%', 
      priority: 'medium', 
      timestamp: Date.now() - 1000 * 60 * 5 
    },
    { 
      id: '2', 
      title: 'New Signal Detected', 
      description: 'Unknown signal originating from sector J-17', 
      priority: 'low', 
      timestamp: Date.now() - 1000 * 60 * 30 
    }
  ];
  
  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    return minutes < 60 
      ? `${minutes} min ago` 
      : `${Math.floor(minutes / 60)} hr ${minutes % 60} min ago`;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border-2 border-blue-600 rounded-lg overflow-hidden shadow-xl max-w-xl w-full max-h-[80vh]"
      >
        {/* Forearm Pad Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-3 flex justify-between items-center border-b border-blue-500">
          <div className="flex items-center">
            <Zap className="text-blue-300 mr-2" size={20} />
            <h2 className="text-xl font-bold text-white">Forearm Terminal v2.4</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                
                // Handle special tabs
                if (tab.id === 'companion') {
                  setShowCompanionChat(true);
                  setShowStoryRecord(false);
                  setShowCrewQuarters(false);
                } else if (tab.id === 'story') {
                  setShowStoryRecord(true);
                  setShowCompanionChat(false);
                  setShowCrewQuarters(false);
                } else if (tab.id === 'crew') {
                  setShowCrewQuarters(true);
                  setShowCompanionChat(false);
                  setShowStoryRecord(false);
                } else {
                  setShowCompanionChat(false);
                  setShowStoryRecord(false);
                  setShowCrewQuarters(false);
                }
              }}
              className={`flex items-center px-4 py-2 text-sm ${
                activeTab === tab.id 
                  ? 'bg-blue-900 bg-opacity-50 text-blue-300 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="p-4 h-96 overflow-y-auto">
          {activeTab === 'status' && (
            <div>
              <h3 className="text-blue-300 font-semibold mb-4">Ship Systems Status</h3>
              {systemStatus.map((system, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">{system.name}</span>
                    <span className={`${
                      system.value >= 90 ? 'text-green-400' : 
                      system.value >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {system.status} ({system.value}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        system.value >= 90 ? 'bg-green-500' : 
                        system.value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${system.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'navigation' && (
            <SpaceNavigation onClose={onClose} />
          )}
          
          {activeTab === 'systems' && (
            <div>
              <h3 className="text-blue-300 font-semibold mb-4">Ship Systems Control</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Navigation</h4>
                  <div className="text-gray-400 text-sm">Auto-pilot: <span className="text-green-400">Engaged</span></div>
                  <div className="text-gray-400 text-sm">Current course: <span className="text-white">Sector K-9</span></div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Power Systems</h4>
                  <div className="text-gray-400 text-sm">Reactor: <span className="text-green-400">Nominal</span></div>
                  <div className="text-gray-400 text-sm">Output: <span className="text-white">98%</span></div>
                </div>
                
                {hasUnlockedCompanionAI() ? (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Companion AI</h4>
                    <div className="text-gray-400 text-sm">Status: <span className="text-green-400">Online</span></div>
                    <div className="text-gray-400 text-sm">Modules: <span className="text-white">Basic</span></div>
                  </div>
                ) : (
                  <div className="bg-gray-800 p-3 rounded-lg border border-yellow-800">
                    <h4 className="text-yellow-500 font-medium mb-2">Companion AI</h4>
                    <div className="text-gray-400 text-sm">Status: <span className="text-yellow-500">Locked</span></div>
                    <div className="text-gray-400 text-sm">Required: <span className="text-white">Technical Puzzle Completion</span></div>
                  </div>
                )}
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Communications</h4>
                  <div className="text-gray-400 text-sm">Range: <span className="text-white">Standard</span></div>
                  <div className="text-gray-400 text-sm">Channels: <span className="text-white">Alliance, Commercial</span></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Missions Tab */}
          {activeTab === 'missions' && (
            <div className="h-full">
              <h3 className="text-blue-300 font-semibold mb-4">Star Quest Missions</h3>
              <div className="max-h-80 overflow-auto">
                <StarQuestManager onQuestComplete={() => {}} />
              </div>
            </div>
          )}
          
          {/* Story Tab */}
          {activeTab === 'story' && !showStoryRecord && (
            <div className="h-full">
              <h3 className="text-blue-300 font-semibold mb-4">Journey Records</h3>
              <p className="text-gray-300 mb-4">
                Access your complete mission history, journey log, and faction relationships.
              </p>
              <button 
                onClick={() => setShowStoryRecord(true)}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md transition"
              >
                View Full Story Record
              </button>
            </div>
          )}
          
          {showStoryRecord && (
            <StoryRecord onClose={() => setShowStoryRecord(false)} />
          )}
          
          {/* Crew Tab */}
          {activeTab === 'crew' && !showCrewQuarters && (
            <div className="h-full">
              <h3 className="text-blue-300 font-semibold mb-4">Crew Quarters</h3>
              <p className="text-gray-300 mb-4">
                Interact with your crew members, check their status, and manage relationships.
              </p>
              <button 
                onClick={() => setShowCrewQuarters(true)}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md transition"
              >
                Enter Crew Quarters
              </button>
            </div>
          )}
          
          {showCrewQuarters && (
            <CrewQuartersInterface 
              onClose={() => setShowCrewQuarters(false)} 
              location="ship_quarters" 
            />
          )}
          
          {activeTab === 'alerts' && (
            <div>
              <h3 className="text-blue-300 font-semibold mb-4">Active Alerts</h3>
              {alerts.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No active alerts</div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.priority === 'high' ? 'bg-red-950 border-red-700' :
                        alert.priority === 'medium' ? 'bg-yellow-950 border-yellow-700' :
                        'bg-blue-950 border-blue-700'
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className={`font-medium ${
                          alert.priority === 'high' ? 'text-red-400' :
                          alert.priority === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {alert.title}
                        </h4>
                        <span className="text-xs text-gray-400">
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{alert.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-blue-300 font-semibold mb-4">Achievements</h3>
              <div className="space-y-3">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`p-3 rounded-lg ${
                      achievement.completed 
                        ? 'bg-green-900 bg-opacity-20 border border-green-700' 
                        : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between">
                      <h4 className={`font-medium ${
                        achievement.completed ? 'text-green-400' : 'text-white'
                      }`}>
                        {achievement.name}
                      </h4>
                      {achievement.completed && (
                        <Award className="text-yellow-400" size={18} />
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{achievement.description}</p>
                    
                    {achievement.maxProgress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-gray-400">
                            {achievement.progress || 0}/{achievement.maxProgress}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${achievement.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {achievement.reward && (
                      <div className="text-xs text-yellow-300 mt-2">
                        <span className="font-semibold">Reward:</span> {achievement.reward}
                      </div>
                    )}
                    
                    {achievement.dateCompleted && (
                      <div className="text-xs text-gray-500 mt-1">
                        Completed: {new Date(achievement.dateCompleted).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Companion Tab */}
          {activeTab === 'companion' && hasUnlockedCompanionAI() && (
            <div className="h-full">
              {showCompanionChat ? (
                <CompanionChat 
                  minimized={false}
                  onToggleMinimize={() => {}}
                  onClose={() => setShowCompanionChat(false)}
                  inForearmPad={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Bot size={48} className="text-blue-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Companion AI Ready</h3>
                  <p className="text-gray-400 text-center mb-4">
                    Your ship's AI assistant is ready to help with navigation, research, and more.
                  </p>
                  <button
                    onClick={() => setShowCompanionChat(true)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md transition"
                  >
                    Activate Companion
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Companion Locked State */}
          {activeTab === 'companion' && !hasUnlockedCompanionAI() && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-gray-800 p-6 rounded-lg border border-yellow-700 text-center max-w-md">
                <Bot size={48} className="text-gray-500 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-yellow-500 mb-2">Companion AI Unavailable</h3>
                <p className="text-gray-400 mb-4">
                  The ship's AI companion system requires activation. Complete the "Technical Genius" achievement to unlock this feature.
                </p>
                <div className="p-3 bg-gray-900 rounded-md text-left">
                  <h4 className="text-sm font-semibold text-blue-400 mb-1">Achievement Required:</h4>
                  <p className="text-xs text-white">
                    <span className="text-yellow-400">Technical Genius</span> - Solve your first technical puzzle.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForearmPad;