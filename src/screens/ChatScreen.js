import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

const WELCOME_MESSAGE = {
  id: '0',
  text: 'Hej! Jeg er CareMate, din digitale assistent. Hvordan kan jeg hjælpe dig i dag?',
  sender: 'ai',
  timestamp: new Date(),
};

// Simpel lokal AI-simulering – kan udskiftes med en rigtig API
function getAIResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('hej') || lower.includes('godmorgen') || lower.includes('god dag')) {
    return 'Hej! Det er dejligt at høre fra dig. Hvad kan jeg hjælpe med?';
  }
  if (lower.includes('vejr')) {
    return 'Jeg kan desværre ikke tjekke vejret lige nu, men du kan kigge ud af vinduet eller spørge en pårørende.';
  }
  if (lower.includes('medicin')) {
    return 'Du kan se dine medicinpåmindelser under fanen "Medicin". Vil du have hjælp til noget andet?';
  }
  if (lower.includes('hjælp') || lower.includes('hvad kan du')) {
    return 'Jeg kan hjælpe dig med at besvare spørgsmål, minde dig om medicin og meget mere. Spørg bare løs!';
  }
  if (lower.includes('tak')) {
    return 'Det var så lidt! Jeg er her, hvis du har brug for mere hjælp.';
  }
  return 'Tak for din besked. Jeg gør mit bedste for at hjælpe dig. Kan du fortælle mere om, hvad du har brug for?';
}

export default function ChatScreen() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simuler AI-svar med kort forsinkelse
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(text),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 800);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
        accessibilityLabel={`${isUser ? 'Du' : 'CareMate'}: ${item.text}`}
      >
        {!isUser && (
          <View style={styles.aiLabel}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={styles.aiLabelText}>CareMate</Text>
          </View>
        )}
        <Text
          style={[
            typography.body,
            { color: isUser ? colors.white : colors.text },
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Ionicons name="chatbubble-ellipses" size={32} color={colors.primary} />
        <Text style={[typography.h2, styles.headerTitle]}>AI-assistent</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Skriv en besked..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            accessibilityLabel="Besked-felt"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            accessibilityLabel="Send besked"
            accessibilityRole="button"
          >
            <Ionicons
              name="send"
              size={26}
              color={inputText.trim() ? colors.white : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    marginLeft: spacing.sm,
  },
  messageList: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.chatBubbleUser,
    alignSelf: 'flex-end',
    borderBottomRightRadius: borderRadius.sm,
  },
  aiBubble: {
    backgroundColor: colors.chatBubbleAI,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: borderRadius.sm,
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  aiLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 22,
    maxHeight: 140,
    color: colors.text,
  },
  sendButton: {
    width: 58,
    height: 58,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
