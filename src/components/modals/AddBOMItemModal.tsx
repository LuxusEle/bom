import { useState } from "react";
import { useBOMItems } from "../../hooks/useBOMItems";
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
import type { BOMCategory } from "../../types";

interface AddBOMItemModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  category: BOMCategory;
}

export default function AddBOMItemModal({
  open,
  onClose,
  projectId,
  category,
}: AddBOMItemModalProps) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addBOMItem } = useBOMItems(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await addBOMItem({
        projectId,
        category,
        itemName,
        description,
        quantity: parseFloat(quantity),
        unit,
        unitCost: parseFloat(unitCost),
        supplier,
        budgetAmount: 0, // Will be calculated
        claimedAmount: 0,
        paidAmount: 0,
        stockAmount: 0,
      });
      onClose();
      // Reset form
      setItemName("");
      setDescription("");
      setQuantity("");
      setUnit("");
      setUnitCost("");
      setSupplier("");
    } catch (err: any) {
      setError(err.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case "material":
        return "Material";
      case "labor":
        return "Labor";
      case "service":
        return "Service";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add {getCategoryTitle()} Item</DialogTitle>
            <DialogDescription>
              Add a new {category} item to the BOM
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                placeholder={
                  category === "material"
                    ? "e.g., Oak Plywood"
                    : category === "labor"
                    ? "e.g., Installation Labor"
                    : "e.g., Delivery Service"
                }
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  placeholder="sheets, hours, etc."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost ($) *</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                placeholder="50.00"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
              />
            </div>

            {category === "material" && (
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="e.g., Home Depot"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
            )}

            {quantity && unitCost && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-900">
                  Total: ${(parseFloat(quantity) * parseFloat(unitCost)).toFixed(2)}
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
