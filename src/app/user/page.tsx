"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="p-4 flex justify-center">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full px-8 md:px-16 lg:px-32 gap-0">
        {products.map((product) => (
          <div key={product.id} className="w-full flex">
            <Card className="border-r bg-white border-transparent overflow-hidden w-[250px] h-[380px] relative group rounded-none transition-all duration-300 hover:border-red-500 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="relative w-[250px] h-[250px]">
                  <Image src={"/"+product.imageUrl} alt={product.name} fill className="object-cover" priority />
                </div>
                <h2 className="mt-3 text-lg font-semibold">{product.name}</h2>
                <p className="text-red-500 font-bold text-base mt-1">
                  {product.price.toLocaleString()} VND
                </p>
                <Button className="w-full bottom-0 bg-red-500/90 hover:bg-red-600 text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute rounded-none">
                  <Link href={"/user/product"} className="w-full text-center block">
                    Thêm vào giỏ hàng
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </main>
  );
}
