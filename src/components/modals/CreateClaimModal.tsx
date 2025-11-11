import { useState } from "react";
import { useExpenseClaims } from "../../hooks/useExpenseClaims";
import { useProjects } from "../../hooks/useProjects";
import { useBOMItems } from "../../hooks/useBOMItems";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Upload, X } from "lucide-react";

interface CreateClaimModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function CreateClaimModal({
  open,
  onClose,
  userId,
  userName,
}: CreateClaimModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedBOMItemId, setSelectedBOMItemId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const { projects } = useProjects(userId, "staff");
  const { bomItems } = useBOMItems(selectedProjectId);
  const { createClaim } = useExpenseClaims();

  const selectedBOMItem = bomItems.find((item) => item.id === selectedBOMItemId);
  const remainingBudget = selectedBOMItem
    ? selectedBOMItem.budgetAmount - selectedBOMItem.claimedAmount
    : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setReceipts([...receipts, ...newFiles]);
    }
  };

  const removeReceipt = (index: number) => {
    setReceipts(receipts.filter((_, i) => i !== index));
  };

  const uploadReceipts = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const receipt of receipts) {
      const storageRef = ref(
        storage,
        `receipts/${userId}/${Date.now()}_${receipt.name}`
      );
      await uploadBytes(storageRef, receipt);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }

    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const claimAmount = parseFloat(amount);

    // Validation
    if (!selectedProjectId || !selectedBOMItemId) {
      setError("Please select a project and BOM item");
      return;
    }

    if (claimAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (claimAmount > remainingBudget) {
      setError(
        `Amount exceeds remaining budget of ${remainingBudget.toFixed(2)}`
      );
      return;
    }

    if (receipts.length === 0) {
      setError("Please upload at least one receipt");
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload receipts
      const receiptUrls = await uploadReceipts();
      setUploading(false);

      // Create claim
      await createClaim({
        projectId: selectedProjectId,
        bomItemId: selectedBOMItemId,
        claimedBy: userId,
        claimedByName: userName,
        amount: claimAmount,
        description,
        receiptUrls,
      });

      onClose();
      // Reset form
      setSelectedProjectId("");
      setSelectedBOMItemId("");
      setAmount("");
      setDescription("");
      setReceipts([]);
    } catch (err: any) {
      setError(err.message || "Failed to create claim");
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Expense Claim</DialogTitle>
            <DialogDescription>
              Submit a claim for expenses from a project BOM
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectName} - {project.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProjectId && (
              <div className="space-y-2">
                <Label htmlFor="bomItem">BOM Item *</Label>
                <Select
                  value={selectedBOMItemId}
                  onValueChange={setSelectedBOMItemId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select BOM item" />
                  </SelectTrigger>
                  <SelectContent>
                    {bomItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.itemName} - Budget: ${item.budgetAmount.toFixed(2)}{" "}
                        | Available: $
                        {(item.budgetAmount - item.claimedAmount).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedBOMItem && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-900">
                  Budget: ${selectedBOMItem.budgetAmount.toFixed(2)}
                </p>
                <p className="text-sm text-blue-700">
                  Claimed: ${selectedBOMItem.claimedAmount.toFixed(2)} | Available: $
                  {remainingBudget.toFixed(2)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="What is this expense for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipts">Receipts * (images or PDFs)</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  id="receipts"
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="receipts"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload receipts
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG, or PDF
                  </span>
                </label>
              </div>

              {receipts.length > 0 && (
                <div className="space-y-2 mt-3">
                  {receipts.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReceipt(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {uploading && (
              <p className="text-sm text-blue-600">Uploading receipts...</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Claim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
