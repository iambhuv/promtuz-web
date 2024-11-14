import { PasteEvent } from '@/types'
import React from 'react'

const useFilePaste = () => {
  function handleFilePaste(pasteEvent: PasteEvent) {
    const fileList = pasteEvent.clipboardData.files;
    if (!fileList.length) return;

    
  }

  return { handleFilePaste }
}

export default useFilePaste