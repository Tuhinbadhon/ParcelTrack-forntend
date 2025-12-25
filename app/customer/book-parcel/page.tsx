/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parcelApi } from "@/lib/api/parcels";
import toast from "react-hot-toast";
import { Package } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";

// Pricing rules
const RATE_PER_KG = 15; // BDT per kg
const MIN_COST = 50; // minimum delivery cost (BDT)

const parcelSchema = z.object({
  pickupAddress: z
    .string()
    .min(10, "Pickup address must be at least 10 characters"),
  pickupMapLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  recipientAddress: z
    .string()
    .min(10, "Delivery address must be at least 10 characters"),
  recipientMapLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  recipientName: z
    .string()
    .min(2, "Recipient name must be at least 2 characters"),
  recipientPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  weight: z.number().min(0.1, "Weight must be greater than 0"),
  description: z.string().optional(),
  cost: z.number().min(1, "Cost must be greater than 0"),
  paymentType: z.enum(["cod", "prepaid"]),
  senderName: z.string().optional(),
});

type ParcelFormData = z.infer<typeof parcelSchema>;

export default function BookParcelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
    defaultValues: { paymentType: "prepaid", cost: 0 },
  });

  const formData = watch();
  const weightValue = watch("weight");

  useEffect(() => {
    const w = Number(weightValue) || 0;
    if (w > 0) {
      const computed = Math.max(MIN_COST, Math.round(w * RATE_PER_KG));
      setValue("cost", computed, { shouldDirty: true, shouldValidate: true });
    } else {
      setValue("cost", 0, { shouldDirty: true, shouldValidate: true });
    }
  }, [weightValue, setValue]);

  const onSubmit = async (data: ParcelFormData) => {
    setLoading(true);

    try {
      const parcel = await parcelApi.createParcel({
        ...data,
        senderName: user?.name || "",
      });
      toast.success("Parcel booked successfully!");
      router.push(`/customer/track?id=${parcel.trackingNumber}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to book parcel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Book a Parcel</h1>
        <p className="text-muted-foreground">
          Fill in the details to schedule a pickup
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parcel Details
          </CardTitle>
          <CardDescription>
            Provide accurate information for smooth delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Pickup Information</h3>
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address *</Label>
                <Textarea
                  id="pickupAddress"
                  placeholder="Enter complete pickup address"
                  {...register("pickupAddress")}
                  rows={3}
                />
                {errors.pickupAddress && (
                  <p className="text-sm text-red-500">
                    {errors.pickupAddress.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupMapLink">Pickup Google Maps Link</Label>
                <Input
                  id="pickupMapLink"
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  {...register("pickupMapLink")}
                />
                {errors.pickupMapLink && (
                  <p className="text-sm text-red-500">
                    {errors.pickupMapLink.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Share location from Google Maps app or paste link
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Delivery Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    placeholder="Full name"
                    {...register("recipientName")}
                  />
                  {errors.recipientName && (
                    <p className="text-sm text-red-500">
                      {errors.recipientName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Recipient Phone *</Label>
                  <Input
                    id="recipientPhone"
                    type="tel"
                    placeholder="+880 1234 567890"
                    {...register("recipientPhone")}
                  />
                  {errors.recipientPhone && (
                    <p className="text-sm text-red-500">
                      {errors.recipientPhone.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Delivery Address *</Label>
                <Textarea
                  id="recipientAddress"
                  placeholder="Enter complete delivery address"
                  {...register("recipientAddress")}
                  rows={3}
                />
                {errors.recipientAddress && (
                  <p className="text-sm text-red-500">
                    {errors.recipientAddress.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientMapLink">
                  Delivery Google Maps Link
                </Label>
                <Input
                  id="recipientMapLink"
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  {...register("recipientMapLink")}
                />
                {errors.recipientMapLink && (
                  <p className="text-sm text-red-500">
                    {errors.recipientMapLink.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Share location from Google Maps app or paste link
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Parcel Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.5"
                    {...register("weight", { valueAsNumber: true })}
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-500">
                      {errors.weight.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Delivery Cost (BDT)</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="Auto-calculated"
                    readOnly
                    disabled
                    {...register("cost", { valueAsNumber: true })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Calculated from weight (BDT {RATE_PER_KG}/kg, min ৳
                    {MIN_COST})
                  </p>
                  {errors.cost && (
                    <p className="text-sm text-red-500">
                      {errors.cost.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any special notes or instructions"
                  {...register("description")}
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Payment</h3>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      value="prepaid"
                      {...register("paymentType")}
                      defaultChecked
                      className="form-radio"
                    />
                    <span>Prepaid</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      value="cod"
                      {...register("paymentType")}
                      className="form-radio"
                    />
                    <span>Cash on Delivery (COD)</span>
                  </label>
                </div>
                {errors.paymentType && (
                  <p className="text-sm text-red-500">
                    {errors.paymentType.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Summary</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">
                    {formData.weight || "0"} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Cost:</span>
                  <span className="font-medium">৳{formData.cost || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">
                    {formData.paymentType === "cod"
                      ? "Cash on Delivery"
                      : "Prepaid"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Booking..." : "Book Parcel"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
