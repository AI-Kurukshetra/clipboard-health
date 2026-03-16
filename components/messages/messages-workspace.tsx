"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Plus, Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

type Conversation = {
  id: string;
  created_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/messages");
  const payload = (await response.json()) as { data: Conversation[]; error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Failed to load conversations");
  return payload.data;
}

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(`/api/messages?conversation_id=${conversationId}`);
  const payload = (await response.json()) as { data: Message[]; error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Failed to load messages");
  return payload.data;
}

async function createConversation(participantIds: string[]): Promise<void> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "conversation", participant_ids: participantIds }),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Failed to create conversation");
}

async function sendMessage(payload: { conversationId: string; body: string }): Promise<void> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "message",
      conversation_id: payload.conversationId,
      body: payload.body,
    }),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Failed to send message");
}

export function MessagesWorkspace() {
  const supabase = useMemo(() => createClient(), []);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [participantIdsInput, setParticipantIdsInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", selectedConversationId],
    queryFn: () => fetchMessages(selectedConversationId),
    enabled: selectedConversationId.length > 0,
  });

  useEffect(() => {
    if (!selectedConversationId) return;

    const channel = supabase
      .channel(`conversation:${selectedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        async () => {
          await messagesQuery.refetch();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [messagesQuery, selectedConversationId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: async () => {
      setParticipantIdsInput("");
      setDialogOpen(false);
      await conversationsQuery.refetch();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: async () => {
      setMessageInput("");
      await messagesQuery.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Chat with facilities and workers"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
                <DialogDescription>Enter participant IDs to start a conversation.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Participant IDs (comma-separated)</Label>
                  <Input
                    value={participantIdsInput}
                    onChange={(e) => setParticipantIdsInput(e.target.value)}
                  />
                </div>
                {createConversationMutation.isError && <Alert variant="destructive"><AlertDescription>Failed to create conversation.</AlertDescription></Alert>}
                <Button
                  className="w-full"
                  onClick={async () => {
                    const ids = participantIdsInput.split(",").map((v) => v.trim()).filter(Boolean);
                    if (ids.length > 0) await createConversationMutation.mutateAsync(ids);
                  }}
                  disabled={createConversationMutation.isPending}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="flex h-[600px] overflow-hidden">
        {/* Conversation List */}
        <div className="w-72 border-r">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Conversations</h3>
          </div>
          <ScrollArea className="h-[calc(600px-49px)]">
            {conversationsQuery.isPending && <p className="p-4 text-sm text-muted-foreground">Loading...</p>}
            {conversationsQuery.isError && <p className="p-4 text-sm text-destructive">Unable to load conversations.</p>}
            <div className="space-y-1 p-2">
              {conversationsQuery.data?.map((conv) => (
                <button
                  key={conv.id}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                    selectedConversationId === conv.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setSelectedConversationId(conv.id)}
                >
                  <span className="truncate font-medium">{conv.id.slice(0, 8)}...</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Message Thread */}
        <div className="flex flex-1 flex-col">
          {!selectedConversationId ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="No conversation selected"
                description="Select a conversation to view messages."
              />
            </div>
          ) : (
            <>
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Thread</h3>
                <p className="text-xs text-muted-foreground">{selectedConversationId}</p>
              </div>

              <ScrollArea className="flex-1 p-4">
                {messagesQuery.isPending && <p className="text-sm text-muted-foreground">Loading messages...</p>}
                {messagesQuery.isError && <p className="text-sm text-destructive">Unable to load messages.</p>}
                <div className="space-y-3">
                  {messagesQuery.data?.map((msg) => (
                    <div key={msg.id} className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">{msg.sender_id.slice(0, 8)}...</p>
                      <p className="mt-1 text-sm">{msg.body}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator />
              <div className="flex gap-2 p-4">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey && messageInput.trim()) {
                      e.preventDefault();
                      await sendMessageMutation.mutateAsync({
                        conversationId: selectedConversationId,
                        body: messageInput.trim(),
                      });
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={async () => {
                    if (selectedConversationId && messageInput.trim()) {
                      await sendMessageMutation.mutateAsync({
                        conversationId: selectedConversationId,
                        body: messageInput.trim(),
                      });
                    }
                  }}
                  disabled={sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
