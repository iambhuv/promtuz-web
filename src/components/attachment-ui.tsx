import React from 'react'

const AttachmentUI = ({ hovering }: { hovering: boolean }) => {
  return (
    <div>Hovering : {hovering ? "True" : "False"}</div>
  )
}

export default AttachmentUI