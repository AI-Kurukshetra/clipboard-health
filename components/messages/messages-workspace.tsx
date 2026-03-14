"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

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

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load conversations");
  }

  return payload.data;
}

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(`/api/messages?conversation_id=${conversationId}`);
  const payload = (await response.json()) as { data: Message[]; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load messages");
  }

  return payload.data;
}

async function createConversation(participantIds: string[]): Promise<void> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "conversation",
      participant_ids: participantIds,
    }),
  });

  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to create conversation");
  }
}

async function sendMessage(payload: { conversationId: string; body: string }): Promise<void> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "message",
      conversation_id: payload.conversationId,
      body: payload.body,
    }),
  });

  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Failed to send message");
  }
}

export function MessagesWorkspace() {
  const supabase = useMemo(() => createClient(), []);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [participantIdsInput, setParticipantIdsInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

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
    if (!selectedConversationId) {
      return;
    }

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

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: async () => {
      setParticipantIdsInput("");
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
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[320px_1fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-slate-900">Conversations</h1>

        <div className="mt-4 grid gap-2">
          <input
            value={participantIdsInput}
            onChange={(event) => setParticipantIdsInput(event.target.value)}
            placeholder="Participant IDs (comma-separated)"
            className="rounded border px-3 py-2 text-sm"
          />
          <button
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={async () => {
              const participantIds = participantIdsInput
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean);

              if (participantIds.length > 0) {
                await createConversationMutation.mutateAsync(participantIds);
              }
            }}
          >
            New Conversation
          </button>
        </div>

        {conversationsQuery.isPending && <p className="mt-3 text-sm text-slate-500">Loading conversations...</p>}
        {conversationsQuery.isError && <p className="mt-3 text-sm text-red-600">Unable to load conversations.</p>}

        <div className="mt-4 space-y-2">
          {conversationsQuery.data?.map((conversation) => (
            <button
              key={conversation.id}
              className={`w-full rounded border px-3 py-2 text-left text-sm ${
                selectedConversationId === conversation.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
              onClick={() => setSelectedConversationId(conversation.id)}
            >
              {conversation.id}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Thread</h2>
        {!selectedConversationId && (
          <p className="mt-4 text-sm text-slate-500">Select a conversation to view messages.</p>
        )}

        {selectedConversationId && (
          <>
            <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto rounded border border-slate-200 p-3">
              {messagesQuery.isPending && <p className="text-sm text-slate-500">Loading messages...</p>}
              {messagesQuery.isError && <p className="text-sm text-red-600">Unable to load messages.</p>}
              {messagesQuery.data?.map((message) => (
                <article key={message.id} className="rounded border border-slate-200 p-2">
                  <p className="text-xs text-slate-500">{message.sender_id}</p>
                  <p className="text-sm text-slate-900">{message.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder="Type your message"
                className="w-full rounded border px-3 py-2 text-sm"
              />
              <button
                className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                onClick={async () => {
                  if (selectedConversationId && messageInput.trim()) {
                    await sendMessageMutation.mutateAsync({
                      conversationId: selectedConversationId,
                      body: messageInput.trim(),
                    });
                  }
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
