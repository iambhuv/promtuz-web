import { useStore } from '@/store'
import { useChatStore } from '@/store/chat'
import { PasteEvent } from '@/types'
import React from 'react'

const useFilePaste = () => {
  const activeChannel = useStore(store => store.activeChannel);
  const attach = useChatStore(state => state.attach)
  const attachments = useChatStore(state => state.attachments)
  const clearAttachments = useChatStore(state => state.clearAttachments)


  function handleFilePaste(pasteEvent: PasteEvent) {
    const fileList = pasteEvent.clipboardData.files;
    if (!fileList.length) return;

    // FIXME: Security Add kar be

    for (const file of fileList) {

      // TODO: Utility function banao acha sa
      attach(activeChannel, file, file.type.startsWith('image') ? "IMAGE" : 'OTHER_FILE')
    }
  }

  return { handleFilePaste }
}

export default useFilePaste