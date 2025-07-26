import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Trash2, 
  RefreshCw,
  Heart,
  Brain,
  Sparkles,
  MessageCircle,
  Smile,
  Meh,
  Frown,
  Settings,
  Download
} from 'lucide-react';
import { ChatMessage, EmotionAnalysis } from '../types';
import { sendChatMessage, analyzeEmotion, speakTextWithEmotion } from '../utils/api';
import { storage } from '../utils/storage';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [chatPersonality, setChatPersonality] = useState<'supportive' | 'professional' | 'friendly'>('supportive');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Load saved messages
    const savedMessages = localStorage.getItem('mindcare_chat_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "Hello! I'm your AI mental wellness companion. I'm here to listen, support, and help you on your wellness journey. How are you feeling today?",
        sender: 'bot',
        timestamp: new Date(),
        emotion: 'supportive',
        language: 'en'
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mindcare_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      language: storage.getLanguage()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Analyze emotion
      const emotion = await analyzeEmotion(userMessage.content);
      setCurrentEmotion(emotion);

      // Get AI response
      const aiResponse = await sendChatMessage(userMessage.content, storage.getLanguage(), chatPersonality);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        emotion: emotion.emotion,
        language: storage.getLanguage()
      };

      setMessages(prev => [...prev, botMessage]);

      // Speak response if voice is enabled
      if (voiceEnabled) {
        await speakTextWithEmotion(aiResponse, emotion.emotion);
      }

      // Award coins for interaction
      const user = storage.getUser();
      if (user) {
        storage.updateCoins(user.coins + 2);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now, but I'm still here for you. Sometimes taking a deep breath and focusing on the present moment can help. What's one thing you're grateful for today?",
        sender: 'bot',
        timestamp: new Date(),
        emotion: 'supportive',
        language: storage.getLanguage()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('mindcare_chat_messages');
    setCurrentEmotion(null);
    
    // Add welcome message back
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      content: "Hello! I'm your AI mental wellness companion. I'm here to listen, support, and help you on your wellness journey. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
      emotion: 'supportive',
      language: 'en'
    };
    setMessages([welcomeMessage]);
  };

  const exportChat = () => {
    const chatData = {
      messages,
      exportDate: new Date().toISOString(),
      totalMessages: messages.length
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindcare_chat_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case 'happy':
      case 'joy':
      case 'excited':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'sad':
      case 'depressed':
      case 'down':
        return <Frown className="w-4 h-4 text-red-500" />;
      case 'anxious':
      case 'worried':
      case 'stressed':
        return <Brain className="w-4 h-4 text-orange-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPersonalityDescription = (personality: string) => {
    switch (personality) {
      case 'supportive':
        return 'Warm, empathetic, and encouraging';
      case 'professional':
        return 'Clinical, structured, and informative';
      case 'friendly':
        return 'Casual, upbeat, and conversational';
      default:
        return 'Supportive';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Chat Assistant</h2>
              <p className="text-purple-200">Your personal AI mental wellness companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Current Emotion Display */}
            {currentEmotion && (
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                {getEmotionIcon(currentEmotion.emotion)}
                <span className="text-sm text-white font-medium capitalize">
                  {currentEmotion.emotion}
                </span>
                <span className="text-xs text-purple-200">
                  {Math.round(currentEmotion.confidence * 100)}%
                </span>
              </div>
            )}
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-sm border border-white/20"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Chat Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personality Setting */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  AI Personality
                </label>
                <select
                  value={chatPersonality}
                  onChange={(e) => setChatPersonality(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                >
                  <option value="supportive" className="bg-gray-800">Supportive</option>
                  <option value="professional" className="bg-gray-800">Professional</option>
                  <option value="friendly" className="bg-gray-800">Friendly</option>
                </select>
                <p className="text-xs text-purple-300 mt-1">
                  {getPersonalityDescription(chatPersonality)}
                </p>
              </div>

              {/* Voice Settings */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Voice Response
                </label>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    voiceEnabled
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{voiceEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              {/* Chat Actions */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Chat Actions
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={exportChat}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs">Export</span>
                  </button>
                  <button
                    onClick={clearChat}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs">Clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm border ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-cyan-400/30'
                  : 'bg-white/10 text-white border-white/20'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center space-x-2 mb-2">
                {message.sender === 'bot' ? (
                  <Bot className="w-5 h-5 text-purple-300" />
                ) : (
                  <User className="w-5 h-5 text-cyan-300" />
                )}
                <span className="text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {message.emotion && message.sender === 'user' && (
                  <div className="flex items-center space-x-1">
                    {getEmotionIcon(message.emotion)}
                    <span className="text-xs opacity-75 capitalize">{message.emotion}</span>
                  </div>
                )}
              </div>
              
              {/* Message Content */}
              <p className="leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 rounded-2xl shadow-xl">
              <div className="flex items-center space-x-3">
                <Bot className="w-5 h-5 text-purple-300" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-purple-200">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-6 relative z-10">
        <div className="flex items-center space-x-4">
          {/* Voice Input Button */}
          <button
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`p-4 rounded-xl transition-all shadow-lg ${
              isListening
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your thoughts, feelings, or ask for support..."
              disabled={isLoading}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-2xl transition-all shadow-lg disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "I'm feeling anxious",
            "I need motivation",
            "Help me relax",
            "I'm having a tough day",
            "I want to practice gratitude"
          ].map((quickMessage) => (
            <button
              key={quickMessage}
              onClick={() => setInputMessage(quickMessage)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white rounded-xl text-sm transition-all backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              {quickMessage}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;