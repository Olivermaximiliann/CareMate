import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SuggestionChips } from '../components';
import { colors, typography, spacing, borderRadius } from '../theme';
import {
  SUGGESTIONS,
  WELCOME_MESSAGE,
  sendMessage,
  createMessage,
} from '../utils/chatService';

// ---------------------------------------------------------------------------
// Typing-indikator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
      <View style={styles.aiLabel}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text style={styles.aiLabelText}>CareMate</Text>
      </View>
      <Text style={[typography.body, styles.typingDots]}>Skriver ...</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Hovedskærm
// ---------------------------------------------------------------------------

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { ...WELCOME_MESSAGE, timestamp: new Date().toISOString() },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = useCallback(
    async (text) => {
      const trimmed = (text || inputText).trim();
      if (!trimmed || isTyping) return;

      // Tilføj brugerbesked
      const userMsg = createMessage(trimmed, 'user');
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setShowSuggestions(false);
      setIsTyping(true);
      scrollToEnd();

      try {
        // Hent AI-svar (mock eller fremtidig API)
        const replyText = await sendMessage(trimmed, messages);
        const aiMsg = createMessage(replyText, 'ai');
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        const errorMsg = createMessage(
          'Beklager, der opstod en fejl. Prøv venligst igen.',
          'ai'
        );
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
        scrollToEnd();
      }
    },
    [inputText, isTyping, messages, scrollToEnd]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion) => {
      handleSend(suggestion.text);
    },
    [handleSend]
  );

  const handleMicPress = useCallback(() => {
    Alert.alert(
      'Stemmestyring',
      'Stemmestyring er ikke tilgængelig endnu, men kommer snart.\n\nIndtil da kan du skrive din besked eller vælge et forslag.',
      [{ text: 'Forstået' }]
    );
  }, []);

  // -------------------------------------------------------------------------
  // Render-funktioner
  // -------------------------------------------------------------------------

  const renderMessage = useCallback(({ item }) => {
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
  }, []);

  const renderFooter = useCallback(() => {
    if (!isTyping) return null;
    return <TypingIndicator />;
  }, [isTyping]);

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------

  const hasUserMessages = messages.length > 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubble-ellipses" size={28} color={colors.white} />
        </View>
        <View>
          <Text style={[typography.h3, styles.headerTitle]}>AI-assistent</Text>
          <Text style={styles.headerSubtitle}>Din digitale hjælper</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Beskedliste */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToEnd}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
        />

        {/* Forslag */}
        <SuggestionChips
          suggestions={SUGGESTIONS}
          onSelect={handleSuggestionSelect}
          visible={showSuggestions && !hasUserMessages}
        />

        {/* Inputlinje */}
        <View style={styles.inputContainer}>
          {/* Mikrofonknap */}
          <TouchableOpacity
            style={styles.micButton}
            onPress={handleMicPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Tal i stedet for at skrive"
            accessibilityHint="Stemmestyring er endnu ikke tilgængelig"
          >
            <Ionicons name="mic-outline" size={28} color={colors.primary} />
          </TouchableOpacity>

          {/* Tekstfelt */}
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Skriv en besked..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            editable={!isTyping}
            accessibilityLabel="Skriv din besked her"
          />

          {/* Send-knap */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            accessibilityLabel="Send besked"
            accessibilityRole="button"
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() && !isTyping ? colors.white : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerTitle: {
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Beskedliste
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

  // Typing
  typingBubble: {
    opacity: 0.8,
  },
  typingDots: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Inputlinje
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  micButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
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
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
