export interface Employee {
    employeeID: number;
    firstName: string;
    lastName: string;
    birthDate?: string; // ISO Date String (YYYY-MM-DD)
    hireDate?: string;  // ISO Date String (YYYY-MM-DD)
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email: string;
    accountID?: number;
    username?: string;
    locked?: boolean;
    role?: string;
}