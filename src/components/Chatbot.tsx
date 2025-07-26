import React from 'react';
import { Bot, Maximize2 } from 'lucide-react';

interface ChatbotProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ language, onLanguageChange }) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">AI Mental Wellness Assistant</h2>
              <p className="text-sm text-gray-600">Your personal AI mental health companion</p>
            </div>
          </div>
          
          <a
            href="https://preview--greetings-nexus-hub.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="font-medium">Open in New Tab</span>
          </a>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          src="https://preview--greetings-nexus-hub.lovable.app/"
          className="w-full h-full border-0 bg-white"
          title="AI Mental Wellness Assistant"
          allow="microphone; camera; autoplay; fullscreen; geolocation"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-microphone allow-camera"
          loading="lazy"
        />
      </div>

      {/* Info Section */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-medium">AI-Powered Chat</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Real-time Support</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">24/7 Available</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium">Mental Health Focus</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Your conversations are private and secure. This AI assistant is designed specifically for mental wellness support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;