export interface Product {
    productID: number;
    productName: string;
    categoryID: number;
    supplierID: number;
    quantityPerUnit?: string;
    unitPrice: number;
    unitsInStock: number;
    unitsOnOrder: number;
    discontinued: boolean;
    productDescription?: string;
}
