import { useAPI } from "@/hooks/useAPI";
import { cn, parseMessageDate, shouldMessageMemo, shouldMessageShowAuthor, shouldMessageShowTime } from "@/lib/utils";
import { useStore } from "@/store";
import { useChatStore } from "@/store/chat";
import { Message, User } from "@/types/store";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { forwardRef, memo } from "react";
import sanitize from "sanitize-html";
import MessageContextMenu from "./message-ctx-menu";
import { ChannelType } from "@/store/enums";


type MessageBubbleProps = { message: Message, nextMessage?: Message, previousMessage?: Message, channel_type: ChannelType };

const MessageAuthor = memo(({ author }: { author?: User }) => {
  return author?.display_name ? author?.display_name : author?.username ? `@${author?.username}` : <i>Unknown Author</i>
})

const MessageBubble = memo(forwardRef<HTMLDivElement, MessageBubbleProps>(({ message, nextMessage, previousMessage, channel_type }, loadMoreRef) => {
  // const me = useStore(store => store.me)
  const my_id = useStore(store => store.me.id)
  const author = useStore(store => store.users.get(message.author_id));
  const setInputState = useChatStore(state => state.setInputState);

  if (!author) return <div className='italic'>Message without Author</div>;

  const sent = my_id == author.id;


  const shouldShowTime = shouldMessageShowTime({ message, nextMessage });

  const shouldDifferentiate = shouldMessageShowAuthor({ message, previousMessage });

  const shouldShowAuthor = channel_type == "GROUP_CHAT" && !sent && shouldDifferentiate;

  return <MessageContextMenu onDoubleClick={() => {
    setInputState(message.channel_id, {
      type: "REPLYING", refMessageID: message.id
    })
  }} message={message}>
    <motion.div
      className={cn(sent ?
        "self-end message sent data-[state=open]: text-primary-foreground" :
        "self-start message received text-sidebar-accent-foreground whitespace-pre-wrap",
        "rounded-lg w-fit h-fit my-[1px] leading-[1.315]", shouldShowTime && 'mb-[2px]', shouldDifferentiate && 'mt-0.5')}
      data-message-id={message.id}
      data-created-at={message.created_at}
      ref={loadMoreRef}
    >
      <MessageContent message={message} sent={sent} shouldShowTime={shouldShowTime} shouldShowAuthor={shouldShowAuthor} />
    </motion.div>
  </MessageContextMenu>
}), shouldMessageMemo)

export const MessageContentReply = ({ message, sent }: { message: Message, sent: boolean }) => {
  const reply = message.reply_to;
  const reply_user = useStore(store => store.users.get(reply.author_id));

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
    <div className={cn("pt-[0.25rem] px-1 rounded-t-lg", sent ? 'bg-(--message-bubble-sent)' : "bg-(--message-bubble-recv)")}>
      <div className={cn("py-[0.1rem] px-2 cursor-pointer rounded-sm", sent ? "bg-(--message-bubble-sent-reply)" : 'bg-(--message-bubble-recv-reply)')} onClick={scrollToMessage}>
        <span className="text-[.65rem] font-medium block mt-1 text-foreground"><MessageAuthor author={reply_user} /></span>
        <MessageTextContent content={reply.content} className="block mb-1 text-ellipsis overflow-hidden whitespace-nowrap" />
      </div>
    </div>
  )
}

