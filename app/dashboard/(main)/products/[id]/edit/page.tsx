"use client";

import { useParams } from "next/navigation";
import { ProductForm } from "@/components/dashboard/products/product-form";
import { useProducts } from "@/hooks/useProducts";
import { RoleGuard } from "@/components/auth/role-guard";

export default function EditProductPage() {
    const params = useParams();
    const id = params?.id as string;
    const { product, isLoading } = useProducts(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
            </div>
        );
    }

    return (
        <RoleGuard allowedRoles={["Editor", "Admin", "SuperAdmin"]}>
            <ProductForm isEdit={true} initialData={product} />
        </RoleGuard>
    );
}
