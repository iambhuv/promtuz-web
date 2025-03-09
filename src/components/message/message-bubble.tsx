import { cn, parseMessageDate, shouldMessageMemo, shouldMessageShowTime } from "@/lib/utils";
import { useStore } from "@/store";
import { Message, User } from "@/store/store";
import { forwardRef, Fragment, memo, use } from "react";
import sanitize from "sanitize-html";
import MessageContextMenu from "./message-ctx-menu";
import { motion } from "framer-motion"
import { useAPI } from "@/hooks/useAPI";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useChatStore } from "@/store/chat";

import mime from "mime-types";

type MessageBubbleProps = { message: Message, nextMessage?: Message, previousMessage?: Message };

const MessageAuthor = memo(({ author }: { author?: User }) => {
  return author?.display_name ? author?.display_name : author?.username ? `@${author?.username}` : <i>Unknown Author</i>
})

const MessageBubble = memo(forwardRef<HTMLDivElement, MessageBubbleProps>(({ message, nextMessage, previousMessage }, loadMoreRef) => {
  const me = useStore(({ me }) => me)
  const author = useStore(({ users }) => users.get(message.author_id));

  if (!author) return <div className='italic'>Message without Author</div>;

  const sent = me.id == author.id
  const shouldShowTime = shouldMessageShowTime({ message, nextMessage });

  return <MessageContextMenu message={message}>
    <motion.div
      layout="position"
      className={cn(sent ?
        "self-end message sent data-[state=open]: text-primary-foreground" :
        "self-start message received text-sidebar-accent-foreground whitespace-pre-wrap",
        "rounded-lg w-fit h-fit my-[1px] leading-[1.315]", shouldShowTime && 'mb-[2px]')}
      data-message-id={message.id}
      data-created-at={message.created_at}
      ref={loadMoreRef}
    >
      <MessageContent message={message} sent={sent} />
    </motion.div>
  </MessageContextMenu>
}), shouldMessageMemo)

export const MessageContentReply = ({ message, sent }: { message: Message, sent: boolean }) => {
  const reply = message.reply_to;
  const reply_user = useStore(({ users }) => users.get(reply.author_id));

  const scrollToMessage = () => {
    const messageElement = document.querySelector(`[data-message-id=${reply.id}]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const contextElem = messageElement.parentElement!;

      contextElem.style.background = `hsl(var(--hue) 40 35 / .3)`;

      setTimeout(() => {
        contextElem.style.removeProperty('background');
      }, 1250)
    } else {
      // TODO: Implement Virtual List
    }
  }

  return (
    <div className="pt-[0.25rem] px-1 bg-[--message-bubble-sent] rounded-t-lg">
      <div className={cn("py-[0.1rem] px-2 cursor-pointer rounded-md", sent ? "bg-[--message-bubble-sent-reply]" : 'bg-[--message-bubble-recv-reply]')} onClick={scrollToMessage}>
        <span className="text-[.65rem] font-medium block mt-1 text-foreground"><MessageAuthor author={reply_user} /></span>
        <MessageTextContent content={reply.content} className="block mb-1 text-ellipsis overflow-hidden whitespace-nowrap" />
      </div>
    </div>
  )
}

const MessageContent = ({ message, sent, className }: { message: Message, sent: boolean } & React.HTMLProps<HTMLDivElement>) => {
  const reply = message.reply_to;
  return (
    <>
      <div className={cn(reply && "p-[.15rem]", className)}>
        {reply && <MessageContentReply message={message} sent={sent} />}

        <div className="flex flex-col">
          {message.attachments.map(attachment => {
            const file_extension = attachment.file_name ? attachment.file_name.split(".").at(-1) : "";

            const file_url = `${process.env.API_ENDPOINT}/attachments/${message.channel_id}/${message.id}/${attachment.id}` + (file_extension ? `.${file_extension}` : '');

            // return attachment.file_name 
            return <img key={attachment.id} src={file_url} className="max-w-60 w-full pt-px" />
          })}
        </div>

        <div className={cn("py-[0.2rem] rounded-b-lg", !message.attachments.length && !reply && 'rounded-t-lg', sent ? "bg-[--message-bubble-sent]" : "bg-[--message-bubble-recv]", reply ? "px-1.5" : "px-2")}>
          <MessageTextContent content={message.content} />

          <span className="inline-flex pointer-events-none align-middle select-none float-right invisible relative pl-[4.5px]">
            <span className={cn('text-[12px]/[1] opacity-75 select-none text-nowrap')}>{parseMessageDate(message.created_at)}</span>
            <span className={cn('text-[12px]/[1] opacity-75 select-none text-nowrap visible absolute -bottom-[calc(100%_+_3px)]')}>{parseMessageDate(message.created_at)}</span>
          </span>
        </div>
      </div>
    </>
  )
};

export const MessageTextContent = ({ content, className }: { content: string, className?: string }) => {
  return <p dangerouslySetInnerHTML={{ __html: sanitize(content.replace(/\n/g, '<br/>')) }} className={cn('text-[16px] inline', className)}></p>
}


export const InputReplyBubble = memo(({ channel_id, message_id }: { channel_id: string, message_id: string }) => {
  let message_cache = useStore(({ messages }) => messages[channel_id][message_id]);

  let { data: message, loading } = message_cache ? { data: message_cache, loading: false } : useAPI<Message>('GET', `/chats/${channel_id}/messages/${message_id}`);

  const reply_user = useStore(({ users }) => users.get(message ? message.author_id : ""));
  const removeInputState = useChatStore().removeInputState

  // if (loading || !message) return (
  // <motion.div layout className="w-full h-fit px-2.5 pt-2 pb-1.5 rounded-lg bg-[--message-bubble-recv-reply]">
  //   <p className='text-[.65rem] italic'>{loading ? 'Loading Message...' : 'Invalid Message'}</p>
  // </motion.div>
  // );

  const cancelReply = () => {
    removeInputState(channel_id)
  }

  return <motion.div className="w-full h-fit px-2.5 pt-2 pb-1.5 rounded-lg bg-[--message-bubble-recv-reply] flex items-center relative z-10">
    {loading || !message ?
      <p className='text-[.65rem] italic'>{loading ? 'Loading Message...' : 'Invalid Message'}</p>
      : <>
        <div className="flex flex-col flex-1">
          <p className='text-[.55rem] flex'>Replying to <MessageAuthor author={reply_user} /> <X className="ml-auto cursor-pointer" onClick={cancelReply} size={16} /></p>
          <MessageTextContent content={message.content.slice(0, 128)} className="block max-h-[1lh] overflow-ellipsis break-all overflow-clip" />
        </div>
      </>
    }


  </motion.div>
})

export default MessageBubble