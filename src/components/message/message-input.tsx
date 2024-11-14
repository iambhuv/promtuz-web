import { Channel } from '@/store/store';
import { Paperclip, SendHorizonal } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import ChatInput, { clearEditor, serializeToString } from '../chat/chat-input';
import { Button } from '../ui/button';
import ErrorBoundary from '../error-boundary';
import useTypingStatus from '@/hooks/useTypingStatus';
import { PasteEvent } from '@/types';
import useAttachments from '@/hooks/attachments/useAttachments';
import { InputReplyBubble } from './message-bubble';
import { useChatStore } from '@/store/chat';
import { AnimatePresence, motion } from 'framer-motion';

export const MessageInput = memo(({
  onSubmit,
  channel
}: {
  onSubmit: (text: string) => Promise<boolean>,
  channel: Channel
}) => {
  const [message, setMessage] = useState('');
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const { handleTypingStatus } = useTypingStatus(channel.id);
  const { handleFilePaste } = useAttachments();

  const inputState = useChatStore().inputs[channel.id];

  const handleChange = (value: string) => {
    setMessage(value);

    if (value != message) handleTypingStatus(value);
  };


  const handleSubmit = async () => {
    const text = serializeToString(editor.children);
    if (text.trim()) {
      onSubmit(text).then((shouldClear) => {
        if (shouldClear) clearEditor(editor);
      })
    }
  };

  const handlePaste = async (pasteEvent: PasteEvent) => {
    handleFilePaste(pasteEvent);
  }

  useEffect(() => {
    const chatInput = document.getElementById('chat-input');

    if (chatInput) {
      chatInput.focus()
    }
  }, [inputState])

  return (
    <div className="px-4">
      <AnimatePresence >
        <motion.div className="w-full h-fit bg-border rounded-xl p-1 flex flex-col sticky bottom-0 message-input-wrapper">
          {
            inputState?.type == 'REPLYING' ?
              <InputReplyBubble channel_id={channel.id} message_id={inputState.refMessage} />
              : null
          }
          {/* <InputReplyBubble /> */}
          <div className="flex items-start justify-between flex-1 relative z-20 bg-border">
            <div className="max-h-96 w-full overflow-y-auto break-words p-2">
              <ErrorBoundary>
                <ChatInput
                  value={message}
                  editor={editor}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onPaste={handlePaste}
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
        </motion.div>
      </AnimatePresence>
    </div >
  )
})