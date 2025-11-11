import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProject } from "../hooks/useProjects";
import { useBOMItems } from "../hooks/useBOMItems";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Plus,
  FileText,
  
  Trash2,
  Download,
} from "lucide-react";
import { formatCurrency, calculatePercentage } from "../lib/utils";
import AddBOMItemModal from "../components/modals/AddBOMItemModal";
import { generatePDFQuote } from "../lib/pdfGenerator";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { project, loading: projectLoading } = useProject(id);
  const { bomItems, loading: bomLoading, deleteBOMItem } = useBOMItems(id);
  const [showAddBOMModal, setShowAddBOMModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"material" | "labor" | "service">("material");
  const navigate = useNavigate();

  const isOwnerOrManager = user?.role === "owner" || user?.role === "manager";

  if (projectLoading || bomLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Button onClick={() => navigate("/projects")} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  const materialItems = bomItems.filter((item) => item.category === "material");
  const laborItems = bomItems.filter((item) => item.category === "labor");
  const serviceItems = bomItems.filter((item) => item.category === "service");

  const materialTotal = materialItems.reduce((sum, item) => sum + item.budgetAmount, 0);
  const laborTotal = laborItems.reduce((sum, item) => sum + item.budgetAmount, 0);
  const serviceTotal = serviceItems.reduce((sum, item) => sum + item.budgetAmount, 0);
  const grandTotal = materialTotal + laborTotal + serviceTotal;

  const handleGeneratePDF = async () => {
    if (project) {
      await generatePDFQuote({
        project,
        bomItems,
        materialItems,
        laborItems,
        serviceItems,
        subtotal: grandTotal,
        total: grandTotal,
      });
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Cabinet Quote - ${project.projectName}\n\nClient: ${project.clientName}\nTotal: ${formatCurrency(grandTotal)}\n\nPlease find the attached quote for your review.`
    );
    const phoneNumber = project.clientContact.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteBOMItem(itemId);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const renderBOMTable = (items: typeof bomItems, category: string) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Item
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Qty
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Unit
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Unit Cost
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Total
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Claimed
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Paid
            </th>
            {isOwnerOrManager && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={isOwnerOrManager ? 8 : 7} className="px-4 py-8 text-center text-gray-500">
                No {category} items yet
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.itemName}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                    {item.supplier && (
                      <p className="text-xs text-gray-400">Supplier: {item.supplier}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                <td className="px-4 py-3 text-gray-900">{item.unit}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatCurrency(item.unitCost)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(item.budgetAmount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="text-gray-900">{formatCurrency(item.claimedAmount)}</div>
                  <div className="text-xs text-gray-500">
                    {calculatePercentage(item.claimedAmount, item.budgetAmount)}%
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="text-gray-900">{formatCurrency(item.paidAmount)}</div>
                  <div className="text-xs text-gray-500">
                    {calculatePercentage(item.paidAmount, item.budgetAmount)}%
                  </div>
                </td>
                {isOwnerOrManager && (
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => navigate("/projects")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {project.projectName}
              </h1>
              <Badge variant={project.status === "quote" ? "secondary" : project.status === "in-progress" ? "default" : "success"}>
                {project.status}
              </Badge>
            </div>
            <p className="text-gray-600">Client: {project.clientName}</p>
            <p className="text-sm text-gray-500">{project.clientContact}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwnerOrManager && (
              <>
                <Button onClick={handleGeneratePDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleWhatsAppShare} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Share via WhatsApp
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(grandTotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(materialTotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Labor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(laborTotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(serviceTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Materials */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Materials</CardTitle>
          {isOwnerOrManager && (
            <Button
              onClick={() => {
                setSelectedCategory("material");
                setShowAddBOMModal(true);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {renderBOMTable(materialItems, "material")}
        </CardContent>
      </Card>

      {/* Labor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Labor</CardTitle>
          {isOwnerOrManager && (
            <Button
              onClick={() => {
                setSelectedCategory("labor");
                setShowAddBOMModal(true);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Labor
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {renderBOMTable(laborItems, "labor")}
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Services</CardTitle>
          {isOwnerOrManager && (
            <Button
              onClick={() => {
                setSelectedCategory("service");
                setShowAddBOMModal(true);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {renderBOMTable(serviceItems, "service")}
        </CardContent>
      </Card>

      {/* Add BOM Item Modal */}
      {showAddBOMModal && (
        <AddBOMItemModal
          open={showAddBOMModal}
          onClose={() => setShowAddBOMModal(false)}
          projectId={id!}
          category={selectedCategory}
        />
      )}
    </div>
  );
}
