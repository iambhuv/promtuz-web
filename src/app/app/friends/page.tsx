"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { handleRequest } from "@/lib/api";
import { cn, createFallbackAvatar } from "@/lib/utils";
import { useStore } from "@/store";
import type { RelationID, Relationship } from "@/store/store";
import { Check, LucideEllipsisVertical, UserRoundSearch, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Friends() {
  const relations = useStore(store => store.relationships);
  const presence = useStore(store => store.presence);
  const { toast } = useToast()
  const [friendUser, setFriendUser] = useState("");

  const { friends, pending, online } = useMemo(() => {
    const pending: { sent: typeof relations, received: typeof relations } = { sent: new Map(), received: new Map };
    const friends: typeof relations = new Map();
    const online: typeof relations = new Map();


    relations.forEach((relationship, relation_id) => {
      const user_presence = presence.get(relationship.user_id);

      if (!relationship.accepted_at) {
        relationship.incoming ?
          pending.received.set(relation_id, relationship) :
          pending.sent.set(relation_id, relationship)
      } else if (user_presence && user_presence.presence != "OFFLINE") {
        online.set(relation_id, relationship);
      }

      else friends.set(relation_id, relationship)
    })

    return { pending, friends, online }
  }, [relations, presence]);


  const searchFriend = async () => {
    const { err, data } = await handleRequest<{ code: number, response: any }>("POST", `/friends/@${friendUser}`);

    if (data) {
      if (data.code !== 200) {
        data.response?.error && toast({
          title: data.response.error,
          variant: 'destructive'
        })
      } else toast({ title: "Friend request sent." })
    } else {
      toast({
        title: err.error,
        variant: 'destructive'
      })
    }
  }

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
        <div className="flex gap-2 items-center mt-3">
          <Input value={friendUser} onChange={e => setFriendUser(e.target.value)} className="" placeholder="Friend Username" />
          <Button size={'icon'} onClick={searchFriend}>
            <UserRoundSearch />
          </Button>
        </div>

        <Tabs defaultValue="online">
          <TabsList>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <FriendsList pending relations={pending.received} />
            <FriendsList title="ONLINE" relations={online} />
            <FriendsList relations={friends} />
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            <FriendsList title="SENT" relations={pending.sent} />
            <FriendsList pending relations={pending.received} />
          </TabsContent>
          <TabsContent value="online" className="mt-6">
            <FriendsList title="ONLINE" relations={online} />
          </TabsContent>
          <TabsContent value="offline" className="mt-6">
            <FriendsList relations={friends} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
};

const RelationListItem = ({ isPending = false, isOnline = false, relation }: { isPending: boolean, isOnline: boolean, relation: Relationship }) => {
  const user = useStore(store => store.users.get(relation.user_id));
  const { toast } = useToast()

  const skelly_widths = [20, 24, 28, 40, 44, 48, 52];
  const widths = (w => [`w-${w}`, `w-${skelly_widths[(skelly_widths.indexOf(w) || 1) - 1]}`])(skelly_widths[Math.floor(Math.random() * skelly_widths.length)])

  const acceptRequest = async () => {
    const { err, data } = await handleRequest<{ chat: any }>("POST", `/friends/${user!.id}/accept`);

    if (!err && data && data.chat) {
      // Sucess Hogaya
      // Remove Friend request
    }
  }

  const rejectRequest = () => {
    toast({
      title: "Awkat bana reject karne ki!"
    })
  }

  return user ? <div className="p-2 rounded-2xl hover:bg-sidebar-accent/[.5] flex gap-3 items-center">
    <Avatar className="h-10 w-10 rounded-lg relative overflow-visible">
      {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
      <AvatarFallback className="rounded-lg text-lg font-semibold text-muted-foreground">{createFallbackAvatar(user.display_name || user.username)}</AvatarFallback>

      {isOnline && <span className="size-3 bg-[#23a55a] rounded-full absolute bottom-0 right-0"></span>}
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
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <Button variant={'secondary'} size={'icon'} className="[&_svg]:size-5 rounded-2xl">
          <LucideEllipsisVertical strokeWidth={2.25} />
        </Button>
      </ContextMenuTrigger>

      <ContextMenuContent className='w-24 border-none bg-sidebar-accent/60 backdrop-blur-xl'>

        <ContextMenuItem
          // whileTap={{ scale: .5 }}
          // key={MENU_ITEM.label}
          className='focus:bg-popover/40 text-xs'
        // onClick={MENU_ITEM.onClick}
        >
          Hi
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div> : <Skeleton className="p-2 flex gap-3">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <div className="flex flex-col mr-auto">
      <Skeleton className={cn('h-4', widths[0], 'mb-auto')} />
      <Skeleton className={cn("h-3.5", widths[1])} />
    </div>
  </Skeleton>
};

const FriendsList = ({ title = "OFFLINE", relations, pending: isPending = false }: { title?: string, relations: Map<RelationID, Relationship>, pending?: boolean }) => {
  if (isPending) title = 'PENDING'

  const isOnline = title == "ONLINE";

  return <div className="flex flex-col gap-2 mb-6">
    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 cursor-pointer">
      {title} - {relations.size}
    </p>
    <div className="flex flex-col gap-1">
      {Array.from(relations).map((rel) => <RelationListItem relation={rel[1]} isPending={isPending} isOnline={isOnline} key={rel[0]} />)}
    </div>
  </div>
}