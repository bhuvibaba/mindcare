import { EmotionAnalysis } from '../types';

// OpenRouter API configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Send chat message to AI
export const sendChatMessage = async (
  message: string, 
  language: string = 'en', 
  emotion: string = 'neutral'
): Promise<string> => {
  try {
    // Create system prompt based on language and detected emotion
    const systemPrompt = getSystemPrompt(language, emotion);
    
    // Make actual API call to OpenRouter
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindCare AI Assistant'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from API');
    }

  } catch (error) {
    console.error('Error sending chat message:', error);
    
    // Fallback responses if API fails
    const fallbackResponses = {
      en: [
        "I'm here to listen and support you. Could you tell me more about how you're feeling?",
        "I understand you're reaching out for support. While I'm having some technical difficulties, I want you to know that your feelings are valid.",
        "Thank you for sharing with me. Even though I'm experiencing some connection issues, I'm here to help you through this."
      ],
      hi: [
        "मैं आपकी बात सुनने और आपका साथ देने के लिए यहां हूं। क्या आप मुझे बता सकते हैं कि आप कैसा महसूस कर रहे हैं?",
        "मैं समझ सकता हूं कि आप सहारे की तलाश में हैं। आपकी भावनाएं वैध हैं।"
      ]
    };
    
    const responses = fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses.en;
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

// Generate system prompt based on language and emotion
const getSystemPrompt = (language: string, emotion: string): string => {
  const basePrompt = {
    en: `You are a compassionate AI mental health assistant for MindCare. You provide empathetic, supportive responses to users seeking mental wellness guidance. 

Key guidelines:
- Be warm, understanding, and non-judgmental
- Provide practical coping strategies and emotional support
- Encourage professional help when appropriate
- Keep responses concise but meaningful (2-4 sentences)
- Never provide medical diagnoses or replace professional therapy
- Focus on emotional validation and practical wellness tips

The user's current emotional state appears to be: ${emotion}

Respond with empathy and provide appropriate support for their emotional state.`,

    hi: `आप MindCare के लिए एक दयालु AI मानसिक स्वास्थ्य सहायक हैं। आप मानसिक कल्याण मार्गदर्शन चाहने वाले उपयोगकर्ताओं को सहानुभूतिपूर्ण, सहायक प्रतिक्रियाएं प्रदान करते हैं।

मुख्य दिशानिर्देश:
- गर्मजोशी, समझदारी और बिना जजमेंट के जवाब दें
- व्यावहारिक मुकाबला रणनीतियां और भावनात्मक समर्थन प्रदान करें
- जब उचित हो तो पेशेवर मदद को प्रोत्साहित करें
- जवाब संक्षिप्त लेकिन अर्थपूर्ण रखें (2-4 वाक्य)
- कभी भी चिकित्सा निदान न दें या पेशेवर थेरेपी की जगह न लें

उपयोगकर्ता की वर्तमान भावनात्मक स्थिति: ${emotion}

सहानुभूति के साथ जवाब दें और उनकी भावनात्मक स्थिति के लिए उचित समर्थन प्रदान करें।`
  };

  return basePrompt[language as keyof typeof basePrompt] || basePrompt.en;
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