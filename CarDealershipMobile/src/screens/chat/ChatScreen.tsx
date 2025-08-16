import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../constants';
import { formatDate } from '../../utils';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'location';
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
}

type ChatScreenRouteProp = RouteProp<
  { Chat: { userId: string; userName: string } },
  'Chat'
>;

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const { userId, userName } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const currentUserId = 'current-user-id'; // Get from auth store

  // Mock data - replace with API calls
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'Hi! I\'m interested in the 2020 Toyota Camry you have listed.',
        senderId: currentUserId,
        senderName: 'You',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: true,
        type: 'text',
      },
      {
        id: '2',
        text: 'Hello! Thank you for your interest. The car is in excellent condition and available for viewing.',
        senderId: userId,
        senderName: userName,
        timestamp: '2024-01-15T10:32:00Z',
        isRead: true,
        type: 'text',
      },
      {
        id: '3',
        text: 'Can I schedule a test drive for this weekend?',
        senderId: currentUserId,
        senderName: 'You',
        timestamp: '2024-01-15T10:35:00Z',
        isRead: true,
        type: 'text',
      },
      {
        id: '4',
        text: 'Absolutely! I have availability on Saturday and Sunday. What time works best for you?',
        senderId: userId,
        senderName: userName,
        timestamp: '2024-01-15T10:37:00Z',
        isRead: false,
        type: 'text',
      },
    ];
    
    setMessages(mockMessages);
  }, [userId, currentUserId, userName]);

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: currentUserId,
      senderName: 'You',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCall = () => {
    Alert.alert('Call', `Calling ${userName}...`);
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', `Starting video call with ${userName}...`);
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color={COLORS.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleVideoCall}>
            <Ionicons name="videocam" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUserId;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}
          >
            {item.text}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
              ]}
            >
              {formatDate(item.timestamp, 'HH:mm')}
            </Text>
            
            {isCurrentUser && (
              <Ionicons
                name={item.isRead ? 'checkmark-done' : 'checkmark'}
                size={16}
                color={item.isRead ? COLORS.primary : COLORS.gray}
                style={styles.readStatus}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderInputArea = () => {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.gray}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => Alert.alert('Attach', 'Attachment options...')}
          >
            <Ionicons name="attach" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim().length > 0 && styles.sendButtonActive,
          ]}
          onPress={sendMessage}
          disabled={inputText.trim().length === 0}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim().length > 0 ? COLORS.white : COLORS.gray}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />
      
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{userName} is typing...</Text>
        </View>
      )}
      
      {renderInputArea()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  userStatus: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.success,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageContainer: {
    marginBottom: SPACING.md,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  currentUserBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  otherUserBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  currentUserText: {
    color: COLORS.white,
  },
  otherUserText: {
    color: COLORS.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  messageTime: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.regular,
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTime: {
    color: COLORS.gray,
  },
  readStatus: {
    marginLeft: SPACING.xs,
  },
  typingIndicator: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  typingText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
  },
  textInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  attachButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
});

export default ChatScreen;