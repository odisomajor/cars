import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../constants';
import { SearchBar, EmptyState } from '../../components';
import { formatDate } from '../../utils';

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  carTitle?: string;
  carImage?: string;
}

const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      userId: 'dealer-1',
      userName: 'Premium Motors',
      lastMessage: 'Absolutely! I have availability on Saturday and Sunday. What time works best for you?',
      lastMessageTime: '2024-01-15T10:37:00Z',
      unreadCount: 2,
      isOnline: true,
      carTitle: '2020 Toyota Camry Hybrid LE',
      carImage: 'https://via.placeholder.com/60x60/F2F2F7/8E8E93?text=Car',
    },
    {
      id: '2',
      userId: 'dealer-2',
      userName: 'Elite Auto Sales',
      lastMessage: 'The car is still available. Would you like to schedule a viewing?',
      lastMessageTime: '2024-01-15T09:15:00Z',
      unreadCount: 0,
      isOnline: false,
      carTitle: '2019 BMW X5 xDrive40i',
      carImage: 'https://via.placeholder.com/60x60/F2F2F7/8E8E93?text=BMW',
    },
    {
      id: '3',
      userId: 'seller-1',
      userName: 'John Doe',
      lastMessage: 'Thank you for your interest! The price is negotiable.',
      lastMessageTime: '2024-01-14T16:22:00Z',
      unreadCount: 1,
      isOnline: true,
      carTitle: '2018 Honda Civic Type R',
      carImage: 'https://via.placeholder.com/60x60/F2F2F7/8E8E93?text=Honda',
    },
    {
      id: '4',
      userId: 'dealer-3',
      userName: 'City Motors',
      lastMessage: 'We have financing options available if you\'re interested.',
      lastMessageTime: '2024-01-14T14:45:00Z',
      unreadCount: 0,
      isOnline: false,
      carTitle: '2021 Mercedes-Benz C-Class',
      carImage: 'https://via.placeholder.com/60x60/F2F2F7/8E8E93?text=Merc',
    },
  ]);

  const filteredConversations = conversations.filter(conversation =>
    conversation.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.carTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationPress = (conversation: Conversation) => {
    // Mark as read
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversation.id
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );

    // Navigate to chat screen
    navigation.navigate('Chat' as never, {
      userId: conversation.userId,
      userName: conversation.userName,
    } as never);
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.filter(conv => conv.id !== conversationId)
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.conversationContent}>
          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userName.charAt(0)}
              </Text>
            </View>
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>

          {/* Conversation Details */}
          <View style={styles.conversationDetails}>
            <View style={styles.conversationHeader}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.userName}
              </Text>
              <Text style={styles.messageTime}>
                {formatDate(item.lastMessageTime, 'HH:mm')}
              </Text>
            </View>

            {item.carTitle && (
              <Text style={styles.carTitle} numberOfLines={1}>
                {item.carTitle}
              </Text>
            )}

            <View style={styles.messageContainer}>
              <Text
                style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Car Image */}
          {item.carImage && (
            <Image source={{ uri: item.carImage }} style={styles.carImage} />
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConversation(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <EmptyState
        icon="chatbubbles-outline"
        title="No Conversations"
        description="Start a conversation by messaging a dealer or seller about their car listings."
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        contentContainerStyle={[
          styles.conversationsContent,
          filteredConversations.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingBottom: SPACING.xl,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationItem: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  conversationDetails: {
    flex: 1,
    marginRight: SPACING.md,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  messageTime: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  carTitle: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    flex: 1,
    marginRight: SPACING.sm,
  },
  unreadMessage: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  unreadCount: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  carImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
  },
});

export default ConversationsScreen;