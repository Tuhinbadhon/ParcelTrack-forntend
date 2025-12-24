import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Shield, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-blue-950">
      <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Package className="h-6 w-6 text-blue-600" />
            <span>ParcelTrack</span>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Link href="/login">
              <Button className="cursor-pointer" variant="outline">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="cursor-pointer">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Professional Courier & Parcel Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Track, manage, and deliver parcels with real-time updates
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Track Parcel
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Book parcel pickups with just a few clicks. Simple and fast.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Real-Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Track your parcels in real-time with live location updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Secure Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Your parcels are safe with our verified delivery agents.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Fast Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Quick pickups and timely deliveries across the country.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-900/30 dark:text-white text-gray-800 border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to start shipping?
            </h2>
            <p className="text-lg mb-6 dark:text-blue-100">
              Join thousands of customers who trust ParcelTrack for their
              deliveries
            </p>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 cursor-pointer"
              >
                Create Free Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-white dark:bg-gray-950 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 ParcelTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
