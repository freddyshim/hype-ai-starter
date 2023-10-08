import ChatMessage from '@components/ChatMessage'
import PromptInput from '@components/PromptInput'
import { OpenAI } from 'openai'

interface ChatRoomProps {
  roomId: string
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
}

const ChatRoom = ({ roomId, messages }: ChatRoomProps) => (
  <div
    id="chatroom"
    class="w-full h-full text-xl flex flex-col justify-between items-center"
  >
    <div
      id={roomId}
      class="w-full flex-1 overflow-y-auto px-12 flex flex-col justify-center items-center gap-4"
    >
      {messages.map(({ role, content }) => (
        <ChatMessage message={content ?? ''} isLeft={role === 'assistant'} />
      ))}
    </div>
    <PromptInput roomId={roomId} />
  </div>
)

export default ChatRoom
