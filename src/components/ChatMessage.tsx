import { classes } from '@utils/helpers'

interface ChatMessageProps {
  id: string
  message: string
  isLeft: boolean
  isLast: boolean
}

const ChatMessage = ({
  id,
  message,
  isLeft = false,
  isLast = false,
}: ChatMessageProps) => {
  return (
    <div
      class={classes(
        'chat-message',
        // TODO: fix chat arrow
        //isLast && 'chat-message--last',
        isLeft
          ? 'chat-message--left bg-rose-500'
          : 'chat-message--right bg-teal-500',
      )}
    >
      <div id={id}>{message}</div>
    </div>
  )
}

export default ChatMessage
