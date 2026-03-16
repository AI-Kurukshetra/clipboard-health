"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

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
  if (!response.ok) throw new Error(payload.error ?? "Failed to load reviews");
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Failed to submit review");
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-5 w-5",
              star <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsWorkspace() {
  const [assignmentId, setAssignmentId] = useState("");
  const [revieweeId, setRevieweeId] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
      setDialogOpen(false);
      await reviewsQuery.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Submit and view shift reviews"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Star className="h-4 w-4" />
                Submit Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Review</DialogTitle>
                <DialogDescription>Rate your experience with this assignment.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Assignment ID</Label>
                  <Input value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Reviewee User ID</Label>
                  <Input value={revieweeId} onChange={(e) => setRevieweeId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="space-y-2">
                  <Label>Review</Label>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                  />
                </div>
                {createMutation.isError && <Alert variant="destructive"><AlertDescription>Unable to submit review.</AlertDescription></Alert>}
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!assignmentId || !revieweeId) return;
                    await createMutation.mutateAsync({
                      assignment_id: assignmentId,
                      reviewee_id: revieweeId,
                      rating,
                      review_text: reviewText,
                    });
                  }}
                  disabled={createMutation.isPending}
                >
                  Submit Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review History</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsQuery.isPending && <p className="text-sm text-muted-foreground">Loading reviews...</p>}
          {reviewsQuery.isError && <Alert variant="destructive"><AlertDescription>Unable to load reviews.</AlertDescription></Alert>}

          {reviewsQuery.data && reviewsQuery.data.length === 0 && (
            <EmptyState icon={Star} title="No reviews" description="No reviews have been submitted yet." />
          )}

          <div className="space-y-4">
            {reviewsQuery.data?.map((review) => (
              <Card key={review.id}>
                <CardContent className="flex gap-4 pt-6">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{review.reviewer_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Reviewer: {review.reviewer_id.slice(0, 8)}...</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "h-3 w-3",
                              s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Assignment: {review.assignment_id.slice(0, 8)}... | Reviewee: {review.reviewee_id.slice(0, 8)}...
                    </p>
                    <p className="text-sm">{review.review_text ?? "No comment"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
