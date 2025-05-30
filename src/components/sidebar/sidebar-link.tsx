import Link from 'next/link';
import React from 'react';
import { useSidebar } from '../ui/sidebar';

const SidebarLink = (props: React.ComponentProps<typeof Link>) => {
  const sidebar = useSidebar();
  const closeSidebar = () => sidebar.setOpenMobile(false)

  return <Link onClick={closeSidebar} {...props} />
}

export default SidebarLink