import ChatMessage from '@components/ChatMessage'
import { ChatMessageConfig } from '@utils/types'

interface ChatRoomProps {
  messages: ChatMessageConfig[]
}

const ChatRoom = ({ messages }: ChatRoomProps) => (
  <div
    id="chatroom"
    class="w-full max-w-5xl px-12 flex flex-col justify-center items-center gap-4 text-xl"
  >
    {messages.map(({ id, message, user, isChatGpt }, idx, arr) => (
      <ChatMessage
        id={id}
        message={message}
        isLeft={isChatGpt}
        isLast={!arr[idx + 1] || arr[idx + 1].user !== user}
      />
    ))}
  </div>
)

export default ChatRoom
