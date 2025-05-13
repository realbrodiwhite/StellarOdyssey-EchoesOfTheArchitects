import { useEffect, useState } from 'react';

interface TextCrawlProps {
  title: string;
  content: string[];
  onComplete: () => void;
  skipEnabled?: boolean;
}

const TextCrawl = ({ title, content, onComplete, skipEnabled = true }: TextCrawlProps) => {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    // Set a timer to automatically dismiss the crawl after animation completes
    // Animation duration is 60s as defined in CSS
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete();
    }, 60000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  const handleSkip = () => {
    if (skipEnabled) {
      setIsActive(false);
      onComplete();
    }
  };
  
  if (!isActive) return null;
  
  return (
    <div className="crawl-container" onClick={handleSkip}>
      <div className="crawl-content">
        <h1 className="crawl-title">{title}</h1>
        {content.map((paragraph, index) => (
          <p key={index} className="mb-12">{paragraph}</p>
        ))}
      </div>
      
      {skipEnabled && (
        <div className="absolute bottom-6 right-6 text-white text-sm opacity-70 z-50">
          Click anywhere to skip
        </div>
      )}
    </div>
  );
};

export default TextCrawl;