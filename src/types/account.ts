// Trong file types/account.ts hoặc nơi bạn định nghĩa interface
export interface Account {
    accountID: number;
    username: string;
    password: string;
    email: string;
    profileImage?: string;
    createdDate: string;
    role: string;
    tokenCode?: string;
    locked?: boolean;
}