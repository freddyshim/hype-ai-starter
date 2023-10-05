import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { HTTPException } from 'hono/http-exception'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'
import z from 'zod'
import { zValidator } from '@hono/zod-validator'
import ChatMessage from '@components/ChatMessage'
import Home from '@components/Home'
import SseWrapper from '@components/SseWrapper'
import ChatRoom from '@components/ChatRoom'

// TODO: replace with real database
let rooms: {
  [key: string]: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
} = {}
let completions: { [key: string]: string } = {}

const openai = new OpenAI({
  apiKey: Bun.env.OPENAI_API_KEY,
})

const app = new Hono()

app
  .use('/static/*', serveStatic({ root: './src' }))
  .get('/', (c) => c.html(<Home />))
  .post('/room', async (c) => {
    const roomId = nanoid()
    rooms[roomId] = []
    return c.html(<ChatRoom roomId={roomId} messages={rooms[roomId]} />)
  })
  .patch(
    '/room/:roomId',
    zValidator('form', z.object({ prompt: z.string() })),
    async (c) => {
      const { roomId } = c.req.param()
      const { prompt } = c.req.valid('form')

      const room = rooms[roomId]
      if (!room) {
        throw new HTTPException(404, { message: 'Room not found' })
      }

      rooms[roomId].push({ role: 'user', content: prompt })

      const completionId = nanoid()
      completions[completionId] = ''

      return c.html(
        <>
          <ChatMessage message={prompt} isLeft={false} />
          <ChatMessage
            id={completionId}
            message={
              <SseWrapper
                url={`/message?roomId=${roomId}&completionId=${completionId}`}
              />
            }
            isLeft={true}
          />
        </>,
      )
    },
  )
  .get(
    '/message',
    zValidator(
      'query',
      z.object({ roomId: z.string(), completionId: z.string() }),
    ),
    async (c) => {
      const { roomId, completionId } = c.req.valid('query')

      const room = rooms[roomId]
      if (!room || !room.length) {
        throw new HTTPException(404, { message: 'Room not found' })
      }

      const chatStream = await openai.chat.completions.create({
        messages: room,
        model: 'gpt-3.5-turbo',
        stream: true,
      })

      const stream = new ReadableStream({
        async pull(controller) {
          let lastValue = ''
          for await (const message of chatStream) {
            const data = message.choices[0]?.delta.content ?? ''
            const parsedMsg = data.replace(/[\r\n]/g, '<br>')

            let valueToSend = lastValue
            if (data[0] === ' ') valueToSend += ' '
            lastValue = parsedMsg

            completions[completionId] += data

            controller.enqueue(`event: message\ndata: ${valueToSend}\n\n`)

            if (message.choices[0]?.finish_reason) {
              controller.enqueue(
                `event: message\ndata: ${(
                  <div
                    hx-post={`/message/complete?roomId=${roomId}&completionId=${completionId}`}
                    hx-trigger="load"
                    hx-target={`#${completionId}`}
                    hx-swap="outerHTML"
                  />
                )}\n\n`,
              )
            }
          }
        },
      })

      return c.body(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    },
  )
  .post(
    '/message/complete',
    zValidator(
      'query',
      z.object({ roomId: z.string(), completionId: z.string() }),
    ),
    (c) => {
      const { roomId, completionId } = c.req.valid('query')

      const room = rooms[roomId]
      if (!room || !room.length) {
        throw new HTTPException(404, { message: 'Room not found' })
      }

      const content = completions[completionId]
      if (!content) {
        throw new HTTPException(404, { message: 'Completion not found' })
      }

      room.push({ role: 'assistant', content })

      return c.html(
        <div id={completionId}>
          <span class="block whitespace-pre-wrap max-w-[500px]">{content}</span>
        </div>,
      )
    },
  )

export default app
