export interface Account {
    accountID: number;
    username: string;
    password: string;
    email: string;
    profileImage?: string;
    createdDate: string;
    role: string;
    tokenCode?: string;
}
