export const productsData = [
  {
    id: 1,
    name: "Gomitas arcoiris",
    category: "Gomitas",
    price: 45,
    description: "Bolsa surtida con gomitas suaves, acidas y frutales para compartir.",
    image: "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=900&q=80",
    tags: ["Nuevo", "Mas vendido"],
    stock: 24
  },
  {
    id: 2,
    name: "Chocolates mixtos",
    category: "Chocolates",
    price: 89,
    description: "Seleccion cremosa de chocolates en mini piezas para mesa de dulces.",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=900&q=80",
    tags: ["Oferta"],
    stock: 18
  },
  {
    id: 3,
    name: "Paletas fiesta",
    category: "Paletas",
    price: 39,
    description: "Paquete de paletas coloridas ideal para fiestas, pinatas y regalos.",
    image: "https://images.unsplash.com/photo-1589712186148-03ec3182895f?auto=format&fit=crop&w=900&q=80",
    tags: ["Mas vendido"],
    stock: 35
  },
  {
    id: 4,
    name: "Botana enchilada",
    category: "Botanas",
    price: 52,
    description: "Crujiente mezcla enchilada con toque acidito y mucho sabor mexicano.",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80",
    tags: ["Nuevo"],
    stock: 20
  },
  {
    id: 5,
    name: "Mazapan artesanal",
    category: "Tradicionales",
    price: 32,
    description: "Dulce tradicional de cacahuate con textura suave y sabor casero.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
    tags: ["Oferta"],
    stock: 28
  },
  {
    id: 6,
    name: "Caja regalo dulce",
    category: "Regalos",
    price: 149,
    description: "Caja con dulces premium, chocolates y detalles lista para regalar.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=80",
    tags: ["Nuevo", "Oferta"],
    stock: 11
  },
  {
    id: 7,
    name: "Caramelos surtidos",
    category: "Caramelos",
    price: 29,
    description: "Caramelos frutales envueltos individualmente para negocio o evento.",
    image: "https://images.unsplash.com/photo-1575224526797-5730d09d781d?auto=format&fit=crop&w=900&q=80",
    tags: ["Mas vendido"],
    stock: 40
  },
  {
    id: 8,
    name: "Mesa dulce mini",
    category: "Regalos",
    price: 219,
    description: "Kit practico para montar una mesa dulce pequena con variedad premium.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=80",
    tags: ["Nuevo", "Mas vendido"],
    stock: 8
  }
];

export const WHATSAPP_NUMBER = "5571667676";
export const ADMIN_PASSWORD = "tere123";
export const ADMIN_SESSION_KEY = "dulceriaTereAdminSession";
export const ADMIN_SESSION_DURATION = 1000 * 60 * 60 * 24 * 30;
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBqzOBAp2cbkblshwvTV0z-37Qcr4P5o7U",
  authDomain: "dulces-f2f8a.firebaseapp.com",
  databaseURL: "https://dulces-f2f8a-default-rtdb.firebaseio.com/",
  projectId: "dulces-f2f8a",
  storageBucket: "dulces-f2f8a.firebasestorage.app",
  messagingSenderId: "656690572778",
  appId: "1:656690572778:web:1482f1ee532c5edc421693"
};
export const FIREBASE_PRODUCTS_PATH = "dulceriaTere/products";
export const FIREBASE_PRODUCT_IMAGES_PATH = "dulceriaTere/product-images";
export const FIREBASE_ORDERS_PATH = "dulceriaTere/orders";
export const CATALOG_CACHE_KEY = "dulceriaTereProducts";
export const LOCAL_ORDERS_KEY = "dulceriaTerePendingOrders";
export const CLOUD_REQUEST_TIMEOUT = 7000;
export const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
export const productDefaults = productsData.map(product => ({ ...product, tags: [...product.tags] }));