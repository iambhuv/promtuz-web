'use client';

import useMessageHandlers from '@/hooks/useMessageHandlers';
import { useStore } from '@/store';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from "react-intersection-observer";

import { ChatHeader } from '@/components/chat/chat-header';
import { ChatPanel } from '@/components/chat/chat-panel';
import { MessageInput } from '@/components/message/message-input';
import { MessageList } from '@/components/message/message-list';
import { motion } from 'framer-motion';

const ChatPage = ({ params }: { params: Promise<{ channel_id: string }>, searchParams: Promise<any> }) => {
  const { channel_id } = React.use(params);

  const channel = useStore(store => store.channels.get(channel_id));

  if (!channel) return null;

  const [unscrolled, setUnscrolled] = useState(false);
  const [hoveringFile, setHoveringFile] = useState(false);

  const messages = useStore(store => store.messages[channel.id]);
  const messageList = useMemo(() => Object.values(messages || {}).reverse(), [messages]);
  const setActiveChannel = useStore(store => store.setActiveChannel);


  // FIXME: imple for gc support
  // const chatStatus = useStore(store => store.chatStatus?.[channel.id]?.[user.id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0, initialInView: false });

  const { state, handleInitialMessageLoad, handleLoadMoreMessages, handleSubmitMessage } =
    useMessageHandlers(channel.id);

  useEffect(() => {
    if (!messageList.length)
      handleInitialMessageLoad();

    setActiveChannel(channel_id);

    return () => {
      setActiveChannel("");
    }
  }, []);

  const handleScroll = (ev: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollTop, scrollHeight, clientHeight } = ev.currentTarget;

    const scrollDiff = Math.round(Math.abs(scrollHeight - scrollTop - clientHeight));

    setUnscrolled(scrollDiff >= 200)
  }

  useEffect(() => {
    if (messagesEndRef.current && !state.loadingMoreMessages && !unscrolled) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, /*chatStatus*/]);

  useEffect(() => {
    if (inView && !state.shouldNotLoadMessages && messageList.length && !state.loadingMoreMessages) {
      handleLoadMoreMessages(messagesEndRef, messages);
    }
  }, [inView]);

  return (
    <>
      <ChatHeader channel={channel} />
      <motion.div

        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setHoveringFile(true);
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          setHoveringFile(false)
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setHoveringFile(false);
          console.log(e.dataTransfer.files);
        }}
      >
        {/* <AttachmentUI hovering={hoveringFile} /> */}

        <ChatPanel
        >
          <div id="messages" className='flex  flex-col flex-1 overflow-auto sidebar-inset-scrollarea pr-4 pl-7 relative' ref={messagesEndRef} onScroll={handleScroll}>
            <div className="flex flex-1 w-full"></div>
            <div className="flex gap-[.185rem] flex-col pt-4 pb-4">
              <div className="w-full max-w-[800px] mx-auto mt-auto relative">
                {state.loadingMoreMessages && <h1 className='text-center mb-5 italic'>Loading Messages...</h1>}

                <MessageList messageList={messageList} channel_id={channel_id} ref={loadMoreRef} />

                {/* <MessageStatus status={chatStatus} /> */}

                <div ref={messagesEndRef}></div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[900px] mx-auto">
            <MessageInput onSubmit={handleSubmitMessage} channel={channel} />
          </div>
        </ChatPanel>
      </motion.div>
    </>
  )
};

export default ChatPage