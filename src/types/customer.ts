export interface Customer {
    customerID: number;
    customerName: string;
    contactName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email: string;
    accountID?: number;
    locked?: boolean;
}