const MessageContent = ({ message, sent, className, shouldShowAuthor, shouldShowTime }: { message: Message, sent: boolean, shouldShowAuthor: boolean, shouldShowTime: boolean } & React.HTMLProps<HTMLDivElement>) => {
  const reply = message.reply_to;
  const author = useStore(store => store.users.get(message.author_id));

  const is_empty_content = message.content.trim() == "";

  return (
    <>
     <div className={cn(reply && "", "relative", className)}>
        {reply && <MessageContentReply message={message} sent={sent} />}

        <div className="flex flex-col">
          {/* TODO: Border Around Images */}
          {message.attachments.map(attachment => {
            const file_extension = attachment.file_name ? attachment.file_name.split(".").at(-1) : "";

            const file_url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/attachments/${message.channel_id}/${message.id}/${attachment.id}` + (file_extension ? `.${file_extension}` : '');

            // return attachment.file_name 
            return <img key={attachment.id} src={file_url} className="max-w-60 w-full pt-px rounded-t-md" />
          })}
        </div>

        {!is_empty_content ? <div className={cn("py-[0.2rem] rounded-b-md", !message.attachments.length && !reply && 'rounded-t-md', sent ? "bg-(--message-bubble-sent)" : "bg-(--message-bubble-recv)", reply ? "px-1.5" : "px-2", shouldShowTime && (sent ? "rounded-br-none" : "rounded-bl-none"))}>
          {shouldShowAuthor && <span className="text-[.65rem] font-medium block mt-1 text-foreground"><MessageAuthor author={author} /></span>}
          <MessageTextContent content={message.content} />

          <span className="inline-flex pointer-events-none align-middle select-none float-right invisible relative pl-[4.5px]">
            <span className={cn('text-[12px]/[1] opacity-75 select-none text-nowrap')}>{parseMessageDate(message.created_at)}</span>
            <span className={cn('text-[12px]/[1] opacity-75 select-none text-nowrap visible absolute -bottom-[calc(100%_+_3px)]')}>{parseMessageDate(message.created_at)}</span>
          </span>
        </div> : <span className="inline-flex pointer-events-none align-middle select-none float-right invisible relative my-1">
          <span className={cn('text-[12px]/[1] opacity-75 select-none text-nowrap')}>{parseMessageDate(message.created_at)}</span>
          <span className={cn('text-[12px]/[1] opacity-75 select-none text-nowrap visible absolute')}>{parseMessageDate(message.created_at)}</span>
        </span>}

        {shouldShowTime && <svg width="9" height="20" className={cn("absolute bottom-0 translate-y-[3px]", sent ? "text-(--message-bubble-sent) left-full" : "text-(--message-bubble-recv) right-full")}>
          <g fill="none" fillRule="evenodd">
            {
              sent ?
                <path d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 016 17z" fill="currentColor" className="corner"></path> :
                <path d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z" fill="currentColor" className="corner"></path>
            }
          </g>
        </svg>}
      </div>
    </>
  )
};

export const MessageTextContent = ({ content, className }: { content: string, className?: string }) => {
  return <p dangerouslySetInnerHTML={{ __html: sanitize(content.replace(/\n/g, '<br/>')) }} className={cn('text-[16px] inline', className)}></p>
}


export const InputReplyBubble = memo(({ channel_id, message_id }: { channel_id: string, message_id: string }) => {
  let message_cache = useStore(store => store.messages[channel_id][message_id]);

  let { data: message, loading } = message_cache ? { data: message_cache, loading: false } : useAPI<Message>('GET', `/chats/${channel_id}/messages/${message_id}`);

  const reply_user = useStore(store => store.users.get(message ? message.author_id : ""));
  const removeInputState = useChatStore(state => state.removeInputState)

  // if (loading || !message) return (
  // <motion.div layout className="w-full h-fit px-2.5 pt-2 pb-1.5 rounded-lg bg-(--message-bubble-recv-reply)">
  //   <p className='text-[.65rem] italic'>{loading ? 'Loading Message...' : 'Invalid Message'}</p>
  // </motion.div>
  // );

  const cancelReply = () => {
    removeInputState(channel_id)
  }

  return <motion.div className="w-full h-fit px-2.5 pt-2 pb-1.5 rounded-lg bg-(--message-bubble-recv-reply) flex items-center relative z-10">
    {loading || !message ?
      <p className='text-[.65rem] italic'>{loading ? 'Loading Message...' : 'Invalid Message'}</p>
      : <>
        <div className="flex flex-col flex-1">
          <p className='text-[.55rem] flex'>Replying to <MessageAuthor author={reply_user} /> <X className="ml-auto cursor-pointer" onClick={cancelReply} size={16} /></p>
          <MessageTextContent content={message.content.slice(0, 128)} className="block max-h-[1lh] text-ellipsis break-all overflow-clip" />
        </div>
      </>
    }


  </motion.div>
})

export default MessageBubble