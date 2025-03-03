"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageType } from "@/types/image";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
interface ProductWithImages extends Product {
  images: ImageType[];
}

export default function Home() {
  const [products, setProducts] = useState<ProductWithImages[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8080/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="flex flex-col items-center">
      {/* Banner */}
      <div className="w-full h-[600px] relative mb-8">
        <Image
          src="/images/banner.jpg"
          alt="Khuyến mãi đặc biệt"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="w-full mb-8 flex justify-center">
        <h2 className="text-3xl font-bold text-center">Sản Phẩm Mới</h2>
      </div>
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full px-8 md:px-16 lg:px-32 gap-6">
        {products.map((product) => {
          const imageUrl = product.images && product.images.length > 0
                            ? `/images/${product.images[0].imageName}`
                            : "/images/no-image.jpg";
          return (
            <Card
              key={product.productID}
              className="border bg-white border-transparent overflow-hidden w-[250px] h-[380px] relative group transition-all duration-300 hover:border-red-500 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="relative w-[200px] h-[200px]">
                  <Image
                    src={imageUrl}
                    alt={product.productName}
                    fill
                    className="object-cover rounded-md"
                    priority
                  />
                </div>
                <h2 className="mt-3 text-lg font-semibold">{product.productName}</h2>
                <p className="text-red-500 font-bold text-base mt-1">
                  {product.unitPrice.toLocaleString()} VND
                </p>
                <Link href="/user/product" className="w-full">
                  <Button className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300">
                    Thêm vào giỏ hàng
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
