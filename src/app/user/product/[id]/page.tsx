"use client";

import { useAuth } from "@/app/user/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ProductDetailPage() {
  const { setIsLoginModalOpen } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    } else {
      setError("Không tìm thấy ID sản phẩm");
      setLoading(false);
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/products/${id}`);
      if (!response.ok) throw new Error("Không thể lấy thông tin sản phẩm");
      const productData: Product = await response.json();

      if (!productData.category && productData.categoryID) {
        const categoryResponse = await fetch(`http://localhost:8080/categories/${productData.categoryID}`);
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          productData.category = categoryData;
        }
      }

      setProduct(productData);
      setSelectedImage(
        productData.images?.length > 0
          ? `http://localhost:8080/images/${productData.images[0].imageName}`
          : "/images/no-image.jpg"
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageName: string) => {
    setSelectedImage(`http://localhost:8080/images/${imageName}`);
  };

  const handleAddToCart = () => {
    if (quantity > product!.unitsInStock) {
      toast.error("Số lượng sản phẩm không đủ!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const accountID = sessionStorage.getItem("accountID");
    if (!accountID) {
      setIsLoginModalOpen(true);
      return;
    }

    setShowModal(true);
  };

  const confirmAddToCart = async () => {
    const accountID = sessionStorage.getItem("accountID");
    if (!accountID) {
      setIsLoginModalOpen(true);
      setShowModal(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          accountID: accountID,
          productID: product!.productID.toString(),
          quantity: quantity.toString(),
        }).toString(),
      });

      console.log("Response status:", response.status); // Debug status
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Thêm vào giỏ hàng thất bại!");
      }

      console.log("Thêm thành công, gọi toast"); // Debug
      toast.success(`Đã thêm ${quantity} ${product?.productName} vào giỏ hàng!`, {
        position: "top-right",
        autoClose: 3000,
      });
      setShowModal(false);
    } catch (err) {
      console.error("Lỗi trong confirmAddToCart:", err); // Debug lỗi
      toast.error("Có lỗi xảy ra: " + (err instanceof Error ? err.message : "Lỗi không xác định"), {
        position: "top-right",
        autoClose: 3000,
      });
      setShowModal(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, Math.min(product!.unitsInStock, prev + change)));
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-lg font-medium text-gray-600 animate-pulse">Đang tải sản phẩm...</div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-lg font-medium text-red-500 bg-white p-6 rounded-lg shadow-md">
          {error || "Không tìm thấy sản phẩm"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-2">
          <ul className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/user" className="hover:text-indigo-600 transition-colors">
                Trang chủ
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link
                href={`/user/categories?categoryId=${product.categoryID}`}
                className="hover:text-indigo-600 transition-colors"
              >
                {product.category?.categoryName || "Danh mục"}
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-indigo-600 font-medium">{product.productName}</span>
            </li>
          </ul>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-xl shadow-lg p-8">
          {/* Image Section */}
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-3 mt-6">
              {product.images.slice(0, 4).map((img) => (
                <div
                  key={img.imageID}
                  className={`relative w-20 h-20 cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === `http://localhost:8080/images/${img.imageName}`
                      ? "border-indigo-500"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  onClick={() => handleImageClick(img.imageName)}
                >
                  <Image
                    src={`http://localhost:8080/images/${img.imageName}`}
                    alt={`Thumbnail ${img.imageID}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-gray-50 group border-2 border-gray-300">
              <Image
                src={selectedImage}
                alt={product.productName}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{product.productName}</h1>
            <p className="text-gray-600 leading-relaxed">
              {product.productDescription || "Không có mô tả chi tiết cho sản phẩm này."}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Tình trạng:</span>
              <span className={`text-sm font-medium ${product.unitsInStock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.unitsInStock > 0 ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>
            <div className="text-3xl font-bold text-indigo-600">
              {product.unitPrice.toLocaleString()} VND
            </div>
            <div className="space-y-2">
              <div>
                <Label className="text-gray-700 font-medium">Số lượng tồn kho:</Label>
                <span className="ml-2 text-gray-900">{product.unitsInStock}</span>
              </div>
              <div>
                <Label className="text-gray-700 font-medium">Đơn vị:</Label>
                <span className="ml-2 text-gray-900">{product.quantityPerUnit || "Không xác định"}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Số lượng:</span>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-6 py-2 text-gray-900 font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.unitsInStock}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-all duration-200"
                disabled={product.unitsInStock === 0}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                onClick={() => router.push("/user")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition-all duration-200"
              >
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Xác nhận thêm vào giỏ hàng</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative w-40 h-40 rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt={product.productName}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-900">{product.productName}</p>
                <p className="text-indigo-600 font-bold">{product.unitPrice.toLocaleString()} VND</p>
                <p className="text-gray-600">Số lượng: {quantity}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors"
              >
                Hủy
              </Button>
              <Button
                onClick={confirmAddToCart}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
    
  );
}