import Script from "next/script";

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi">
            <head>
                <title>Đặt Lại Mật Khẩu - FarmTech</title>
                <meta name="description" content="Đặt lại mật khẩu cho tài khoản FarmTech của bạn." />
                {/* Thêm Bootstrap CSS */}
                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
                    crossOrigin="anonymous"
                />
                {/* Thêm Font Awesome */}
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
                />
                {/* Thêm Bootstrap JS */}
                <Script
                    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                    crossOrigin="anonymous"
                />
            </head>
            <body 
                className="d-flex align-items-center justify-content-center min-vh-100"
                style={{
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    backgroundAttachment: "fixed"
                }}
            >
                {children}
            </body>
        </html>
    );
}