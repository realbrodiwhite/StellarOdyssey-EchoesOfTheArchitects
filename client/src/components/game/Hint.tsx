import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { X } from "lucide-react";

interface HintProps {
  text: string;
  onClose: () => void;
}

const Hint = ({ text, onClose }: HintProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow animation to complete
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="mt-4 mb-6"
        >
          <Card className="p-4 bg-blue-900 border border-blue-700 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={handleClose}
            >
              <X size={14} />
            </Button>
            
            <h3 className="text-blue-300 font-semibold mb-2">HINT</h3>
            <p className="text-white">{text}</p>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Hint;
