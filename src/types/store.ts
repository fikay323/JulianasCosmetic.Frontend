export type OrderStatus =
	| "Awaiting Delivery Agreement"
	| "Awaiting Payment"
	| "Paid"
	| "Dispatched";

export type ProductCategory =
	| "Serums"
	| "Moisturisers"
	| "Suncare"
	| "Cleansers"
	| "Treatments";

export interface FormulationSpecs {
	phLevel: string;
	texture: string;
	skinType: string;
	keyActives: string[];
}

export interface ProductAccordions {
	bioActives: string;
	inci: string;
	ritual: string;
	nafdac: string;
}

export interface Product {
	id: string;
	name: string;
	tagline: string;
	price: number;
	category: ProductCategory;
	stockStatus: "In Stock" | "Out of Stock";
	images: string[];
	description: string;
	formulation: FormulationSpecs;
	accordions: ProductAccordions;
	featured?: boolean;
	inStock?: boolean;
	size?: string;
	rating?: number;
	reviewCount?: number;
	nafdacRegNo?: string;
	slug?: string;
}

export interface CartItem {
	product: Product;
	quantity: number;
	selectedSize?: string;
}

export interface CustomerInfo {
	fullName: string;
	phone: string;
	state: string;
	cityLga: string;
	address: string;
	streetAddress?: string;
	courierNotes?: string;
	email?: string;
}

export interface OrderItem {
	productId: string;
	productName: string;
	price: number;
	quantity: number;
	productImage?: string;
	size?: string;
	totalPrice?: number;
}

export interface Order {
	id: string;
	orderNumber: string;
	customer: CustomerInfo;
	items: OrderItem[];
	subtotal: number;
	agreedDeliveryFee: number | null;
	total: number;
	status: OrderStatus;
	whatsappMessageUrl: string;
	whatsappUrl?: string;
	createdAt: string;
	updatedAt: string;
	notes?: string;
}

export interface CreateOrderDto {
	customer: CustomerInfo;
	items: Array<{
		productId: string;
		quantity: number;
	}>;
}

export interface UpdateOrderDto {
	agreedDeliveryFee?: number | null;
	status?: OrderStatus;
	notes?: string;
}

export interface UpdateProductDto {
	id?: string;
	price?: number;
	stockStatus?: "In Stock" | "Out of Stock";
	inStock?: boolean;
}

export interface AdminStats {
	totalOrders: number;
	awaitingDeliveryAgreement: number;
	awaitingPayment: number;
	paid: number;
	dispatched: number;
	totalRevenue: number;
}
