import ChatMessage from '@components/ChatMessage'
import PromptInput from '@components/PromptInput'
import { OpenAI } from 'openai'

interface ChatRoomProps {
  roomId: string
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
}

const ChatRoom = ({ roomId, messages }: ChatRoomProps) => (
  <div id="chatroom" class="w-full text-xl flex flex-col items-center">
    <PromptInput roomId={roomId} />
    <div
      id={roomId}
      class="w-full max-w-5xl px-12 flex flex-col justify-center items-center gap-4"
    >
      {messages.map(({ role, content }) => (
        <ChatMessage message={content ?? ''} isLeft={role === 'assistant'} />
      ))}
    </div>
  </div>
)

export default ChatRoom
