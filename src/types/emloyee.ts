export interface Employee {
    employeeID: number;
    firstName: string;
    lastName: string;
    birthDate: string; // ISO Date String
    hireDate: string;  // ISO Date String
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email: string;
    accountID: number;
}
