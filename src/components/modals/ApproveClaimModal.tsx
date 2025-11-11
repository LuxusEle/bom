import { useState } from "react";
import { useExpenseClaims } from "../../hooks/useExpenseClaims";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { ExpenseClaim } from "../../types";
import { formatCurrency, formatDate } from "../../lib/utils";

interface ApproveClaimModalProps {
  open: boolean;
  onClose: () => void;
  claim: ExpenseClaim;
  userId: string;
}

export default function ApproveClaimModal({
  open,
  onClose,
  claim,
  userId,
}: ApproveClaimModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { approveClaim, rejectClaim } = useExpenseClaims();

  const handleApprove = async () => {
    setError("");
    setLoading(true);

    try {
      await approveClaim(claim.id, userId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to approve claim");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await rejectClaim(claim.id, rejectionReason);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reject claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Expense Claim</DialogTitle>
          <DialogDescription>
            Approve or reject this expense claim
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Claim Details */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Claimed By</p>
              <p className="text-gray-900">{claim.claimedByName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-gray-900">{claim.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(claim.amount)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-gray-900">{formatDate(claim.createdAt)}</p>
            </div>

            {/* Receipts */}
            {claim.receiptUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Receipts</p>
                <div className="flex flex-wrap gap-2">
                  {claim.receiptUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      View Receipt {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rejection Reason (optional) */}
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
            <Input
              id="rejectionReason"
              placeholder="Why is this claim being rejected?"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Processing..." : "Reject"}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleApprove}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Processing..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
