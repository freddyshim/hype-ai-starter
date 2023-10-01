interface PromptInputProps {
  roomId: string
  placeholder?: string
}

const PromptInput = ({ roomId, placeholder }: PromptInputProps) => {
  return (
    <form
      hx-patch={`/room/${roomId}`}
      hx-target={`#${roomId}`}
      hx-swap="beforeend"
      class="flex gap-4 items-center"
    >
      <input
        name="prompt"
        type="text"
        placeholder={placeholder}
        class="text-black text-2xl px-8 py-4 rounded-md"
      />
      <button type="submit" class="text-2xl px-8 py-4 rounded-md bg-teal-500">
        Start
      </button>
    </form>
  )
}

export default PromptInput
