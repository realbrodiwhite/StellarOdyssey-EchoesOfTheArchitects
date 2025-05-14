import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanion, DialogueType, CompanionDialogue } from '@/lib/stores/useCompanion';
import { LocationType } from '@/lib/types';
import { useStory } from '@/lib/stores/useStory';

interface CompanionChatProps {
  minimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

const CompanionChat: React.FC<CompanionChatProps> = ({
  minimized = false,
  onToggleMinimize,
  onClose
}) => {
  const [inputText, setInputText] = useState('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const {
    activeCompanion,
    getDialogueHistory,
    addDialogue,
    getRandomDialogue,
    improveRelationship
  } = useCompanion();
  
  const { getCurrentLocation } = useStory();
  const currentLocation = getCurrentLocation();
  
  // Dialogue history
  const dialogues = getDialogueHistory().slice(0, 50); // Limit to most recent 50 messages
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current && !minimized) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dialogues.length, minimized]);
  
  // Generate context-aware dialogue when location changes
  useEffect(() => {
    if (!activeCompanion || !currentLocation) return;
    
    // Generate location-specific dialogue
    let dialogue: string;
    
    switch (currentLocation.type) {
      case LocationType.Planet:
        dialogue = getRandomDialogue(DialogueType.Exploration);
        break;
      case LocationType.Station:
        dialogue = getRandomDialogue(DialogueType.LocationInfo);
        break;
      case LocationType.Space:
        dialogue = getRandomDialogue(DialogueType.Exploration);
        break;
      case LocationType.Ship:
        dialogue = getRandomDialogue(DialogueType.Random);
        break;
      case LocationType.Derelict:
        dialogue = getRandomDialogue(DialogueType.Lore);
        break;
      default:
        dialogue = getRandomDialogue(DialogueType.Random);
    }
    
    addDialogue(DialogueType.LocationInfo, dialogue, { location: currentLocation.id });
  }, [currentLocation?.id]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !activeCompanion) return;
    
    // Add user's message
    addDialogue(DialogueType.Random, inputText, { event: 'user_query' });
    
    // Clear input
    setInputText('');
    
    // Generate AI response based on message content
    setTimeout(() => {
      let responseType = DialogueType.Random;
      const lowerText = inputText.toLowerCase();
      
      // Determine response type based on user message
      if (lowerText.includes('combat') || lowerText.includes('fight') || lowerText.includes('battle')) {
        responseType = DialogueType.Combat;
      } else if (lowerText.includes('explore') || lowerText.includes('look around')) {
        responseType = DialogueType.Exploration;
      } else if (lowerText.includes('where') || lowerText.includes('location') || lowerText.includes('place')) {
        responseType = DialogueType.LocationInfo;
      } else if (lowerText.includes('puzzle') || lowerText.includes('solve') || lowerText.includes('problem')) {
        responseType = DialogueType.Puzzle;
      } else if (lowerText.includes('history') || lowerText.includes('lore') || lowerText.includes('story')) {
        responseType = DialogueType.Lore;
      } else if (lowerText.includes('advice') || lowerText.includes('help') || lowerText.includes('what should')) {
        responseType = DialogueType.Advice;
      } else if (lowerText.includes('hello') || lowerText.includes('hi ') || lowerText.includes('hey')) {
        responseType = DialogueType.Greeting;
      }
      
      // Get appropriate response
      const response = getRandomDialogue(responseType);
      addDialogue(responseType, response, { event: 'response' });
      
      // Slightly improve relationship with interaction
      improveRelationship(1);
    }, 1000);
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (!activeCompanion) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 border border-blue-500 rounded-lg p-4 shadow-lg text-white max-w-xs">
        <div className="text-center">
          <p>No AI companion active</p>
          <button className="mt-2 bg-blue-600 py-1 px-3 rounded text-sm">Activate Companion</button>
        </div>
      </div>
    );
  }
  
  return (
    <AnimatePresence>
      {!minimized ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed ${chatExpanded ? 'bottom-0 right-0 w-1/3 h-screen' : 'bottom-4 right-4 w-80 h-96'} 
            bg-gray-900 border border-blue-500 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out z-30`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-2 flex justify-between items-center">
            <div className="flex items-center">
              {/* Avatar - placeholder for an image */}
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 font-bold mr-2">
                {activeCompanion.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white">{activeCompanion.name}</h3>
                <div className="text-xs text-blue-200">{activeCompanion.personality}</div>
              </div>
            </div>
            <div className="flex">
              <button 
                onClick={() => setChatExpanded(prev => !prev)}
                className="text-white hover:text-blue-200 mr-2"
              >
                {chatExpanded ? '↙' : '↗'}
              </button>
              <button 
                onClick={onToggleMinimize}
                className="text-white hover:text-blue-200 mr-2"
              >
                _
              </button>
              <button 
                onClick={onClose}
                className="text-white hover:text-red-400"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Chat messages */}
          <div 
            className="p-3 overflow-y-auto"
            style={{ height: 'calc(100% - 96px)' }}
          >
            {dialogues.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No conversation history yet.
              </div>
            ) : (
              <>
                {dialogues.map((dialogue: CompanionDialogue) => (
                  <div key={dialogue.id} className="mb-3">
                    {/* Messages from the AI */}
                    {dialogue.triggerEvent !== 'user_query' ? (
                      <div className="flex items-start mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 text-xs font-bold mr-2 mt-1">
                          {activeCompanion.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-blue-900 rounded-lg p-2 text-white inline-block">
                            {dialogue.text}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(dialogue.timestamp)}
                          </div>
                        </div>
                      </div>
                    ) : (
                    /* Messages from the user */
                      <div className="flex items-start mb-2 justify-end">
                        <div className="flex-1 text-right">
                          <div className="bg-gray-700 rounded-lg p-2 text-white inline-block">
                            {dialogue.text}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(dialogue.timestamp)}
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-green-900 text-xs font-bold ml-2 mt-1">
                          Y
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-2 border-t border-gray-700">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeCompanion.name}...`}
                className="flex-1 bg-gray-800 text-white rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition"
              >
                Send
              </button>
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="fixed bottom-4 right-4 bg-gray-900 border border-blue-500 rounded-full p-3 shadow-lg cursor-pointer hover:bg-gray-800 transition z-30"
          onClick={onToggleMinimize}
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {activeCompanion.name.charAt(0)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompanionChat;