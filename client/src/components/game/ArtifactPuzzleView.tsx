import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float } from '@react-three/drei';
import ArtifactModel from './ArtifactModel';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, Lightbulb } from 'lucide-react';
import { SkillType } from '@/lib/types';

interface ArtifactPuzzleViewProps {
  puzzleId: string;
  onClose: () => void;
  onStartPuzzle: (puzzleId: string) => void;
}

const ArtifactPuzzleView: React.FC<ArtifactPuzzleViewProps> = ({ 
  puzzleId, 
  onClose,
  onStartPuzzle
}) => {
  const [isRotating, setIsRotating] = useState(true);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <Card className="w-full max-w-4xl bg-gray-900 border-gray-700 text-white overflow-hidden">
        <CardHeader className="pb-2 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Ancient Alien Artifact</CardTitle>
              <CardDescription className="text-gray-400 flex items-center gap-2">
                <Badge className="bg-amber-800 text-amber-200">Pattern Puzzle</Badge>
                <Badge className="bg-gray-800 text-gray-200">Difficulty: ★★★★☆</Badge>
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
              Close
            </Button>
          </div>
        </CardHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* 3D Artifact View */}
          <div className="h-[400px] relative bg-black">
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[0, 0, 7]} />
              
              <Suspense fallback={null}>
                <Float
                  speed={1.5}
                  rotationIntensity={isRotating ? 0.5 : 0}
                  floatIntensity={0.3}
                >
                  <ArtifactModel scale={2.5} />
                </Float>
                
                <Environment preset="city" />
                
                <ContactShadows
                  position={[0, -2, 0]}
                  opacity={0.4}
                  scale={10}
                  blur={1.5}
                  far={5}
                />
              </Suspense>
              
              <OrbitControls 
                enablePan={false}
                enableZoom={true}
                minDistance={4}
                maxDistance={10}
                autoRotate={isRotating}
                autoRotateSpeed={1}
              />
            </Canvas>
            
            <Button 
              variant="outline" 
              size="sm"
              className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-60"
              onClick={() => setIsRotating(!isRotating)}
            >
              {isRotating ? "Stop Rotation" : "Start Rotation"}
            </Button>
          </div>
          
          {/* Puzzle Description */}
          <div className="p-6 flex flex-col h-[400px] overflow-hidden bg-gray-950">
            <h3 className="text-xl text-blue-300 font-semibold mb-4">
              Mysterious Discovery
            </h3>
            
            <p className="text-gray-300 mb-6 overflow-y-auto flex-grow">
              Your team has discovered an ancient alien artifact of unknown origin. The polyhedral object is covered in intricate geometric patterns and seems to respond to certain stimuli. Initial scans reveal it contains advanced technology far beyond our current understanding.
              <br /><br />
              The artifact appears to be a data storage device, but its interface is completely unfamiliar. Finding a way to activate it could provide valuable insights into the long-extinct civilization that created it.
              <br /><br />
              <span className="text-amber-300">
                <Lightbulb className="inline-block h-4 w-4 mr-1" />
                Note: This puzzle has multiple solution approaches. Your character's skills will influence your chances of success with different methods.
              </span>
            </p>
            
            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-900 bg-opacity-40 text-green-300">
                  <Brain className="h-4 w-4 mr-1" />
                  Scientific Approach
                </Badge>
                <Badge className="bg-blue-900 bg-opacity-40 text-blue-300">
                  Technical Solutions
                </Badge>
                <Badge className="bg-purple-900 bg-opacity-40 text-purple-300">
                  Intuitive Methods
                </Badge>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="default" 
                  className="bg-blue-700 hover:bg-blue-600"
                  onClick={() => onStartPuzzle(puzzleId)}
                >
                  Attempt Activation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ArtifactPuzzleView;