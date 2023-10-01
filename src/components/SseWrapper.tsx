interface SseWrapperProps {
  url: string
  placeholder?: string
}

const SseWrapper = ({ url, placeholder }: SseWrapperProps) => {
  return (
    <div hx-ext="sse" sse-connect={url} sse-swap="message" hx-swap="beforeend">
      {placeholder ?? ''}
    </div>
  )
}

export default SseWrapper
