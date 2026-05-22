"use client";

import { ProductForm } from "@/components/dashboard/products/product-form";
import { RoleGuard } from "@/components/auth/role-guard";

export default function NewProductPage() {
    return (
        <RoleGuard allowedRoles={["Editor", "Admin", "SuperAdmin"]}>
            <ProductForm />
        </RoleGuard>
    );
}
