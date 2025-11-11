import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useExpenseClaims } from "../hooks/useExpenseClaims";
import { useProjects } from "../hooks/useProjects";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Plus, Search, Receipt, Check, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "../lib/utils";
import CreateClaimModal from "../components/modals/CreateClaimModal";
import ApproveClaimModal from "../components/modals/ApproveClaimModal";
import SettleClaimModal from "../components/modals/SettleClaimModal";
import type { ExpenseClaim } from "../types";

export default function ExpenseClaims() {
  const { user } = useAuth();
  const { claims, loading } = useExpenseClaims(undefined, user?.id, user?.role);
  const { projects } = useProjects(user?.id, user?.role);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const isOwnerOrManager = user?.role === "owner" || user?.role === "manager";

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || claim.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.projectName || "Unknown Project";
  };

  const handleApprove = (claim: ExpenseClaim) => {
    setSelectedClaim(claim);
    setShowApproveModal(true);
  };

  const handleSettle = (claim: ExpenseClaim) => {
    setSelectedClaim(claim);
    setShowSettleModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Claims</h1>
          <p className="text-gray-600 mt-1">
            {isOwnerOrManager
              ? "Review and manage expense claims"
              : "Submit and track your expense claims"}
          </p>
        </div>
        {!isOwnerOrManager && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "approved" ? "default" : "outline"}
            onClick={() => setFilterStatus("approved")}
            size="sm"
          >
            Approved
          </Button>
          <Button
            variant={filterStatus === "paid" ? "default" : "outline"}
            onClick={() => setFilterStatus("paid")}
            size="sm"
          >
            Paid
          </Button>
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading claims...</p>
        </div>
      ) : filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || filterStatus !== "all"
                ? "No claims found"
                : "No expense claims yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters"
                : !isOwnerOrManager
                ? "Create your first expense claim to get started"
                : "No expense claims have been submitted yet"}
            </p>
            {!isOwnerOrManager && !searchQuery && filterStatus === "all" && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Claim
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <Card key={claim.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Claim Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {claim.description}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Project: {getProjectName(claim.projectId)}
                        </p>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Claimed By</p>
                        <p className="text-sm font-medium text-gray-900">
                          {claim.claimedByName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(claim.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(claim.createdAt)}
                        </p>
                      </div>
                      {claim.paymentDate && (
                        <div>
                          <p className="text-xs text-gray-500">Paid On</p>
                          <p className="text-sm text-gray-900">
                            {formatDate(claim.paymentDate)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Receipts */}
                    {claim.receiptUrls.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Receipts</p>
                        <div className="flex flex-wrap gap-2">
                          {claim.receiptUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              Receipt {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {claim.rejectionReason && (
                      <div className="mt-3 p-2 bg-red-50 rounded">
                        <p className="text-xs text-red-900">
                          <strong>Rejection Reason:</strong> {claim.rejectionReason}
                        </p>
                      </div>
                    )}

                    {claim.paymentMethod && (
                      <div className="mt-3 p-2 bg-green-50 rounded">
                        <p className="text-xs text-green-900">
                          <strong>Payment Method:</strong> {claim.paymentMethod}
                          {claim.paymentReference && ` | Ref: ${claim.paymentReference}`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions - Only for Owner/Manager */}
                  {isOwnerOrManager && (
                    <div className="flex flex-col gap-2 lg:ml-4">
                      {claim.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleApprove(claim)}
                            size="sm"
                            className="w-full lg:w-auto"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </>
                      )}
                      {claim.status === "approved" && (
                        <Button
                          onClick={() => handleSettle(claim)}
                          size="sm"
                          variant="default"
                          className="w-full lg:w-auto"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Settle Payment
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateClaimModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          userId={user?.id || ""}
          userName={user?.name || ""}
        />
      )}

      {showApproveModal && selectedClaim && (
        <ApproveClaimModal
          open={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedClaim(null);
          }}
          claim={selectedClaim}
          userId={user?.id || ""}
        />
      )}

      {showSettleModal && selectedClaim && (
        <SettleClaimModal
          open={showSettleModal}
          onClose={() => {
            setShowSettleModal(false);
            setSelectedClaim(null);
          }}
          claim={selectedClaim}
        />
      )}
    </div>
  );
}
