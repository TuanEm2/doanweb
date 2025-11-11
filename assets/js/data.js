const products = [
  {
    id: 1,
    name: "Cayo Chore Jacket Navy",
    category: "Jacket",
    size: [
      { name: "M", quantity: 15 },
      { name: "L", quantity: 10 },
      { name: "XL", quantity: 5 },
      { name: "XXL", quantity: 8 },
    ],
    price: 7650000,
    image: "assets/images/jackets/Cayo Chore Jacket Navy.png",
    isHidden: false,
  },

  {
    id: 2,
    name: "Cayo Chore Jacket Beige",
    category: "Jacket",
    size: [
      { name: "XS", quantity: 20 },
      { name: "S", quantity: 12 },
      { name: "M", quantity: 7 },
    ],
    price: 7650000,
    image: "assets/images/jackets/Cayo Chore Jacket Beige.png",
    isHidden: false,
  },

  {
    id: 3,
    name: "Oaxaca Jacket Powder Blue",
    category: "Jacket",
    size: [
      { name: "M", quantity: 14 },
      { name: "L", quantity: 9 },
      { name: "XL", quantity: 4 },
    ],
    price: 8679000,
    image: "assets/images/jackets/Oaxaca Jacket Powder Blue.png",
    isHidden: false,
  },

  {
    id: 4,
    name: "Inigo Long Sleeve Ivory",
    category: "T-Shirt",
    size: [
      { name: "S", quantity: 25 },
      { name: "M", quantity: 18 },
      { name: "L", quantity: 11 },
      { name: "XL", quantity: 6 },
      { name: "XXL", quantity: 3 },
    ],
    price: 4119000,
    image: "assets/images/tshirts/Inigo Long Sleeve Ivory.png",
    isHidden: false,
  },

  {
    id: 5,
    name: "Inigo T-Shirt Chocolate Brown",
    category: "T-Shirt",
    size: [
      { name: "M", quantity: 17 },
      { name: "L", quantity: 13 },
      { name: "XL", quantity: 9 },
      { name: "XXL", quantity: 4 },
    ],
    price: 3531000,
    image: "assets/images/tshirts/Inigo T-Shirt Chocolate Brown.png",
    isHidden: false,
  },

  {
    id: 6,
    name: "Palmido T-Shirt Navy",
    category: "T-Shirt",
    size: [
      { name: "S", quantity: 30 },
      { name: "M", quantity: 22 },
      { name: "L", quantity: 15 },
    ],
    price: 2648000,
    image: "assets/images/tshirts/Palmido T-Shirt Navy.png",
    isHidden: false,
  },

  {
    id: 7,
    name: "Cotton Open Knit Quinn Polo Camel",
    category: "Polo",
    size: [
      { name: "M", quantity: 10 },
      { name: "L", quantity: 7 },
      { name: "XL", quantity: 5 },
      { name: "XXL", quantity: 2 },
    ],
    price: 3090000,
    image: "assets/images/polos/Cotton Open Knit Quinn Polo Camel.png",
    isHidden: false,
  },

  {
    id: 8,
    name: "Cotton Open Knit Quinn Polo Navy",
    category: "Polo",
    size: [
      { name: "S", quantity: 15 },
      { name: "M", quantity: 11 },
      { name: "L", quantity: 8 },
    ],
    price: 3090000,
    image: "assets/images/polos/Cotton Open Knit Quinn Polo Navy.png",
    isHidden: false,
  },

  {
    id: 9,
    name: "Cotton Open Knit Quinn Polo Powder Blue",
    category: "Polo",
    size: [
      { name: "XS", quantity: 22 },
      { name: "S", quantity: 16 },
      { name: "M", quantity: 10 },
      { name: "L", quantity: 5 },
    ],
    price: 3090000,
    image: "assets/images/polos/Cotton Open Knit Quinn Polo Powder Blue.png",
    isHidden: false,
  },

  {
    id: 10,
    name: "Cotton Open Knit Quinn Polo White",
    category: "Polo",
    size: [
      { name: "S", quantity: 20 },
      { name: "M", quantity: 14 },
      { name: "L", quantity: 9 },
      { name: "XL", quantity: 4 },
      { name: "XXL", quantity: 1 },
    ],
    price: 3090000,
    image: "assets/images/polos/Cotton Open Knit Quinn Polo White.png",
    isHidden: false,
  },

  {
    id: 11,
    name: "Lazarus Long Sleeve Polo Chocolate Brown",
    category: "Polo",
    size: [
      { name: "M", quantity: 12 },
      { name: "L", quantity: 8 },
      { name: "XL", quantity: 4 },
    ],
    price: 4119000,
    image: "assets/images/polos/Lazarus Long Sleeve Polo Chocolate Brown.png",
    isHidden: false,
  },

  {
    id: 12,
    name: "Long Sleeved Silk Blend Trogon Polo Black",
    category: "Polo",
    size: [
      { name: "M", quantity: 15 },
      { name: "L", quantity: 10 },
      { name: "XL", quantity: 5 },
      { name: "XXL", quantity: 3 },
    ],
    price: 4413000,
    image: "assets/images/polos/Long Sleeved Silk Blend Trogon Polo Black.png",
    isHidden: false,
  },

  {
    id: 13,
    name: "Melia Silk Blend Knitted Polo Black",
    category: "Polo",
    size: [
      { name: "S", quantity: 18 },
      { name: "M", quantity: 12 },
      { name: "L", quantity: 7 },
    ],
    price: 5296000,
    image: "assets/images/polos/Melia Silk Blend Knitted Polo Black.png",
    isHidden: false,
  },

  {
    id: 14,
    name: "Santiago Quinn Cotton Open Knit Polo Navy",
    category: "Polo",
    size: [
      { name: "M", quantity: 11 },
      { name: "L", quantity: 6 },
      { name: "XL", quantity: 3 },
      { name: "XXL", quantity: 1 },
    ],
    price: 3237000,
    image: "assets/images/polos/Santiago Quinn Cotton Open Knit Polo Navy.png",
    isHidden: false,
  },

  {
    id: 15,
    name: "Sporty Zip Boucle Knit Polo Beige",
    category: "Polo",
    size: [
      { name: "XS", quantity: 24 },
      { name: "S", quantity: 16 },
      { name: "M", quantity: 10 },
      { name: "L", quantity: 5 },
    ],
    price: 3825000,
    image: "assets/images/polos/Sporty Zip Boucle Knit Polo Beige.png",
    isHidden: false,
  },

  {
    id: 16,
    name: "Swirl Geo Quinn Polo Khaki",
    category: "Polo",
    size: [
      { name: "M", quantity: 13 },
      { name: "L", quantity: 8 },
      { name: "XL", quantity: 4 },
    ],
    price: 3678000,
    image: "assets/images/polos/Swirl Geo Quinn Polo Khaki.png",
    isHidden: false,
  },

  {
    id: 17,
    name: "Alvaro Knitted Shirt Khaki",
    category: "Shirt",
    size: [
      { name: "M", quantity: 16 },
      { name: "L", quantity: 11 },
      { name: "XL", quantity: 6 },
      { name: "XXL", quantity: 3 },
    ],
    price: 4119000,
    image: "assets/images/shirts/Alvaro Knitted Shirt Khaki.png",
    isHidden: false,
  },

  {
    id: 18,
    name: "Checkerboard Knit Shirt Pine Green",
    category: "Shirt",
    size: [
      { name: "S", quantity: 20 },
      { name: "M", quantity: 14 },
      { name: "L", quantity: 9 },
    ],
    price: 3825000,
    image: "assets/images/shirts/Checkerboard Knit Shirt Pine Green.png",
    isHidden: false,
  },

  {
    id: 19,
    name: "Checkerboard Knit Shirt White",
    category: "Shirt",
    size: [
      { name: "XS", quantity: 25 },
      { name: "S", quantity: 17 },
      { name: "M", quantity: 11 },
      { name: "L", quantity: 6 },
    ],
    price: 3825000,
    image: "assets/images/shirts/Checkerboard Knit Shirt White.png",
    isHidden: false,
  },

  {
    id: 20,
    name: "Ecovero Vicose Valbonne Shirt Ivory Powder Blue",
    category: "Shirt",
    size: [
      { name: "M", quantity: 15 },
      { name: "L", quantity: 10 },
      { name: "XL", quantity: 5 },
    ],
    price: 4413000,
    image: "assets/images/shirts/Ecovero Vicose Valbonne Shirt Ivory Powder Blue.png",
    isHidden: false,
  },

  {
    id: 21,
    name: "Ecovero Vicose Valbonne Shirt Ivory",
    category: "Shirt",
    size: [
      { name: "M", quantity: 18 },
      { name: "L", quantity: 12 },
      { name: "XL", quantity: 7 },
      { name: "XXL", quantity: 4 },
    ],
    price: 4413000,
    image: "assets/images/shirts/Ecovero Vicose Valbonne Shirt Ivory.png",
    isHidden: false,
  },

  {
    id: 22,
    name: "Ecovero Vicose Valbonne Shirt Navy",
    category: "Shirt",
    size: [
      { name: "S", quantity: 22 },
      { name: "M", quantity: 15 },
      { name: "L", quantity: 9 },
    ],
    price: 4413000,
    image: "assets/images/shirts/Ecovero Vicose Valbonne Shirt Navy.png",
    isHidden: false,
  },

  {
    id: 23,
    name: "Jorge Vicose Knit Polo Shirt Chocolate Brown",
    category: "Shirt",
    size: [
      { name: "XS", quantity: 28 },
      { name: "S", quantity: 20 },
      { name: "M", quantity: 13 },
      { name: "L", quantity: 7 },
    ],
    price: 3237000,
    image: "assets/images/shirts/Jorge Vicose Knit Polo Shirt Chocolate Brown.png",
    isHidden: false,
  },

  {
    id: 24,
    name: "Jorge Vicose Knit Polo Shirt Ivory",
    category: "Shirt",
    size: [
      { name: "M", quantity: 19 },
      { name: "L", quantity: 12 },
      { name: "XL", quantity: 6 },
    ],
    price: 3237000,
    image: "assets/images/shirts/Jorge Vicose Knit Polo Shirt Ivory.png",
    isHidden: false,
  },

  {
    id: 25,
    name: "Jorge Vicose Knit Polo Shirt Navy",
    category: "Shirt",
    size: [
      { name: "M", quantity: 17 },
      { name: "L", quantity: 11 },
      { name: "XL", quantity: 5 },
      { name: "XXL", quantity: 2 },
    ],
    price: 3237000,
    image: "assets/images/shirts/Jorge Vicose Knit Polo Shirt Navy.png",
    isHidden: false,
  },

  {
    id: 26,
    name: "Linen Shirt Navy",
    category: "Shirt",
    size: [
      { name: "S", quantity: 24 },
      { name: "M", quantity: 16 },
      { name: "L", quantity: 10 },
    ],
    price: 4119000,
    image: "assets/images/shirts/Linen Shirt Navy.png",
    isHidden: false,
  },

  {
    id: 27,
    name: "Linen Shirt Oat",
    category: "Shirt",
    size: [
      { name: "XS", quantity: 30 },
      { name: "S", quantity: 21 },
      { name: "M", quantity: 14 },
      { name: "L", quantity: 8 },
    ],
    price: 4119000,
    image: "assets/images/shirts/Linen Shirt Oat.png",
    isHidden: false,
  },

  {
    id: 28,
    name: "Linen Shirt White",
    category: "Shirt",
    size: [
      { name: "M", quantity: 20 },
      { name: "L", quantity: 13 },
      { name: "XL", quantity: 7 },
    ],
    price: 4119000,
    image: "assets/images/shirts/Linen Shirt White.png",
    isHidden: false,
  },

  {
    id: 29,
    name: "Linen Shirt Powder Blue",
    category: "Shirt",
    size: [
      { name: "M", quantity: 16 },
      { name: "L", quantity: 10 },
      { name: "XL", quantity: 5 },
      { name: "XXL", quantity: 2 },
    ],
    price: 4119000,
    image: "assets/images/shirts/Linen Shirt Powder Blue.png",
    isHidden: false,
  },

  {
    id: 30,
    name: "Linen Shirt Sage",
    category: "Shirt",
    size: [
      { name: "S", quantity: 26 },
      { name: "M", quantity: 18 },
      { name: "L", quantity: 11 },
    ],
    price: 4119000,
    image: "assets/images/shirts/Linen Shirt Sage.png",
    isHidden: false,
  },

  {
    id: 31,
    name: "Moneto Print Long Sleeve Shirt Khaki",
    category: "Shirt",
    size: [
      { name: "XS", quantity: 20 },
      { name: "S", quantity: 15 },
      { name: "M", quantity: 10 },
      { name: "L", quantity: 5 },
    ],
    price: 4413000,
    image: "assets/images/shirts/Moneto Print Long Sleeve Shirt Khaki.png",
    isHidden: false,
  },

  {
    id: 32,
    name: "Moneto Print Long Sleeve Shirt Navy",
    category: "Shirt",
    size: [
      { name: "M", quantity: 14 },
      { name: "L", quantity: 8 },
      { name: "XL", quantity: 3 },
    ],
    price: 4413000,
    image: "assets/images/shirts/Moneto Print Long Sleeve Shirt Navy.png",
    isHidden: false,
  },

  {
    id: 33,
    name: "Tencel Shirt Khaki",
    category: "Shirt",
    size: [
      { name: "M", quantity: 18 },
      { name: "L", quantity: 12 },
      { name: "XL", quantity: 6 },
      { name: "XXL", quantity: 3 },
    ],
    price: 3825000,
    image: "assets/images/shirts/Tencel Shirt Khaki.png",
    isHidden: false,
  },

  {
    id: 34,
    name: "Tencel Shirt Navy",
    category: "Shirt",
    size: [
      { name: "S", quantity: 23 },
      { name: "M", quantity: 15 },
      { name: "L", quantity: 9 },
    ],
    price: 3825000,
    image: "assets/images/shirts/Tencel Shirt Navy.png",
    isHidden: false,
  },

  {
    id: 35,
    name: "Tencel Shirt White",
    category: "Shirt",
    size: [
      { name: "XS", quantity: 27 },
      { name: "S", quantity: 19 },
      { name: "M", quantity: 12 },
      { name: "L", quantity: 6 },
    ],
    price: 3825000,
    image: "assets/images/shirts/Tencel Shirt White.png",
    isHidden: false,
  },

  {
    id: 36,
    name: "Valbonne Ecovero Signatrue Shirt Chocolate Brown",
    category: "Shirt",
    size: [
      { name: "M", quantity: 16 },
      { name: "L", quantity: 10 },
      { name: "XL", quantity: 1 },
    ],
    price: 4413000,
    image: "assets/images/shirts/Valbonne Ecovero Signatrue Shirt Chocolate Brown.png",
    isHidden: false,
  },

  {
    id: 37,
    name: "Valbonne Ecovero Signatrue Shirt Merlot",
    category: "Shirt",
    size: [
      { name: "M", quantity: 19 },
      { name: "L", quantity: 13 },
      { name: "XL", quantity: 7 },
      { name: "XXL", quantity: 2 },
    ],
    price: 4413000,
    image: "assets/images/shirts/Valbonne Ecovero Signature Shirt Merlot.png",
    isHidden: false,
  },
];


window.products = products;