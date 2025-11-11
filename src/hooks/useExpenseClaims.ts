import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ExpenseClaim } from "../types";

export function useExpenseClaims(projectId?: string, userId?: string, userRole?: string) {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;

    if (projectId) {
      // Get claims for a specific project
      q = query(
        collection(db, "expenseClaims"),
        where("projectId", "==", projectId)
      );
    } else if (userId && userRole === "staff") {
      // Staff see only their own claims
      q = query(
        collection(db, "expenseClaims"),
        where("claimedBy", "==", userId)
      );
    } else {
      // Owners and managers see all claims
      q = query(collection(db, "expenseClaims"));
    }

    if (!q) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const claimsData: ExpenseClaim[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        claimsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          paymentDate: data.paymentDate?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
        } as ExpenseClaim);
      });
      setClaims(claimsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, userId, userRole]);

  const createClaim = async (
    claimData: Omit<ExpenseClaim, "id" | "createdAt" | "updatedAt" | "status">
  ) => {
    try {
      // Check for duplicate claims (same user, same BOM item, pending/approved)
      const existingClaimsQuery = query(
        collection(db, "expenseClaims"),
        where("claimedBy", "==", claimData.claimedBy),
        where("bomItemId", "==", claimData.bomItemId)
      );
      const existingClaims = await getDocs(existingClaimsQuery);

      const hasPendingClaim = existingClaims.docs.some((doc) => {
        const status = doc.data().status;
        return status === "pending" || status === "approved";
      });

      if (hasPendingClaim) {
        throw new Error("You already have a pending claim for this item");
      }

      await addDoc(collection(db, "expenseClaims"), {
        ...claimData,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const approveClaim = async (claimId: string, approvedBy: string) => {
    try {
      await updateDoc(doc(db, "expenseClaims", claimId), {
        status: "approved",
        approvedBy,
        approvedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const rejectClaim = async (claimId: string, rejectionReason: string) => {
    try {
      await updateDoc(doc(db, "expenseClaims", claimId), {
        status: "rejected",
        rejectionReason,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const settleClaim = async (
    claimId: string,
    paymentMethod: string,
    paymentDate: Date,
    paymentReference: string
  ) => {
    try {
      await updateDoc(doc(db, "expenseClaims", claimId), {
        status: "paid",
        paymentMethod,
        paymentDate: Timestamp.fromDate(paymentDate),
        paymentReference,
        updatedAt: Timestamp.now(),
      });

      // Update BOM item paid amount
      const claim = claims.find((c) => c.id === claimId);
      if (claim) {
        const bomItemRef = doc(db, "bomItems", claim.bomItemId);
        const bomItemDoc = await getDocs(
          query(collection(db, "bomItems"), where("__name__", "==", claim.bomItemId))
        );

        if (!bomItemDoc.empty) {
          const bomItem = bomItemDoc.docs[0].data();
          await updateDoc(bomItemRef, {
            paidAmount: (bomItem.paidAmount || 0) + claim.amount,
          });
        }
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return {
    claims,
    loading,
    createClaim,
    approveClaim,
    rejectClaim,
    settleClaim,
  };
}
