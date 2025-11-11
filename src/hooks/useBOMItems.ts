import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { BOMItem } from "../types";

export function useBOMItems(projectId: string | undefined) {
  const [bomItems, setBOMItems] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "bomItems"),
      where("projectId", "==", projectId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: BOMItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as BOMItem);
      });
      setBOMItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const addBOMItem = async (
    itemData: Omit<BOMItem, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await addDoc(collection(db, "bomItems"), {
        ...itemData,
        budgetAmount: itemData.quantity * itemData.unitCost,
        claimedAmount: 0,
        paidAmount: 0,
        stockAmount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateBOMItem = async (itemId: string, updates: Partial<BOMItem>) => {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Recalculate budget if quantity or unitCost changed
      if (updates.quantity !== undefined || updates.unitCost !== undefined) {
        const item = bomItems.find((i) => i.id === itemId);
        if (item) {
          const newQuantity = updates.quantity ?? item.quantity;
          const newUnitCost = updates.unitCost ?? item.unitCost;
          updateData.budgetAmount = newQuantity * newUnitCost;
        }
      }

      await updateDoc(doc(db, "bomItems", itemId), updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const deleteBOMItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, "bomItems", itemId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return {
    bomItems,
    loading,
    addBOMItem,
    updateBOMItem,
    deleteBOMItem,
  };
}
