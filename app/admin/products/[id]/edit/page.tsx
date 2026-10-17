"use client";

import React, { use } from "react";
import { ProductStudioForm } from "@/src/components/admin/ProductStudioForm";

interface EditProductPageProps {
	params: Promise<{ id: string }>;
}

export default function EditProductPage({
	params,
}: EditProductPageProps): React.JSX.Element {
	const resolvedParams = use(params);
	return <ProductStudioForm mode="edit" productId={resolvedParams.id} />;
}
