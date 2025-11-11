import { Component, type ErrorInfo, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 Error Boundary caught an error:");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Stack:", error.stack);
  }

  public render() {
    if (this.state.hasError) {
      const isFirebaseError = this.state.error?.message?.includes("Firebase");

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <CardTitle className="text-2xl">Setup Required</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isFirebaseError ? (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-semibold text-yellow-900 mb-2">
                      Firebase Configuration Missing
                    </p>
                    <p className="text-sm text-yellow-800">
                      Your Firebase credentials need to be configured for the app to work.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Quick Setup (5 minutes):</h3>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Create Firebase Project</p>
                          <p className="text-sm text-gray-600">
                            Go to{" "}
                            <a
                              href="https://console.firebase.google.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Firebase Console
                            </a>{" "}
                            and create a new project
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Enable Services</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            <li>Authentication (Email/Password)</li>
                            <li>Firestore Database</li>
                            <li>Storage</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Add Configuration</p>
                          <p className="text-sm text-gray-600">
                            Create <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file
                            in project root with your Firebase credentials
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                          4
                        </div>
                        <div>
                          <p className="font-medium">Restart Development Server</p>
                          <p className="text-sm text-gray-600">
                            Run <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> again
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>📖 Detailed instructions:</strong> Check the README.md file in your
                      project for complete Firebase setup guide with security rules.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-900 mb-2">Application Error</p>
                    <p className="text-sm text-red-800 font-mono">
                      {this.state.error?.message || "An unexpected error occurred"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Please check the browser console for more details.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
