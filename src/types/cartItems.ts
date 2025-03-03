export interface CartItem {
    cartItemID: number;
    customerID: number;
    productID: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
}
