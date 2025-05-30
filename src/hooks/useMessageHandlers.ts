import { handleRequest } from "@/lib/api";
import { useStore } from "@/store";
import { useChatStore } from "@/store/chat";
import { MessagePayload } from "@/types/payloads";
import Pako from "pako";
import { useMemo, useState } from "react";

const useMessageHandlers = (channelId: string) => {
  const loadMessages = useStore(store => store.loadMessages);

  const getInputAttachments = useChatStore(state => state.getInputAttachments);
  const removeInputState = useChatStore(state => state.removeInputState);
  const inputStates = useChatStore(state => state.inputs);
  
  const inputState = useMemo(() => inputStates[channelId], [inputStates])


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
    if (count < +process.env.NEXT_PUBLIC_CHAT_MESSAGES_LIMIT) setState(prev => ({ ...prev, shouldNotLoadMessages: true }));
    setState(prev => ({ ...prev, loading: false }));
  };

  const handleLoadMoreMessages = async (messagesEndRef: React.RefObject<HTMLDivElement | null>, messages: any) => {
    const cursor = Object.keys(messages).at(-1);
    if (!cursor) return setState(prev => ({ ...prev, shouldNotLoadMessages: true }));

    setState(prev => ({ ...prev, loadingMoreMessages: true }));

    let oldHeight: number;

    const count = await loadMessages(channelId, cursor, void 0, () => {
      oldHeight = messagesEndRef.current!.scrollHeight - messagesEndRef.current!.scrollTop
    });

    if (count < +process.env.NEXT_PUBLIC_CHAT_MESSAGES_LIMIT) setState(prev => ({ ...prev, shouldNotLoadMessages: true }));

    messagesEndRef.current!.scrollTop = messagesEndRef.current!.scrollHeight - oldHeight!

    setState(prev => ({ ...prev, loadingMoreMessages: false }));
  };

  const handleSubmitMessage = async (text: string) => {
    if (state.sendingMessage) return false;
    setState(prev => ({ ...prev, sendingMessage: true }));
    const attachments = getInputAttachments(channelId)

    if (text.trim() || attachments.size) {
      const jsonPayload: MessagePayload = {
        content: text || "",
      };

      if (inputState?.type == 'REPLYING') {
        jsonPayload['reply_to'] = inputState.refMessageID;
      }

      const fdPayload = new FormData();

      // for (const file_hash in attachments) {
      // console.log(attachments);

      for (const { file, ...attachment } of attachments.values()) {
        if (!jsonPayload['attachments']) jsonPayload['attachments'] = [];

        jsonPayload['attachments'].push(attachment);

        const compressedFileBytes = Pako.deflateRaw(await file.arrayBuffer());

        fdPayload.append(`files`, new Blob([compressedFileBytes], { type: file.type, endings: "native" }), file.name);
      }

      fdPayload.set('json_payload', new Blob([Pako.deflateRaw(Buffer.from(JSON.stringify(jsonPayload)))]));
      
      const response = await handleRequest("POST", `/chats/${channelId}/messages`, fdPayload, {
        // 'content-type': `multipart/form-data; boundary=${fdPayload.}`
      });

      removeInputState(channelId)
      setState(prev => ({ ...prev, sendingMessage: false }));

      return !response.err;
    } else return false
  };

  return { state, setState, handleInitialMessageLoad, handleLoadMoreMessages, handleSubmitMessage };
}


export default useMessageHandlers