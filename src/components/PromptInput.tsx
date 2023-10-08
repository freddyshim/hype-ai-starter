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
      hx-on="htmx:afterRequest: const input = document.querySelector('#promptInput'); input.value = ''; input.style.height='44px'"
      class="w-full h-auto flex items-end gap-4 px-4"
    >
      <textarea
        id="promptInput"
        x-on:input="$el.style.height=0; $el.style.height=($el.scrollHeight > 44 ? $el.scrollHeight : 44)+'px'"
        x-on:keydown="if (event.keyCode == 13) { event.preventDefault(); document.querySelector('#promptSubmit').click(); }"
        name="prompt"
        type="text"
        placeholder={placeholder}
        class="w-full h-[44px] text-black text-xl px-4 py-2 rounded-md resize-none outline-none border-none focus:ring-[3px] ring-inset ring-blue-600"
        autofocus
      />
      <button
        id="promptSubmit"
        type="submit"
        class="text-xl h-[44px] px-4 py-2 rounded-md bg-teal-500"
      >
        Send
      </button>
    </form>
  )
}

export default PromptInput
