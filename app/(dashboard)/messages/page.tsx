import type { Metadata } from "next";

import { MessagesWorkspace } from "@/components/messages/messages-workspace";

export const metadata: Metadata = {
  title: "Messages",
  description: "Realtime facility and worker messaging",
};

export default function MessagesPage() {
  return <MessagesWorkspace />;
}
