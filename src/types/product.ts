import { ImageType } from "@/types/image";
import { Category } from "./category";
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
    images: ImageType[];
    category?: Category;
}
