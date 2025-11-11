import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";
import { useExpenseClaims } from "../hooks/useExpenseClaims";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  FolderKanban,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDate, calculatePercentage } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects(user?.id, user?.role);
  const { claims, loading: _claimsLoading } = useExpenseClaims(
    undefined,
    user?.id,
    user?.role
  );
  const navigate = useNavigate();

  const isOwnerOrManager = user?.role === "owner" || user?.role === "manager";

  // Calculate statistics
  const activeProjects = projects.filter((p) => p.status === "in-progress");
  const pendingClaims = claims.filter((c) => c.status === "pending");
  const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalPaid = projects.reduce((sum, p) => sum + p.totalPaid, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "quote":
        return "secondary";
      case "in-progress":
        return "default";
      case "completed":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your cabinet projects and expenses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Budget
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Paid
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {calculatePercentage(totalPaid, totalBudget)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Claims
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClaims.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          {isOwnerOrManager && (
            <Button onClick={() => navigate("/projects")} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <p className="text-center text-gray-500 py-8">Loading projects...</p>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No projects yet</p>
              {isOwnerOrManager && (
                <Button
                  onClick={() => navigate("/projects")}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Create your first project
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">
                        {project.projectName}
                      </h3>
                      <Badge variant={getStatusColor(project.status) as any}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.clientName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(project.totalBudget)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {calculatePercentage(project.totalPaid, project.totalBudget)}%
                      paid
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Claims - Only for Owner/Manager */}
      {isOwnerOrManager && pendingClaims.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle>Pending Claims Requiring Approval</CardTitle>
            </div>
            <Button onClick={() => navigate("/claims")} variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingClaims.slice(0, 5).map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {claim.claimedByName}
                    </p>
                    <p className="text-sm text-gray-600">{claim.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(claim.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(claim.amount)}
                    </p>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
