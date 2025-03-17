"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/accounts/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Đặt lại mật khẩu thất bại!");
            }

            setSuccess("Đặt lại mật khẩu thành công! Bạn sẽ được chuyển hướng trong giây lát...");
            setError("");
            setTimeout(() => router.push("/"), 2000);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="card shadow-sm" style={{ width: "400px" }}>
            <div className="card-header bg-success text-white text-center py-3 rounded-top">
                <h1 className="card-title mb-0">FarmTech</h1>
            </div>
            <div className="card-body p-4">
                <h2 className="card-title text-center text-primary mb-4">Đặt Lại Mật Khẩu</h2>
                <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label text-dark">
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            placeholder="Nhập mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label text-dark">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
                    {success && <div className="alert alert-success py-2 mb-3">{success}</div>}
                    <div className="text-end">
                        <button type="submit" className="btn btn-success">
                            Xác nhận
                        </button>
                    </div>
                </form>
            </div>
            <div className="card-footer text-center text-muted py-3">
                <p>© 2025 FarmTech - Cửa Hàng Vật Tư Nông Nghiệp</p>
            </div>
        </div>
    );
}