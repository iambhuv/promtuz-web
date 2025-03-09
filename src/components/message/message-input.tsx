import useAttachments from '@/hooks/attachments/useAttachments';
import useTypingStatus from '@/hooks/useTypingStatus';
import { useChatStore } from '@/store/chat';
import { Channel } from '@/store/store';
import { PasteEvent } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { File, FileAudio, FileImage, FileVideo2, Paperclip, SendHorizonal } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import ChatInput, { clearEditor, serializeToString } from '../chat/chat-input';
import ErrorBoundary from '../error-boundary';
import { Button } from '../ui/button';
import { ContextMenuShortcut } from '../ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { InputReplyBubble } from './message-bubble';

export const MessageInput = memo(({
  onSubmit,
  channel
}: {
  onSubmit: (text: string) => Promise<boolean>,
  channel: Channel
}) => {
  const chatStore = useChatStore(store => store);

  // Tryna get the "draft" message
  const message = chatStore.getInputContent(channel.id);
  const attachments = chatStore.getInputAttachments(channel.id);
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const { handleTypingStatus } = useTypingStatus(channel.id);
  const { handleFilePaste } = useAttachments();

  const inputState = useChatStore().inputs[channel.id];

  const handleChange = (value: Descendant[]) => {
    chatStore.setInputContent(channel.id, value)

    if (serializeToString(value) != serializeToString(message)) handleTypingStatus(serializeToString(value));
  };


  const handleSubmit = async () => {
    const inputContentState = chatStore.getInputContent(channel.id);

    const text = serializeToString(inputContentState);
    if (text.trim()) {
      onSubmit(text).then((shouldClear) => {
        if (shouldClear) {

          clearEditor(editor);
          chatStore.clearAttachments(channel.id);
          chatStore.clearContent(channel.id);
        }
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
              <InputReplyBubble channel_id={channel.id} message_id={inputState.refMessageID} /> :
              inputState?.type == 'EDITING' ?
                <InputReplyBubble channel_id={channel.id} message_id={inputState.refMessageID} /> : null
          }

          {/* {Object.values(attachments).map(a => a.mime_type)} */}
          <div className="flex">
            {Object.values(attachments).map(attachment => {
              const blob = URL.createObjectURL(attachment.file);
              return <div className="flex" key={attachment.hash}>
                <img src={blob} alt="" className='max-w-32 object-contain w-full' />
              </div>
            })}
          </div>

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
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant={'ghost'} size={'icon'} className='size-8'>
                    <Paperclip />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='top' align='end' sideOffset={12}>
                  <DropdownMenuItem onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = 'image/png, image/jpeg'
                    input.multiple = true

                    input.click()
                    input.addEventListener("change", async () => {
                      if (input.files) {
                        for (const file of input.files) {
                          await chatStore.attach(channel.id, file, "IMAGE")
                        }
                      }

                      input.remove()
                    })
                  }}>
                    <span>Image</span>
                    <ContextMenuShortcut>
                      <FileImage size={16} />
                    </ContextMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Video</span>
                    <ContextMenuShortcut>
                      <FileVideo2 size={16} />
                    </ContextMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem >
                    <span>Audio</span>
                    <ContextMenuShortcut>
                      <FileAudio size={16} />
                    </ContextMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Document</span>
                    <ContextMenuShortcut>
                      <File size={16} />
                    </ContextMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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