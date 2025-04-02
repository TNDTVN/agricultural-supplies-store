import { Customer } from "./customer";
import { Employee } from "./employee";
import { OrderDetail } from "./orderdetails";
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
    customer?: Customer;
    employee?: Employee;
    orderDetails?: OrderDetail[];
}
