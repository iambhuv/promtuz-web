import React, { useState } from 'react'
import useFilePaste from './useFilePaste'
import { LocalAttachment } from '@/types'
import { AttachmentType } from '@/store/enums'
import { useChatStore } from '@/store/chat'

const useAttachments = () => {
  const attach = useChatStore(state => state.attach)
  const attachments = useChatStore(state => state.attachments)
  const clearAttachments = useChatStore(state => state.clearAttachments)

  // const [attachments, setAttachments] = useState<LocalAttachment[]>([])

  const { handleFilePaste } = useFilePaste()

  return { handleFilePaste }
}

export default useAttachments