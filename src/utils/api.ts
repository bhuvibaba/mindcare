// API utilities for MindCare application
import { EmotionAnalysis } from '../types';

// OpenRouter API configuration
const OPENROUTER_API_KEY = 'sk-or-v1-b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8'; // Replace with your actual API key
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Chat API function
export const sendChatMessage = async (
  message: string, 
  language: string = 'en',
  personality: 'supportive' | 'professional' | 'friendly' = 'supportive'
): Promise<string> => {
  try {
    console.log('Sending chat message:', { message, language, personality });

    const personalityPrompts = {
      supportive: "You are a warm, empathetic AI mental health companion. Respond with compassion, understanding, and gentle encouragement. Focus on emotional support and validation.",
      professional: "You are a professional AI mental health assistant. Provide structured, evidence-based responses with clinical insights while maintaining warmth and empathy.",
      friendly: "You are a friendly, upbeat AI companion focused on mental wellness. Use a conversational, encouraging tone while providing helpful mental health support."
    };

    const systemPrompt = `${personalityPrompts[personality]} 

Key guidelines:
- Always prioritize user safety and well-being
- Provide supportive, non-judgmental responses
- Suggest healthy coping strategies when appropriate
- Encourage professional help for serious concerns
- Keep responses concise but meaningful (2-3 sentences)
- Respond in ${language === 'en' ? 'English' : language}
- Focus on mental wellness, emotional support, and positive coping strategies`;

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
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response:', data);

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('Invalid response format from API');
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide contextual fallback responses based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
      return "I understand you're feeling anxious. Try taking slow, deep breaths - in for 4 counts, hold for 4, out for 4. Remember, this feeling will pass, and you're stronger than you know.";
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
      return "I hear that you're going through a difficult time. Your feelings are valid, and it's okay to not be okay sometimes. Consider reaching out to someone you trust or a mental health professional.";
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
      return "Feeling overwhelmed is tough. Try breaking things down into smaller, manageable steps. Take a moment to breathe and remember - you don't have to handle everything at once.";
    } else if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return "I'm so glad to hear you're feeling positive! It's wonderful when we can appreciate these good moments. What's contributing to your happiness today?";
    } else {
      return "I'm here to listen and support you. While I'm having some technical difficulties right now, please know that your feelings matter and there are people who care about your wellbeing.";
    }
  }
};

// Emotion analysis function
export const analyzeEmotion = async (text: string): Promise<EmotionAnalysis> => {
  try {
    console.log('Analyzing emotion for text:', text);

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindCare Emotion Analysis'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: `You are an emotion analysis AI. Analyze the emotional content of the user's message and respond with ONLY a JSON object in this exact format:
{
  "emotion": "primary_emotion",
  "confidence": 0.85,
  "intensity": "medium",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Emotions should be one of: happy, sad, anxious, angry, excited, calm, frustrated, hopeful, lonely, grateful, stressed, content, worried, joyful, overwhelmed, peaceful, confused, motivated, tired, optimistic.

Intensity should be: low, medium, or high.
Confidence should be between 0.0 and 1.0.
Provide 2-3 helpful suggestions based on the detected emotion.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Emotion analysis failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Emotion analysis response:', data);

    if (data.choices && data.choices[0] && data.choices[0].message) {
      try {
        const emotionData = JSON.parse(data.choices[0].message.content.trim());
        return {
          emotion: emotionData.emotion || 'neutral',
          confidence: emotionData.confidence || 0.7,
          intensity: emotionData.intensity || 'medium',
          suggestions: emotionData.suggestions || ['Take a deep breath', 'Practice mindfulness', 'Consider talking to someone']
        };
      } catch (parseError) {
        console.error('Failed to parse emotion analysis JSON:', parseError);
        throw parseError;
      }
    } else {
      throw new Error('Invalid emotion analysis response');
    }

  } catch (error) {
    console.error('Emotion analysis error:', error);
    
    // Fallback emotion analysis based on keywords
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || lowerText.includes('great')) {
      return {
        emotion: 'happy',
        confidence: 0.8,
        intensity: 'high',
        suggestions: ['Share your joy with others', 'Practice gratitude', 'Savor this positive moment']
      };
    } else if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down')) {
      return {
        emotion: 'sad',
        confidence: 0.8,
        intensity: 'medium',
        suggestions: ['Reach out to a friend', 'Practice self-compassion', 'Consider professional support']
      };
    } else if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous')) {
      return {
        emotion: 'anxious',
        confidence: 0.8,
        intensity: 'medium',
        suggestions: ['Try deep breathing exercises', 'Practice grounding techniques', 'Focus on what you can control']
      };
    } else if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad')) {
      return {
        emotion: 'angry',
        confidence: 0.7,
        intensity: 'medium',
        suggestions: ['Take a break to cool down', 'Try physical exercise', 'Practice expressing feelings calmly']
      };
    } else if (lowerText.includes('stress') || lowerText.includes('overwhelmed') || lowerText.includes('pressure')) {
      return {
        emotion: 'stressed',
        confidence: 0.8,
        intensity: 'high',
        suggestions: ['Break tasks into smaller steps', 'Practice relaxation techniques', 'Prioritize self-care']
      };
    } else {
      return {
        emotion: 'neutral',
        confidence: 0.6,
        intensity: 'medium',
        suggestions: ['Practice mindfulness', 'Stay present', 'Take care of yourself']
      };
    }
  }
};

// Text-to-speech function with emotion
export const speakTextWithEmotion = async (text: string, emotion: string = 'neutral'): Promise<void> => {
  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Adjust voice parameters based on emotion
    switch (emotion.toLowerCase()) {
      case 'happy':
      case 'excited':
      case 'joyful':
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        utterance.volume = 0.9;
        break;
      case 'sad':
      case 'depressed':
        utterance.rate = 0.8;
        utterance.pitch = 0.8;
        utterance.volume = 0.7;
        break;
      case 'anxious':
      case 'worried':
      case 'stressed':
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        break;
      case 'calm':
      case 'peaceful':
        utterance.rate = 0.9;
        utterance.pitch = 0.9;
        utterance.volume = 0.8;
        break;
      case 'angry':
      case 'frustrated':
        utterance.rate = 1.0;
        utterance.pitch = 0.9;
        utterance.volume = 0.9;
        break;
      default:
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
    }

    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') || 
      voice.name.includes('Alex') ||
      voice.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Speak the text
    window.speechSynthesis.speak(utterance);
    
    console.log(`Speaking with emotion ${emotion}:`, text);

  } catch (error) {
    console.error('Text-to-speech error:', error);
  }
};