import { cn, parseMessageDate, shouldMessageMemo, shouldMessageShowTime } from "@/lib/utils";
import { useStore } from "@/store";
import { Message } from "@/store/store";
import { forwardRef, Fragment, memo } from "react";
import sanitize from "sanitize-html";
import MessageContextMenu from "./message-ctx-menu";
import { motion } from "framer-motion"

type MessageBubbleProps = { message: Message, nextMessage?: Message, previousMessage?: Message };

const MessageBubble = memo(forwardRef<HTMLDivElement, MessageBubbleProps>(({ message, nextMessage, previousMessage }, loadMoreRef) => {
  const me = useStore(({ me }) => me)
  const author = useStore(({ users }) => users.get(message.author_id));

  if (!author) return <div className='italic'>Message without Author</div>;

  const sent = me.id == author.id;

  const shouldShowTime = shouldMessageShowTime({ message, nextMessage });

  const is_reply = message.reply_to !== null;

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
      {
        // is_reply ? <MessageContentReply message={message} sent={sent} /> : <MessageContent message={message} sent={sent} />
      }
    </motion.div>
  </MessageContextMenu>
}), shouldMessageMemo)

const MessageContentReply = ({ message, sent }: { message: Message, sent: boolean }) => {
  const reply = message.reply_to;
  const reply_user = useStore(({ users }) => users.get(reply.author_id));

  const scrollToMessage = () => {
    const messageElement = document.querySelector(`[data-message-id=${reply.id}]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      // TODO: Implement Virtual List
    }
  }

  return (
    <div className={cn("py-[0.2rem] px-2 cursor-pointer rounded-md", sent ? "bg-[--message-bubble-sent-reply]" : 'bg-[--message-bubble-recv-reply]')} onClick={scrollToMessage}>
      <span className="text-[.65rem] font-medium block mt-1 text-foreground">{reply_user?.display_name || "Unknown Author"}</span>
      <p dangerouslySetInnerHTML={{
        __html: sanitize(reply.content.replace(/\n/g, '<br/>'))
      }} className='text-[16px] mb-1 text-ellipsis overflow-hidden whitespace-nowrap'></p>
    </div>
  )
}

const MessageContent = ({ message, sent, className }: { message: Message, sent: boolean } & React.HTMLProps<HTMLDivElement>) => {
  const reply = message.reply_to;
  return (
    <>
      <div className={cn("rounded-lg", sent ? "bg-[--message-bubble-sent]" : "bg-[--message-bubble-recv]", reply && "p-[.15rem]", className)}>
        {reply && <MessageContentReply message={message} sent={sent} />}

        <div className={cn("py-[0.2rem]", reply ? "px-1.5" : "px-2")}>
          <p dangerouslySetInnerHTML={{
            __html: sanitize(message.content.replace(/\n/g, '<br/>'))
          }} className='text-[16px] inline'>
          </p>

          <span className="inline-flex pointer-events-none align-middle select-none float-right invisible relative pl-[4.5px]">
            <span className={cn('text-[12px]/[1] opacity-75 select-none text-nowrap')}>{parseMessageDate(message.created_at)}</span>
            <span className={cn('text-[12px]/[1] opacity-75 select-none text-nowrap visible absolute -bottom-[calc(100%_+_3px)]')}>{parseMessageDate(message.created_at)}</span>
          </span>
        </div>
      </div>
    </>
  )
}


export default MessageBubble