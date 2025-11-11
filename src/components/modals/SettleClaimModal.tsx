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
import { formatCurrency } from "../../lib/utils";

interface SettleClaimModalProps {
  open: boolean;
  onClose: () => void;
  claim: ExpenseClaim;
}

export default function SettleClaimModal({
  open,
  onClose,
  claim,
}: SettleClaimModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { settleClaim } = useExpenseClaims();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!paymentMethod.trim()) {
      setError("Please specify payment method");
      return;
    }

    setLoading(true);

    try {
      await settleClaim(
        claim.id,
        paymentMethod,
        new Date(paymentDate),
        paymentReference
      );
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to settle claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Settle Payment</DialogTitle>
            <DialogDescription>
              Record payment details for this approved claim
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Claim Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Paying to</p>
              <p className="font-semibold text-gray-900 mb-3">
                {claim.claimedByName}
              </p>
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(claim.amount)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Input
                id="paymentMethod"
                placeholder="e.g., Bank Transfer, Cash, Check"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentReference">
                Payment Reference / Transaction ID
              </Label>
              <Input
                id="paymentReference"
                placeholder="e.g., TXN123456, Check #789"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
