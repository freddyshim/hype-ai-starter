interface PromptInputProps {
  placeholder?: string
}

const PromptInput = ({ placeholder }: PromptInputProps) => {
  return (
    <form
      hx-post="/prompt"
      hx-target="#chatroom"
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
