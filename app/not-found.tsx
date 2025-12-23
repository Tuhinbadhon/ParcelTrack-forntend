"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageX, Home, ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";

export default function NotFound() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "agent":
          router.push("/agent/dashboard");
          break;
        case "customer":
          router.push("/customer/dashboard");
          break;
        default:
          router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-blue-950 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <PackageX className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold">404</h1>
              <h2 className="text-2xl font-semibold">Page Not Found</h2>
              <p className="text-muted-foreground">
                Oops! The page you're looking for doesn't exist or has been
                moved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button className="w-full sm:w-auto" onClick={handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
