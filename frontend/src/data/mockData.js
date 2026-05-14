// FILE: src/data/mockData.js — 20 sản phẩm streetwear AvQ
// Ảnh: /images/products/... — đặt ảnh thật vào public/images/products/

export const CATEGORIES = [
  { category_id: 1, category_name: "Tops",        description: "Áo thun, áo graphic, oversized, acid-wash" },
  { category_id: 2, category_name: "Bottoms",     description: "Quần jean, denim cargo, wide-leg" },
  { category_id: 3, category_name: "Outerwear",   description: "Áo khoác zip-up, fleece, denim jacket" },
  { category_id: 4, category_name: "Sweatshirts", description: "Áo hoodie oversize, heavyweight, unisex" },
  { category_id: 5, category_name: "Accessories", description: "Mũ bucket, beanie, túi tote, vớ" },
];

export const SIZES = ["S", "M", "L", "XL"];

export const PRODUCTS = [
  // ── HOODIE ──
  {
    product_id: 1, product_name: "Heavyweight Washed Hoodie",
    product_description: "Fleece 400gsm enzyme-washed. Phom boxy siêu rộng. Túi kangaroo thêu logo AvQ. Màu xám khói vintage — mỗi áo một tông riêng.",
    base_price: 890000, color: "Washed Grey", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 18,
    image_url: "/images/products/hoodie-washed-grey.jpg",
    fallback_url: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    category_id: 1, created_by: 1,
  },
  {
    product_id: 2, product_name: "Distressed Graphic Hoodie",
    product_description: "Nền đen tuyền, in lụa lớn ở lưng với slogan tiếng Nhật. Cổ tay và lai raw-edge có chủ ý. Heavyweight 380gsm. Drop-shoulder.",
    base_price: 950000, color: "Dead Black", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 14,
    image_url: "/images/products/hoodie-distressed-black.jpg",
    fallback_url: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80",
    category_id: 1, created_by: 1,
  },
  {
    product_id: 3, product_name: "Patchwork Panel Hoodie",
    product_description: "Thân trước ghép 3 vải: denim wash, ripstop nylon, fleece. May thủ công. Limited batch — không tái sản xuất. Earth tone.",
    base_price: 1290000, color: "Earth Patchwork", sizes: ["M","L","XL"], size: "L", stock_quantity: 6,
    image_url: "/images/products/hoodie-patchwork.jpg",
    fallback_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    category_id: 1, created_by: 1,
  },
  {
    product_id: 4, product_name: "Acid Wash Pullover",
    product_description: "Cotton fleece xử lý acid-wash tại xưởng. Không có hai cái màu giống nhau. In chữ distorted ở ngực trái. Form boxy, tay rộng.",
    base_price: 820000, color: "Acid Blue/Black", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 11,
    image_url: "/images/products/hoodie-acid-wash.jpg",
    fallback_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    category_id: 1, created_by: 1,
  },
  // ── ZIP-UP ──
  {
    product_id: 5, product_name: "Fleece Zip-up Coach Jacket",
    product_description: "Fleece sherpa 2 mặt. Zip toàn thân YKK. Cổ đứng nhỏ, túi hộp có nắp. Coach jacket chuẩn 90s. Tone bone trắng ngà.",
    base_price: 1050000, color: "Bone White", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 9,
    image_url: "/images/products/zipup-fleece-bone.jpg",
    fallback_url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
    category_id: 2, created_by: 1,
  },
  {
    product_id: 6, product_name: "Tactical Zip-up Windbreaker",
    product_description: "Nylon ripstop nhẹ chống gió. Nhiều túi zip ẩn. Mũ liền dây rút. Techwear pha streetwear. Màu olive đậm.",
    base_price: 1190000, color: "Military Olive", sizes: ["S","M","L","XL"], size: "L", stock_quantity: 7,
    image_url: "/images/products/zipup-tactical-olive.jpg",
    fallback_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80",
    category_id: 2, created_by: 1,
  },
  {
    product_id: 7, product_name: "Oversized Denim Trucker",
    product_description: "Denim 12oz stonewash. Trucker jacket rộng thêm 2 size. Nút đồng vintage. Thêu logo nhỏ ở ngực. Layer tốt qua 3 mùa.",
    base_price: 1350000, color: "Mid Indigo", sizes: ["M","L","XL"], size: "L", stock_quantity: 8,
    image_url: "/images/products/zipup-denim-trucker.jpg",
    fallback_url: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80",
    category_id: 2, created_by: 1,
  },
  {
    product_id: 8, product_name: "Varsity Zip-up Bomber",
    product_description: "Wool blend thân chính, tay da PU. Varsity tối giản — không patch hoa lá. Cổ rib dày. Tone đen/đen.",
    base_price: 1580000, color: "All Black", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 5,
    image_url: "/images/products/zipup-varsity-black.jpg",
    fallback_url: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80",
    category_id: 2, created_by: 1,
  },
  // ── T-SHIRT ──
  {
    product_id: 9, product_name: "Boxy Heavyweight Graphic Tee",
    product_description: "Cotton combed 240gsm. In lụa lớn toàn lưng, artwork kiểu zine thủ công. Form boxy ngắn. Cổ tròn rib dày 2cm.",
    base_price: 520000, color: "Off White", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 25,
    image_url: "/images/products/tshirt-boxy-graphic-white.jpg",
    fallback_url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    category_id: 3, created_by: 1,
  },
  {
    product_id: 10, product_name: "Distressed Band Tee",
    product_description: "Vintage wash 3 lần trước xuất xưởng. Cổ áo phá form nhẹ. In artwork underground. Cotton 220gsm. Feel như áo cũ ngay lần đầu.",
    base_price: 490000, color: "Faded Black", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 20,
    image_url: "/images/products/tshirt-distressed-black.jpg",
    fallback_url: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&q=80",
    category_id: 3, created_by: 1,
  },
  {
    product_id: 11, product_name: "Long-line Drop Shoulder Tee",
    product_description: "Dài hơn áo thường 10cm. Tay drop-shoulder đổ xuống. Pima cotton 200gsm mềm. Phom layer tốt. In nhỏ ở ngực trái.",
    base_price: 560000, color: "Cement Grey", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 16,
    image_url: "/images/products/tshirt-longline-grey.jpg",
    fallback_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    category_id: 3, created_by: 1,
  },
  {
    product_id: 12, product_name: "Cutoff Sleeve Muscle Tee",
    product_description: "Tay áo cắt thô không viền. Cotton 220gsm. In lụa lớn ở lưng. Layer bên trong áo khoác mesh hoặc flannel.",
    base_price: 450000, color: "Raw White", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 22,
    image_url: "/images/products/tshirt-cutoff-white.jpg",
    fallback_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    category_id: 3, created_by: 1,
  },
  {
    product_id: 13, product_name: "Printed Longsleeve Tee",
    product_description: "In tràn từ ngực xuống ống tay. Cotton rib co giãn nhẹ. Tone đen / cream / rust — bộ 3 màu mùa này.",
    base_price: 590000, color: "Rust Orange", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 13,
    image_url: "/images/products/tshirt-longsleeve-rust.jpg",
    fallback_url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
    category_id: 3, created_by: 1,
  },
  // ── DENIM ──
  {
    product_id: 14, product_name: "Baggy Denim Carpenter Pants",
    product_description: "Denim 12oz ring-spun. Túi búa bên đùi thực dụng. Phom baggy straight. Lai rough-cut không viền. Mid-rise thoải mái.",
    base_price: 890000, color: "Light Wash", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 12,
    image_url: "/images/products/denim-carpenter-lightwash.jpg",
    fallback_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    category_id: 4, created_by: 1,
  },
  {
    product_id: 15, product_name: "Distressed Wide-Leg Jean",
    product_description: "Rách có chủ đích ở đầu gối. Ống rộng 36cm. Denim stonewash loang không đồng đều. Eo cao tôn dáng.",
    base_price: 820000, color: "Dark Ripped", sizes: ["S","M","L","XL"], size: "M", stock_quantity: 10,
    image_url: "/images/products/denim-widejean-ripped.jpg",
    fallback_url: "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&q=80",
    category_id: 4, created_by: 1,
  },
  {
    product_id: 16, product_name: "Denim Cargo Pant",
    product_description: "Denim + cargo — 6 túi gồm 2 túi hộp bên đùi. Relaxed fit không quá bó. Stretch denim 2 chiều. Màu indigo đậm.",
    base_price: 950000, color: "Deep Indigo", sizes: ["S","M","L","XL"], size: "L", stock_quantity: 9,
    image_url: "/images/products/denim-cargo-indigo.jpg",
    fallback_url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4549?w=600&q=80",
    category_id: 4, created_by: 1,
  },
  // ── ACCESSORIES ──
  {
    product_id: 17, product_name: "Unstructured Bucket Hat",
    product_description: "Cotton canvas 6-panel không khung. Vành xẹp tự nhiên. Thêu logo nhỏ. Dây điều chỉnh bên trong. Free size.",
    base_price: 320000, color: "Washed Black", sizes: ["M"], size: "M", stock_quantity: 30,
    image_url: "/images/products/acc-bucket-hat-black.jpg",
    fallback_url: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80",
    category_id: 5, created_by: 1,
  },
  {
    product_id: 18, product_name: "Ribbed Beanie",
    product_description: "Acrylic rib-knit dày. Đội gập đôi hoặc kéo dài xuống tai. Thêu chữ nhỏ. Không xù sau nhiều lần giặt. Free size.",
    base_price: 220000, color: "Heather Grey", sizes: ["M"], size: "M", stock_quantity: 35,
    image_url: "/images/products/acc-beanie-grey.jpg",
    fallback_url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&q=80",
    category_id: 5, created_by: 1,
  },
  {
    product_id: 19, product_name: "Canvas Tote Bag",
    product_description: "Canvas 12oz tự nhiên. Silk-screen artwork lớn mặt trước. Quai dài đeo vai/tay. Đáy gia cố. Rộng đủ A4 + hoodie.",
    base_price: 280000, color: "Natural Canvas", sizes: ["M"], size: "M", stock_quantity: 40,
    image_url: "/images/products/acc-tote-canvas.jpg",
    fallback_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    category_id: 5, created_by: 1,
  },
  {
    product_id: 20, product_name: "Logo Crew Socks (3-pack)",
    product_description: "Cotton/elastane blend. Cổ cao mid-calf. In logo dọc ống. Packed 3 đôi cùng màu. Free size.",
    base_price: 180000, color: "Black/White/Grey", sizes: ["M"], size: "M", stock_quantity: 50,
    image_url: "/images/products/acc-socks-3pack.jpg",
    fallback_url: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80",
    category_id: 5, created_by: 1,
  },
];

export const HERO_BANNERS = [
  {
    id: 1,
    headline: "Drop 01 — 2025",
    subline:  "Không theo trend. Tự tạo trend.",
    cta:      "Khám phá bộ sưu tập",
    cta_link: "/products",
    image_url: "/images/hero/hero-main.jpg",
    fallback_url: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1400&q=85",
  },
];

export const getProductById = (id) => PRODUCTS.find((p) => p.product_id === Number(id));
export const getProductsByCategory = (categoryId) => PRODUCTS.filter((p) => p.category_id === Number(categoryId));
export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
export const getImageUrl = (product) => product.fallback_url || product.image_url;
