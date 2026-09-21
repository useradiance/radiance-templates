import { ChatInbox } from '@/components/ChatInbox';

/** Home tab is the inbox — avoid pushing `/chat` onto the stack (dead back button). */
export default function MessagingHome() {
  return <ChatInbox />;
}
