import type { Metadata } from "next";

import { ReviewsWorkspace } from "@/components/reviews/reviews-workspace";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Submit and view shift reviews",
};

export default function ReviewsPage() {
  return <ReviewsWorkspace />;
}
