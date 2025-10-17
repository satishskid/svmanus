/**
 * Copilot Screen - Conversational AI Assistant
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { CopilotConversation } from '../types';
import { aiAnalysisService } from '../services/aiAnalysisService';

type CopilotScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Copilot'>;
type CopilotScreenRouteProp = RouteProp<RootStackParamList, 'Copilot'>;

interface Props {
  navigation: CopilotScreenNavigationProp;
  route: CopilotScreenRouteProp;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'copilot';
  timestamp: Date;
  suggestions?: string[];
}

const CopilotScreen: React.FC<Props> = ({ navigation, route }) => {
  const { conversationId } = route.params || {};
  const [conversation, setConversation] = useState<CopilotConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeConversation();
  }, [conversationId]);

  const initializeConversation = async () => {
    try {
      // In a real app, this would load existing conversation or create new one
      const newConversation: CopilotConversation = {
        id: conversationId || `conv_${Date.now()}`,
        user_id: 'user_1',
        user_type: 'parent',
        child_id: 'child_1',
        messages: [],
        context: {
          conversation_history: [],
          current_assessment: 'assessment_1',
          intervention_plan: 'plan_1'
        }
      };

      setConversation(newConversation);

      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "Hello! I'm your AI autism specialist assistant. I can help you understand your child's screening results, explain intervention strategies, answer questions about autism, and provide guidance on next steps. What would you like to know?",
        sender: 'copilot',
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get AI response
      const response = await aiAnalysisService.generateCopilotResponse(
        conversation!,
        userMessage.text,
        conversation!.user_type
      );

      const copilotMessage: Message = {
        id: `msg_${Date.now()}`,
        text: response,
        sender: 'copilot',
        timestamp: new Date(),
        suggestions: generateSuggestions(userMessage.text)
      };

      setMessages(prev => [...prev, copilotMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);

      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        text: "I'm sorry, I'm having trouble responding right now. Please try again or contact a human specialist if this is urgent.",
        sender: 'copilot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (userMessage: string): string[] => {
    const message = userMessage.toLowerCase();

    if (message.includes('result') || message.includes('screening')) {
      return [
        'What do these results mean?',
        'What should I do next?',
        'How accurate is this screening?'
      ];
    }

    if (message.includes('intervention') || message.includes('therapy')) {
      return [
        'How do I implement these strategies?',
        'What materials do I need?',
        'How often should we practice?'
      ];
    }

    if (message.includes('behavior') || message.includes('challenge')) {
      return [
        'How can I manage this behavior?',
        'When should I seek professional help?',
        'What are some immediate strategies?'
      ];
    }

    return [
      'Tell me about autism',
      'What are typical next steps?',
      'How can I support my child?'
    ];
  };

  const useSuggestion = (suggestion: string) => {
    setInputText(suggestion);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender === 'user' ? styles.userMessage : styles.copilotMessage
      ]}
    >
      <Text style={[
        styles.messageText,
        message.sender === 'user' ? styles.userMessageText : styles.copilotMessageText
      ]}>
        {message.text}
      </Text>

      {message.suggestions && message.suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {message.suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => useSuggestion(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about autism, screening results, or intervention strategies..."
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={[
            styles.sendButtonText,
            (!inputText.trim() || isLoading) && styles.sendButtonTextDisabled
          ]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 15,
    padding: 15,
    borderRadius: 18,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
  },
  copilotMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  copilotMessageText: {
    color: '#333',
  },
  suggestionsContainer: {
    marginTop: 10,
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 14,
    color: '#4A90E2',
  },
  loadingContainer: {
    padding: 15,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#999999',
  },
});

export default CopilotScreen;
