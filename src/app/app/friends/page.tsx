"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ChevronDown, LucideEllipsisVertical, X } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store";
import type { Relationship } from "@/store/store";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, createFallbackAvatar } from "@/lib/utils";
import { handleRequest } from "@/lib/api";

export default function Friends() {
  const relations = useStore((store) => store.relationships);

  const { friends, pending } = useMemo(() => {
    const pending: { sent: typeof relations, received: typeof relations } = { sent: [], received: [] };
    const friends: typeof relations = [];

    for (const rel of relations) {
      if (!rel.accepted_at) {
        rel.incoming ? pending.received.push(rel) : pending.sent.push(rel)
      }
      else friends.push(rel)
    }

    return { pending, friends }
  }, [relations]);

  return (
    <>
      <header className="flex h-16 shrink-0 gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-medium text-muted-foreground">Friends</h1>
        </div>
      </header>
      <div className="flex flex-col gap-5 p-4 pt-0 overflow-y-auto h-[calc(100dvh-(5rem))] sidebar-inset-scrollarea">
        <Tabs defaultValue="online">
          <TabsList>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <FriendsList pending relations={pending.received} />
            <FriendsList relations={friends} />
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            <FriendsList title="SENT" relations={pending.sent} />
            <FriendsList pending relations={pending.received} />
          </TabsContent>
          <TabsContent value="title" className="mt-6">
            <FriendsList title="ONLINE" pending relations={[]} />
          </TabsContent>
          <TabsContent value="offline" className="mt-6">
            <FriendsList relations={friends} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
};

const RelationListItem = ({ isPending = false, relation }: { isPending: boolean, relation: Relationship }) => {
  const user = useStore(store => store.users.get(relation.user_id));

  const skelly_widths = [20, 24, 28, 40, 44, 48, 52];
  const widths = (w => [`w-${w}`, `w-${skelly_widths[(skelly_widths.indexOf(w) || 1) - 1]}`])(skelly_widths[Math.floor(Math.random() * skelly_widths.length)])

  const acceptRequest = async () => {
    const { err, data } = await handleRequest("POST", `/friends/${user!.id}/accept`);

    console.log(err, data);
  }

  const rejectRequest = () => {

  }

  return user ? <div className="p-2 rounded-2xl hover:bg-sidebar-accent/[.5] flex gap-3 items-center">
    <Avatar className="h-10 w-10 rounded-lg">
      {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
      <AvatarFallback className="rounded-lg text-lg font-semibold text-muted-foreground">{createFallbackAvatar(user.display_name || user.username)}</AvatarFallback>
    </Avatar>
    <div className="flex flex-col mr-auto">
      <p className="text-sm mb-auto">{user.display_name}</p>
      <span className="text-xs text-muted-foreground">
        <Link href={'/user/@alex_tech'}>
          @{user.username}
        </Link>
      </span>
    </div>
    {isPending && relation.incoming && <>
      <div className="flex gap-2">
        <Button variant={'secondary'} size={'icon'} className="[&_svg]:size-5 rounded-2xl" onClick={acceptRequest}>
          <Check strokeWidth={2.25} />
        </Button>
        <Button variant={'secondary'} size={'icon'} className="[&_svg]:size-5 rounded-2xl bg-destructive/[.5] hover:bg-destructive/[.75]" onClick={rejectRequest}>
          <X strokeWidth={2.25} />
        </Button>
      </div>
      <Separator orientation="vertical" className="my-2" /></>
    }
    <Button variant={'secondary'} size={'icon'} className="[&_svg]:size-5 rounded-2xl">
      <LucideEllipsisVertical strokeWidth={2.25} />
    </Button>
  </div> : <Skeleton className="p-2 flex gap-3">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <div className="flex flex-col mr-auto">
      <Skeleton className={cn('h-4', widths[0], 'mb-auto')} />
      <Skeleton className={cn("h-3.5", widths[1])} />
    </div>
  </Skeleton>
};

const FriendsList = ({ title = "OFFLINE", relations, pending: isPending = false }: { title?: string, relations: Relationship[], pending?: boolean }) => {
  if (isPending) title = 'PENDING'

  return <div className="flex flex-col gap-2 mb-6">
    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 cursor-pointer">
      {title} - {relations.length}
    </p>
    <div className="flex flex-col gap-1">
      {relations.map((rel) => <RelationListItem relation={rel} isPending={isPending} key={rel.id} />)}
    </div>
  </div>
}