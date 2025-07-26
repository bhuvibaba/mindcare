import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import VoiceAssistant from './components/VoiceAssistant';
import TherapistFinder from './components/TherapistFinder';
import Journal from './components/Journal';
import MoodAnalytics from './components/MoodAnalytics';
import Mindfulness from './components/Mindfulness';
import Settings from './components/Settings';
import Wellness from './components/Wellness';
import FloatingVoiceWidget from './components/FloatingVoiceWidget';
import { User, Session } from './types';
import { storage, initializeUser, mockAuth } from './utils/storage';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState('en');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = mockAuth.isLoggedIn();
    setIsAuthenticated(loggedIn);
    
    if (loggedIn) {
      const initialUser = initializeUser();
      setUser(initialUser);
    }
    
    setLanguage(storage.getLanguage());
    setSessions(storage.getSessions());

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    // Set up periodic coin updates
    const interval = setInterval(() => {
      const currentUser = storage.getUser();
      if (currentUser && user && currentUser.coins !== user.coins) {
        setUser(currentUser);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.coins]);

  const handleLogin = (email: string, name: string) => {
    mockAuth.login(email, name);
    setIsAuthenticated(true);
    const user = storage.getUser();
    setUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    mockAuth.logout();
    setIsAuthenticated(false);
    setUser(null);
    setActiveSection('dashboard');
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    storage.setLanguage(newLanguage);
    
    if (user) {
      const updatedUser = { ...user, language: newLanguage };
      setUser(updatedUser);
      storage.setUser(updatedUser);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return user ? <Dashboard user={user} sessions={sessions} /> : null;
      case 'chatbot':
        return <Chatbot language={language} onLanguageChange={handleLanguageChange} />;
      case 'therapists':
        return <TherapistFinder />;
      case 'journal':
        return <Journal />;
      case 'mood-analytics':
        return <MoodAnalytics />;
      case 'mindfulness':
        return <Mindfulness />;
      case 'wellness':
        return <Wellness />;
      case 'settings':
        return <Settings language={language} onLanguageChange={handleLanguageChange} />;
      default:
        return user ? <Dashboard user={user} sessions={sessions} /> : null;
    }
  };

  // Show authentication modal if not logged in and loading is complete
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-6xl">🧠</span>
            </div>
            
            {/* Hero Text */}
            <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              MindCare
            </h1>
            <p className="text-3xl text-purple-200 mb-4">AI-Powered Mental Wellness Platform</p>
            <p className="text-xl text-purple-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Your personal AI companion for mental health support, mood tracking, mindfulness, and connecting with professional therapists.
            </p>
            
            {/* CTA Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Start Your Wellness Journey ✨
            </button>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Assistant</h3>
                <p className="text-purple-200 leading-relaxed">24/7 mental health support with natural language understanding and emotional intelligence</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Mood Analytics</h3>
                <p className="text-purple-200 leading-relaxed">Track your emotional journey with detailed analytics and personalized insights</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🧘</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Mindfulness</h3>
                <p className="text-purple-200 leading-relaxed">Guided meditation, breathing exercises, and wellness tools for inner peace</p>
              </div>
            </div>
          </div>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="text-center z-10">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-2xl">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                <span className="text-5xl">🧠</span>
              </div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur opacity-30 animate-ping"></div>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            MindCare
          </h1>
          <p className="text-2xl text-purple-200 mb-8">AI-Powered Mental Wellness Platform</p>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="w-4 h-4 bg-cyan-400 rounded-full mx-auto mb-2 animate-bounce"></div>
              <p className="text-sm text-gray-300">AI Assistant</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-purple-400 rounded-full mx-auto mb-2 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <p className="text-sm text-gray-300">Mood Analytics</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-pink-400 rounded-full mx-auto mb-2 animate-bounce" style={{animationDelay: '0.4s'}}></div>
              <p className="text-sm text-gray-300">Therapist Finder</p>
            </div>
          </div>
          
          <div className="w-80 h-3 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-400 mt-4">Preparing your personalized wellness experience...</p>
        </div>
      </div>
    );
  }






  if (!user) return null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        userCoins={user?.coins || 0}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto relative z-10">
        {renderActiveSection()}
      </div>
      <FloatingVoiceWidget />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default App;