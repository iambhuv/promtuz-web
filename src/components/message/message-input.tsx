import { useStore } from '@/store';
import { Channel } from '@/store/store';
import { Paperclip, SendHorizonal } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import ChatInput, { clearEditor, serializeToString } from '../chat/chat-input';
import { Button } from '../ui/button';
import ErrorBoundary from '../error-boundary';

export const MessageInput = ({
  onSubmit,
  channel
}: {
  onSubmit: (text: string) => Promise<boolean>,
  channel: Channel
}) => {
  const [message, setMessage] = useState('');
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const ws_emit = useStore(({ emit }) => emit);
  const typingRef = useRef<any>(null)


  const handleChange = (value: string) => {
    if (value == message) return setMessage(value);

    setMessage(value);

    if (!value.trim()) {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
        typingRef.current = null;
        ws_emit("CHAT_STATUS", { channel_id: channel.id, status: "IDLE" })
      }
      return;
    }

    // Clear any existing timeout before setting a new one
    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    if (typingRef.current == null) {
      ws_emit("CHAT_STATUS", { channel_id: channel.id, status: "TYPING" });
    }

    // Set a new timeout
    typingRef.current = setTimeout(() => {
      ws_emit("CHAT_STATUS", { channel_id: channel.id, status: "IDLE" });
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }, 7000);
  };


  const handleSubmit = async () => {
    const text = serializeToString(editor.children);
    if (text.trim()) {
      onSubmit(text).then((shouldClear) => {
        if (shouldClear) clearEditor(editor);
      })
    }
  };

  return (
    <div className="px-4">
      <div className="w-full h-fit bg-border rounded-xl p-1 flex items-start justify-between sticky bottom-0 message-input-wrapper">
        <div className="max-h-96 w-full overflow-y-auto break-words p-2">
          <ErrorBoundary>
            <ChatInput
              value={message}
              editor={editor}
              onChange={handleChange}
              onSubmit={handleSubmit}
              className="max-h-72 overflow-y-auto sidebar-inset-scrollarea"
              placeholder="Type your message..."
            />
          </ErrorBoundary>
        </div>
        <div className="p-1 flex gap-1.5">
          <Button variant={'ghost'} size={'icon'} className='size-8'>
            <Paperclip />
          </Button>
          <Button variant={'default'} size={'icon'} className='size-8' onClick={handleSubmit}>
            <SendHorizonal />
          </Button>
        </div>
      </div>
    </div>
  )
}