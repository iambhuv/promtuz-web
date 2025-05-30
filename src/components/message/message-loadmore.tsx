import React from 'react'
import { Button } from '../ui/button'

type LoadMoreProps = {
  shouldNotLoadMessages: boolean,
  loadingMoreMessages: boolean,
  onClick: () => void
}

export const LoadMoreMessages = React.forwardRef<HTMLButtonElement | null, LoadMoreProps>(
  ({ shouldNotLoadMessages, loadingMoreMessages, onClick }, loadMoreRef) => {
    return !shouldNotLoadMessages &&
      !loadingMoreMessages &&
      <Button
        ref={loadMoreRef}
        variant={'secondary'}
        size={'sm'}
        className='w-fit mb-5 mx-auto'
        onClick={onClick}
      >Load More Messages</Button>
  }
)
