import React, { useState } from 'react'
import useFilePaste from './useFilePaste'
import { LocalAttachment } from '@/types'
import { AttachmentType } from '@/store/enums'

const useAttachments = () => {
  const [attachments, setAttachments] = useState<LocalAttachment[]>([])

  const { handleFilePaste } = useFilePaste()

  return { handleFilePaste }
}

export default useAttachments