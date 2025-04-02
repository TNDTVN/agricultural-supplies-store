export interface OrderDetail {
    orderDetailID: number;
    orderID: number;
    productID: number;
    unitPrice: number;
    quantity: number;
    discount: number;
    order?: any;
    product?: any;
}