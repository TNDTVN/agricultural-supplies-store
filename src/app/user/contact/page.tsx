"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import "@/lib/fontawesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "react-toastify";

const MapWithNoSSR = dynamic(() => import("@/components/Map"), {
    ssr: false,
});

export default function ContactPage() {
    const [contactSuccess, setContactSuccess] = useState(false);
    const [newsletterSuccess, setNewsletterSuccess] = useState(false);

    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactWebsite, setContactWebsite] = useState("");
    const [contactMessage, setContactMessage] = useState("");

    const [newsletterEmail, setNewsletterEmail] = useState("");

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContactSuccess(true);
        toast.success("🎉 Tin nhắn đã được gửi! Cảm ơn bạn.", {
        position: "top-right",
        autoClose: 5000,
        });
        setTimeout(() => setContactSuccess(false), 5000);
        setContactName("");
        setContactEmail("");
        setContactWebsite("");
        setContactMessage("");
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setNewsletterSuccess(true);
        toast.success("🎉 Đăng ký thành công! Cảm ơn bạn đã đăng ký nhận tin.", {
        position: "top-right",
        autoClose: 5000,
        });
        setTimeout(() => setNewsletterSuccess(false), 5000);
        setNewsletterEmail("");
    };

    return (
        <div className="container mx-auto px-4 py-8 relative">
        <div className="mb-6">
            <ul className="flex items-center gap-2 text-gray-600">
            <li>
                <a href="/user" className="hover:underline">
                Trang Chủ
                </a>
            </li>
            <li className="flex items-center">
                <span className="mx-2">›</span>
                <span className="text-green-700">Liên Hệ</span>
            </li>
            </ul>
        </div>

        <div className="mb-8">
            <MapWithNoSSR />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
            <h1 className="text-3xl font-bold mb-4">Liên Hệ Với Chúng Tôi</h1>
            <p className="mb-4">
                Có nhiều cách để liên hệ với chúng tôi. Bạn có thể gửi email, gọi điện hoặc điền form,
                chọn cách phù hợp nhất với bạn.
            </p>
            <div className="mb-4">
                <p>SĐT: 0898 543 919</p>
                <p>Email: dhao30167@gmail.com</p>
            </div>
            <div className="mb-4">
                <p>Địa chỉ: Phạm Hữu Lầu, Phường 6, Cao Lãnh, Đồng Tháp</p>
            </div>
            <div className="mb-4">
                <p>Giờ làm việc: 8:00 - 18:00, Thứ Hai - Thứ Sáu</p>
                <p>Chủ Nhật: Đóng cửa</p>
            </div>

            <div>
                <h1 className="text-2xl font-bold mb-4">Theo Dõi Chúng Tôi</h1>
                <div className="flex gap-4">
                <a href="#" className="bg-blue-600 p-2 rounded-full text-white">
                    <FontAwesomeIcon icon={["fab", "facebook-f"]} />
                </a>
                <a href="#" className="bg-sky-500 p-2 rounded-full text-white">
                    <FontAwesomeIcon icon={["fab", "twitter"]} />
                </a>
                <a href="#" className="bg-red-500 p-2 rounded-full text-white">
                    <FontAwesomeIcon icon={["fab", "google-plus-g"]} />
                </a>
                <a href="#" className="bg-amber-700 p-2 rounded-full text-white">
                    <FontAwesomeIcon icon={["fab", "instagram"]} />
                </a>
                </div>
            </div>
            </div>

            <div>
            <h1 className="text-3xl font-bold mb-4">Gửi Tin Nhắn Cho Chúng Tôi!</h1>
            <p className="mb-4">Điền vào form dưới đây để nhận phản hồi miễn phí và bảo mật.</p>
            <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input
                placeholder="Họ Tên"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                />
                <Input
                type="email"
                placeholder="Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                />
                <Input
                type="url"
                placeholder="Website"
                value={contactWebsite}
                onChange={(e) => setContactWebsite(e.target.value)}
                required
                />
                <Textarea
                placeholder="Tin Nhắn"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={3}
                required
                />
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                Gửi Tin Nhắn
                </Button>
            </form>
            </div>
        </div>

        <div className="mt-12 bg-gray-100 py-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
                <h4 className="text-xl font-bold">Đăng Ký Nhận Tin</h4>
                <p>Đăng ký để nhận bản tin và được giảm 20% cho lần mua đầu tiên</p>
            </div>
            <div className="ml-auto">
                <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col md:flex-row gap-4 items-center"
                >
                <Input
                    type="email"
                    placeholder="Email của bạn"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="w-full bg-white md:w-auto"
                />
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                    Đăng Ký
                </Button>
                </form>
            </div>
            </div>
        </div>
        </div>
    );
}