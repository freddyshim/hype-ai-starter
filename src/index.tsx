import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { HTTPException } from 'hono/http-exception'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'
import z from 'zod'
import { zValidator } from '@hono/zod-validator'
import ChatMessage from '@components/ChatMessage'
import ChatRoom from '@components/ChatRoom'
import Home from '@components/Home'
import PromptInput from '@components/PromptInput'
import SseWrapper from '@components/SseWrapper'

// TODO: replace with real database
let prompts: { [key: string]: string } = {}
let completions: { [key: string]: string[] } = {}

const openai = new OpenAI({
  apiKey: Bun.env.OPENAI_API_KEY,
})

const app = new Hono()

app
  .use('/static/*', serveStatic({ root: './src' }))
  .get('/', (c) => c.html(<Home />))
  .get('/chat', (c) => c.html(<ChatRoom messages={[]} />))
  .get('/prompt', (c) =>
    c.html(<PromptInput placeholder="Ask me anything..." />),
  )
  .post(
    '/prompt',
    zValidator('form', z.object({ prompt: z.string() })),
    async (c) => {
      const { prompt } = c.req.valid('form')
      const promptId = nanoid()
      const completionId = nanoid()
      prompts[promptId] = prompt
      completions[completionId] = ['']
      return c.html(
        <>
          <ChatMessage
            id={promptId}
            message={prompt}
            isLeft={false}
            isLast={true}
          />
          <ChatMessage
            id={completionId}
            message={
              <SseWrapper
                url={`/message?promptId=${promptId}&completionId=${completionId}`}
              />
            }
            isLeft={true}
            isLast={true}
          />
        </>,
      )
    },
  )
  .get(
    '/message',
    zValidator(
      'query',
      z.object({ promptId: z.string(), completionId: z.string() }),
    ),
    async (c) => {
      const { promptId, completionId } = c.req.valid('query')
      const prompt = prompts[promptId]
      if (!prompt) {
        throw new HTTPException(404, { message: 'Prompt not found' })
      }

      const chatStream = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
        stream: true,
      })

      const stream = new ReadableStream({
        async pull(controller) {
          let lastValue = ''
          for await (const message of chatStream) {
            const data = message.choices[0]?.delta.content ?? ''
            const currComp = completions[completionId]
            if (data.includes('\n\n')) {
              currComp[currComp.length - 1] += data.replace(/[\r\n]+/g, '')
              currComp.push('')
            } else {
              currComp[currComp.length - 1] += data
            }
            let valueToSend = lastValue
            if (data[0] === ' ') valueToSend += ' '
            lastValue = data
            controller.enqueue(
              `event: message\ndata: ${valueToSend.replace(
                /[\r\n]+/g,
                '<br>',
              )}\n\n`,
            )
            if (message.choices[0]?.finish_reason) {
              controller.enqueue(
                `event: message\ndata: ${(
                  <div
                    hx-post={`/message/complete?completionId=${completionId}`}
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
    zValidator('query', z.object({ completionId: z.string() })),
    (c) => {
      const { completionId } = c.req.valid('query')
      const currComp = completions[completionId]
      return c.html(
        <div id={completionId}>
          {currComp.map((p) => (
            <span class="block whitespace-pre-wrap max-w-[500px]">{p}</span>
          ))}
        </div>,
      )
    },
  )

export default app
