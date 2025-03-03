export interface Order {
    orderID: number;
    customerID?: number;
    employeeID?: number;
    orderDate: string; // ISO Date String
    shippedDate?: string;
    shipAddress?: string;
    shipCity?: string;
    shipPostalCode?: string;
    shipCountry?: string;
    notes?: string;
    freight?: number;
}
