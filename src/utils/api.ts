import { EmotionAnalysis } from '../types';

// OpenRouter API configuration
const OPENROUTER_API_KEY = 'your-api-key-here'; // Replace with actual API key
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Send chat message to AI
export const sendChatMessage = async (
  message: string, 
  language: string = 'en', 
  emotion: string = 'neutral'
): Promise<string> => {
  try {
    // For demo purposes, return a simulated response
    // In production, this would make an actual API call to OpenRouter
    const responses = {
      en: [
        "I understand you're going through a difficult time. It's completely normal to feel this way, and I'm here to support you.",
        "Thank you for sharing that with me. Your feelings are valid, and it takes courage to express them.",
        "I hear you, and I want you to know that you're not alone in this. Let's work through this together.",
        "That sounds challenging. Remember that it's okay to take things one step at a time.",
        "I appreciate you opening up to me. How are you feeling right now in this moment?"
      ],
      hi: [
        "मैं समझ सकता हूं कि आप एक कठिन समय से गुजर रहे हैं। ऐसा महसूस करना बिल्कुल सामान्य है।",
        "मुझसे यह साझा करने के लिए धन्यवाद। आपकी भावनाएं वैध हैं।",
        "मैं आपकी बात सुन रहा हूं। आप इसमें अकेले नहीं हैं।"
      ]
    };

    const languageResponses = responses[language as keyof typeof responses] || responses.en;
    const randomResponse = languageResponses[Math.floor(Math.random() * languageResponses.length)];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return randomResponse;

  } catch (error) {
    console.error('Error sending chat message:', error);
    return "I'm here to listen and support you. Could you tell me more about how you're feeling?";
  }
};

// Analyze emotion from text
export const analyzeEmotion = (text: string): EmotionAnalysis => {
  // Simple emotion analysis based on keywords
  const emotionKeywords = {
    happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'good', 'smile', 'laugh'],
    sad: ['sad', 'depressed', 'down', 'upset', 'cry', 'tears', 'lonely', 'hurt', 'pain', 'grief'],
    angry: ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated', 'irritated'],
    anxious: ['anxious', 'worried', 'nervous', 'stress', 'panic', 'fear', 'scared', 'overwhelmed'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content'],
    confused: ['confused', 'lost', 'uncertain', 'unclear', 'puzzled', 'bewildered'],
    hopeful: ['hopeful', 'optimistic', 'positive', 'confident', 'determined', 'motivated'],
    lonely: ['lonely', 'alone', 'isolated', 'abandoned', 'disconnected']
  };

  const lowerText = text.toLowerCase();
  let detectedEmotion = 'neutral';
  let maxMatches = 0;
  let confidence = 0.5;

  // Count keyword matches for each emotion
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion;
      confidence = Math.min(0.9, 0.5 + (matches * 0.1));
    }
  }

  // Determine intensity based on confidence and text length
  let intensity: 'low' | 'medium' | 'high' = 'medium';
  if (confidence < 0.6) intensity = 'low';
  else if (confidence > 0.8) intensity = 'high';

  // Generate suggestions based on detected emotion
  const suggestions = getSuggestionsForEmotion(detectedEmotion);

  return {
    emotion: detectedEmotion,
    confidence,
    intensity,
    suggestions
  };
};

// Get suggestions based on emotion
const getSuggestionsForEmotion = (emotion: string): string[] => {
  const suggestionMap: Record<string, string[]> = {
    sad: [
      'Try some gentle breathing exercises',
      'Consider reaching out to a friend or family member',
      'Practice self-compassion and be kind to yourself',
      'Engage in a small activity you enjoy'
    ],
    anxious: [
      'Practice deep breathing or meditation',
      'Try grounding techniques (5-4-3-2-1 method)',
      'Take a short walk or do light exercise',
      'Write down your worries to externalize them'
    ],
    angry: [
      'Take deep breaths and count to ten',
      'Try physical exercise to release tension',
      'Practice progressive muscle relaxation',
      'Consider what triggered this feeling'
    ],
    happy: [
      'Savor this positive moment',
      'Share your joy with someone you care about',
      'Practice gratitude for what\'s going well',
      'Use this energy for something creative'
    ],
    lonely: [
      'Reach out to a friend or family member',
      'Consider joining a community group or activity',
      'Practice self-care and self-compassion',
      'Remember that this feeling is temporary'
    ],
    neutral: [
      'Take a moment to check in with yourself',
      'Practice mindfulness to stay present',
      'Consider what would bring you joy today',
      'Remember to take care of your basic needs'
    ]
  };

  return suggestionMap[emotion] || suggestionMap.neutral;
};

// Text-to-speech with emotion
export const speakTextWithEmotion = async (
  text: string, 
  emotion: string = 'neutral', 
  language: string = 'en'
): Promise<void> => {
  try {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    const languageMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
      zh: 'zh-CN'
    };
    
    utterance.lang = languageMap[language] || 'en-US';
    
    // Adjust voice parameters based on emotion
    const emotionSettings = {
      happy: { rate: 1.1, pitch: 1.2, volume: 0.9 },
      sad: { rate: 0.8, pitch: 0.8, volume: 0.7 },
      angry: { rate: 1.2, pitch: 0.9, volume: 1.0 },
      anxious: { rate: 1.0, pitch: 1.1, volume: 0.8 },
      calm: { rate: 0.9, pitch: 1.0, volume: 0.8 },
      neutral: { rate: 1.0, pitch: 1.0, volume: 0.9 }
    };

    const settings = emotionSettings[emotion as keyof typeof emotionSettings] || emotionSettings.neutral;
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    // Try to select an appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(language) && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith(language)) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Speak the text
    window.speechSynthesis.speak(utterance);

    // Return a promise that resolves when speech ends
    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        reject(error);
      };
    });

  } catch (error) {
    console.error('Error in text-to-speech:', error);
  }
};

// Initialize speech synthesis voices (call this on app startup)
export const initializeSpeechSynthesis = (): void => {
  if ('speechSynthesis' in window) {
    // Load voices
    window.speechSynthesis.getVoices();
    
    // Some browsers require user interaction before speech synthesis works
    window.speechSynthesis.onvoiceschanged = () => {
      console.log('Speech synthesis voices loaded');
    };
  }
};