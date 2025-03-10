import { parseMessageDate } from '@/lib/utils';
import { Message } from '@/store/store';
import { forwardRef, memo, useEffect, useMemo } from 'react';
import MessageBubble from './message-bubble';
import MessageTime from './message-time';
import { useStore } from '@/store';
import { handleRequest } from '@/lib/api';

export const MessageList = memo(forwardRef<HTMLDivElement, { messageList: Message[], channel_id: string }>(({ messageList, channel_id }, loadMoreRef) => {
  const channel = useStore(store => store.channels[channel_id]);
  const ackMessage = useStore(store => store.ackMessage);

  const groupedMessages = useMemo(() => {
    return messageList.reduce<Array<{
      day: string,
      messages: Message[],
      displayDate: string,
      messageTillNow: number
    }>>((groups, message, ind) => {
      const date = new Date(message.created_at);
      const day = date.toISOString().split('T')[0];

      // Find or create group
      const existingGroup = groups.find(group => group.day === day);

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          day,
          messages: [message],
          displayDate: parseMessageDate(message.created_at, true),
          messageTillNow: ind + 1
        });
      }

      return groups;
    }, []);
  }, [messageList]);


  useEffect(() => {
    if (channel.unread_message_count > 0) {
      const ack_msg = messageList.at(-1);

      const handleAck = () => ack_msg && ackMessage(channel_id, ack_msg.id)

      if (window.document.hasFocus()) {
        handleAck();
      } else {
        window.addEventListener('focusin', handleAck, { once: true })

        return () => {
          window.removeEventListener('focusin', handleAck)
        }
      }
    }
  }, [messageList])

  return (
    groupedMessages.map(({ day, displayDate, messages, messageTillNow }) => {
      return <div className="time-group relative" data-time={day} key={day}>
        <MessageTime displayTime={displayDate} />

        {messages.map((msg, msg_ind) => {
          const index = messageTillNow + msg_ind
          return <MessageBubble message={msg} key={msg.id} nextMessage={messages[index + 1]} previousMessage={messages[index - 1]} ref={index == +process.env.LOAD_MORE_THRESHOLD ? loadMoreRef : undefined} />
        })}
      </div>
    })
  )
}))

