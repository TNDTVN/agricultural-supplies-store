"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types/category";
import { ImageType } from "@/types/image";
import { Product } from "@/types/product";
import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash/debounce";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../layout";

interface ProductWithImages extends Product {
    images: ImageType[];
}

export default function PurchasedProducts() {
    const [products, setProducts] = useState<ProductWithImages[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("*");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [priceRange, setPriceRange] = useState<number>(0);
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(10000000);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState(true);

    const productsPerPage = 12;
    const router = useRouter();
    const { setIsLoginModalOpen } = useAuth();

    useEffect(() => {
        const accountID = sessionStorage.getItem("accountID");
        if (!accountID) {
            toast.error("Vui lòng đăng nhập để xem sản phẩm đã mua!", {
                position: "top-right",
                autoClose: 3000,
            });
            setIsLoginModalOpen(true);
            router.push("/user");
            return;
        }

        fetchCategories();
        fetchPurchasedProducts(accountID);
    }, []);

    const debouncedFilterPurchasedProducts = useCallback(
        debounce((page: number) => {
            filterPurchasedProducts(page);
        }, 300),
        [selectedCategory, searchQuery, minPrice, priceRange]
    );

    useEffect(() => {
        const accountID = sessionStorage.getItem("accountID");
        if (accountID) {
            debouncedFilterPurchasedProducts(currentPage);
        }
    }, [selectedCategory, priceRange, currentPage, debouncedFilterPurchasedProducts]);

    const fetchPurchasedProducts = async (accountID: string) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/orders/products/${accountID}`);
            const data = await response.json();
            setProducts(data);
            const prices = data.map((p: Product) => p.unitPrice);
            const min = prices.length > 0 ? Math.min(...prices) : 0;
            const max = prices.length > 0 ? Math.max(...prices) : 10000000;
            setMinPrice(min);
            setMaxPrice(max);
            setPriceRange(max);
            setTotalPages(Math.ceil(data.length / productsPerPage));
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm đã mua:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8080/categories/all");
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const filterPurchasedProducts = async (page: number) => {
        try {
            const accountID = sessionStorage.getItem("accountID");
            if (!accountID) return;

            const params = new URLSearchParams();
            if (selectedCategory !== "*") params.append("categoryId", selectedCategory);
            if (searchQuery) params.append("keyword", searchQuery);
            params.append("minPrice", minPrice.toString());
            params.append("maxPrice", priceRange.toString());
            params.append("page", page.toString());
            params.append("size", productsPerPage.toString());

            const response = await fetch(
                `http://localhost:8080/orders/products/${accountID}/filter?${params.toString()}`
            );
            const data = await response.json();
            setProducts(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Lỗi khi lọc sản phẩm:", error);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        filterPurchasedProducts(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-lg font-medium text-gray-600 animate-pulse">
                    Đang tải sản phẩm đã mua...
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-col md:flex-row gap-8 px-4 md:px-8 lg:px-16 py-8">
            <div className="w-full md:w-1/4 space-y-6">
                <div className="bg-white p-4 shadow rounded">
                    <h3 className="font-bold text-lg mb-4">Danh mục sản phẩm</h3>
                    <ul className="space-y-2">
                        <li>
                            <button
                                className={`w-full text-left p-2 hover:bg-red-50 hover:text-red-500 rounded ${
                                    selectedCategory === "*" ? "bg-red-50 text-red-500 font-medium" : ""
                                }`}
                                onClick={() => setSelectedCategory("*")}
                            >
                                Tất cả
                            </button>
                        </li>
                        {categories.map((category) => (
                            <li key={category.categoryID}>
                                <button
                                    className={`w-full text-left p-2 hover:bg-red-50 hover:text-red-500 rounded ${
                                        selectedCategory === category.categoryID.toString()
                                            ? "bg-red-50 text-red-500 font-medium"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedCategory(category.categoryID.toString())}
                                >
                                    {category.categoryName}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-4 shadow rounded">
                    <h3 className="font-bold text-lg mb-4">Lọc theo giá</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>{minPrice.toLocaleString()} VND</span>
                            <span>{priceRange.toLocaleString()} VND</span>
                        </div>
                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-center text-sm">
                            Giá tối đa: {maxPrice.toLocaleString()} VND
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-3/4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex w-full md:w-1/2 gap-2">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm đã mua..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <Button
                            onClick={handleSearch}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Tìm
                        </Button>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex gap-2">
                            <Button
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                            >
                                Trước
                            </Button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={
                                            currentPage === pageNum
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                        }
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            <Button
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </div>

                {products.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4"
                        layout
                    >
                        <AnimatePresence>
                            {products.map((product) => {
                                const imageUrl =
                                    product.images && product.images.length > 0
                                        ? `http://localhost:8080/images/${product.images[0].imageName}`
                                        : "/images/no-image.jpg";
                                return (
                                    <motion.div
                                        key={product.productID}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="bg-white overflow-hidden w-full h-full relative group rounded-none transition-all duration-300 hover:border-red-500 hover:-translate-y-1 hover:shadow-lg">
                                            <CardContent className="p-2 flex flex-col items-center text-center">
                                                <div className="relative w-full aspect-square">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={product.productName}
                                                        fill
                                                        className="object-cover"
                                                        priority
                                                    />
                                                </div>
                                                <h2 className="mt-2 text-sm font-semibold line-clamp-2">
                                                    {product.productName}
                                                </h2>
                                                <p className="text-red-500 font-bold text-sm mt-1">
                                                    {product.unitPrice.toLocaleString()} VND
                                                </p>
                                                <Button className="w-full mt-2 bg-red-500/90 hover:bg-red-600 text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-none">
                                                    <Link
                                                        href={`/user/product/${product.productID}`}
                                                        className="w-full text-center block"
                                                    >
                                                        Xem chi tiết
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Bạn chưa mua sản phẩm nào.</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-start mt-8">
                        <div className="flex gap-2">
                            <Button
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                            >
                                Trước
                            </Button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={
                                            currentPage === pageNum
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                        }
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            <Button
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}