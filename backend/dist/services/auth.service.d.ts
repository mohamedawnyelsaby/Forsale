export declare class AuthService {
    register(data: {
        email: string;
        password: string;
        name: string;
    }): Promise<{
        user: {
            id: number;
            email: string;
            role: string;
            name: string | null;
            created_at: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: number;
            email: string;
            role: string;
            name: string | null;
            email_verified: boolean;
            phone: string | null;
            avatar_url: string | null;
            bio: string | null;
            pi_wallet: string | null;
            balance_pi: number;
            rating_avg: number;
            total_sales: number;
            total_purchases: number;
            is_verified: boolean;
            is_active: boolean;
            last_login: Date | null;
            created_at: Date;
            updated_at: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(token: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map