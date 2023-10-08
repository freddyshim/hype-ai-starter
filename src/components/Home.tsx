import PromptInput from './PromptInput'

const Home = () => (
  <html>
    <head>
      <title>Hype AI Starter</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script src="https://unpkg.com/htmx.org@1.9.5"></script>
      <script src="https://unpkg.com/htmx.org/dist/ext/sse.js"></script>
      <script
        defer
        src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
      ></script>
      <link rel="stylesheet" href="/static/styles.css" />
    </head>
    <body class="w-full h-screen bg-black text-white flex flex-col justify-start items-center gap-4">
      <header class="h-[60px]">
        <h1 class="text-6xl font-bold">HTMX + Hono + ChatGPT</h1>
      </header>
      <main class="w-full max-w-5xl h-[calc(100%-60px)]">
        <div hx-post="/room" hx-trigger="load" hx-swap="outerHTML" />
      </main>
    </body>
  </html>
)

export default Home
