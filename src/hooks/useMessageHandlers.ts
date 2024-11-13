import { handleRequest } from "@/lib/api";
import { useStore } from "@/store";
import { Message } from "@/store/store";
import { useState } from "react";

const useMessageHandlers = (channelId: string) => {
  const loadMessages = useStore(store => store.loadMessages);
  
  const [state, setState] = useState({
    loading: false,
    loadingMoreMessages: false,
    sendingMessage: false,
    shouldNotLoadMessages: false,
  });

  const handleInitialMessageLoad = async () => {
    if (state.loading || state.shouldNotLoadMessages) return;

    setState(prev => ({ ...prev, loading: true }));
    const count = await loadMessages(channelId);
    if (count < +process.env.CHAT_MESSAGES_LIMIT) setState(prev => ({ ...prev, shouldNotLoadMessages: true }));
    setState(prev => ({ ...prev, loading: false }));
  };

  const handleLoadMoreMessages = async (messagesEndRef: React.RefObject<HTMLDivElement>, messages: any) => {
    const cursor = Object.keys(messages).at(-1);
    if (!cursor) return setState(prev => ({ ...prev, shouldNotLoadMessages: true }));

    setState(prev => ({ ...prev, loadingMoreMessages: true }));

    let oldHeight: number;

    const count = await loadMessages(channelId, cursor, void 0, () => {
      oldHeight = messagesEndRef.current!.scrollHeight - messagesEndRef.current!.scrollTop
    });

    if (count < +process.env.CHAT_MESSAGES_LIMIT) setState(prev => ({ ...prev, shouldNotLoadMessages: true }));

    messagesEndRef.current!.scrollTop = messagesEndRef.current!.scrollHeight - oldHeight!

    setState(prev => ({ ...prev, loadingMoreMessages: false }));
  };

  const handleSubmitMessage = async (text: string) => {
    if (state.sendingMessage) return false;
    setState(prev => ({ ...prev, sendingMessage: true }));

    const response = await handleRequest<Message>('POST', `/chats/${channelId}/messages`, { content: text });
    setState(prev => ({ ...prev, sendingMessage: false }));

    return !response.err;
  };

  return { state, setState, handleInitialMessageLoad, handleLoadMoreMessages, handleSubmitMessage };
}


export default useMessageHandlers