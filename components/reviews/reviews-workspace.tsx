"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

type ReviewRecord = {
  id: string;
  assignment_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
};

type ReviewResponse = {
  data: ReviewRecord[];
  error?: string;
};

async function fetchReviews(): Promise<ReviewRecord[]> {
  const response = await fetch("/api/reviews");
  const payload = (await response.json()) as ReviewResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load reviews");
  }

  return payload.data;
}

async function createReview(payload: {
  assignment_id: string;
  reviewee_id: string;
  rating: number;
  review_text: string;
}): Promise<void> {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Failed to submit review");
  }
}

async function updateReview(payload: {
  review_id: string;
  rating: number;
  review_text: string;
}): Promise<void> {
  const response = await fetch("/api/reviews", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Failed to update review");
  }
}

export function ReviewsWorkspace() {
  const [assignmentId, setAssignmentId] = useState("");
  const [revieweeId, setRevieweeId] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
  });

  const createMutation = useMutation({
    mutationFn: createReview,
    onSuccess: async () => {
      setAssignmentId("");
      setRevieweeId("");
      setRating(5);
      setReviewText("");
      await reviewsQuery.refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateReview,
    onSuccess: async () => {
      await reviewsQuery.refetch();
    },
  });

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Submit Review</h1>
        <div className="mt-4 grid gap-3">
          <input
            value={assignmentId}
            onChange={(event) => setAssignmentId(event.target.value)}
            placeholder="Assignment ID"
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            value={revieweeId}
            onChange={(event) => setRevieweeId(event.target.value)}
            placeholder="Reviewee User ID"
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="rounded border px-3 py-2 text-sm"
          />
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Review text"
            className="rounded border px-3 py-2 text-sm"
          />
          <button
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={async () => {
              if (!assignmentId || !revieweeId) {
                return;
              }

              await createMutation.mutateAsync({
                assignment_id: assignmentId,
                reviewee_id: revieweeId,
                rating,
                review_text: reviewText,
              });
            }}
          >
            Submit Review
          </button>
        </div>

        {createMutation.isError && <p className="mt-3 text-sm text-red-600">Unable to submit review.</p>}
        {createMutation.isSuccess && <p className="mt-3 text-sm text-green-700">Review submitted.</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Review History</h2>
        {reviewsQuery.isPending && <p className="mt-3 text-sm text-slate-500">Loading reviews...</p>}
        {reviewsQuery.isError && <p className="mt-3 text-sm text-red-600">Unable to load reviews.</p>}

        <div className="mt-4 space-y-3">
          {reviewsQuery.data?.map((review) => (
            <article key={review.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">Assignment: {review.assignment_id}</p>
              <p className="text-sm text-slate-600">Reviewer: {review.reviewer_id}</p>
              <p className="text-sm text-slate-600">Reviewee: {review.reviewee_id}</p>
              <p className="text-sm text-slate-700">Rating: {review.rating}/5</p>
              <p className="mt-1 text-sm text-slate-700">{review.review_text ?? "No comment"}</p>
              <button
                className="mt-2 rounded border border-slate-300 px-2 py-1 text-xs"
                onClick={async () => {
                  await updateMutation.mutateAsync({
                    review_id: review.id,
                    rating: review.rating,
                    review_text: review.review_text ?? "",
                  });
                }}
              >
                Re-save
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
