const products = [
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

const WHATSAPP_NUMBER = "5571667676";
const ADMIN_PASSWORD = "tere123";
const ADMIN_SESSION_KEY = "dulceriaTereAdminSession";
const ADMIN_SESSION_DURATION = 1000 * 60 * 60 * 24 * 30;
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBqzOBAp2cbkblshwvTV0z-37Qcr4P5o7U",
  authDomain: "dulces-f2f8a.firebaseapp.com",
  databaseURL: "https://dulces-f2f8a-default-rtdb.firebaseio.com/",
  projectId: "dulces-f2f8a",
  storageBucket: "dulces-f2f8a.firebasestorage.app",
  messagingSenderId: "656690572778",
  appId: "1:656690572778:web:1482f1ee532c5edc421693"
};
const FIREBASE_PRODUCTS_PATH = "dulceriaTere/products";
const FIREBASE_PRODUCT_IMAGES_PATH = "dulceriaTere/product-images";
const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const productDefaults = products.map(product => ({ ...product, tags: [...product.tags] }));
let cloudDatabase = null;
let cloudStorage = null;

function readStoredArray(key) {
  try {
    const storedValue = JSON.parse(localStorage.getItem(key));
    return Array.isArray(storedValue) ? storedValue : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function readStoredObject(key) {
  try {
    const storedValue = JSON.parse(localStorage.getItem(key));
    return storedValue && typeof storedValue === "object" && !Array.isArray(storedValue) ? storedValue : {};
  } catch {
    localStorage.removeItem(key);
    return {};
  }
}

function cleanProduct(product, fallbackId) {
  return {
    id: Number(product.id) || fallbackId,
    name: String(product.name || "Nuevo producto").trim(),
    category: String(product.category || "Dulces").trim(),
    price: Math.max(0, Number(product.price) || 0),
    description: String(product.description || "Producto de Dulceria Tere.").trim(),
    image: String(product.image || "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=900&q=80").trim(),
    tags: Array.isArray(product.tags) ? product.tags.map(tag => String(tag).trim()).filter(Boolean) : [],
    stock: Math.max(0, Math.floor(Number(product.stock) || 0))
  };
}

function applyStoredCatalog() {
  const storedProducts = readStoredArray("dulceriaTereProducts");
  if (!storedProducts.length) return;
  products.splice(0, products.length, ...storedProducts.map((product, index) => cleanProduct(product, index + 1)));
}

function isFirebaseConfigured() {
  return Boolean(
    window.firebase &&
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.databaseURL &&
    FIREBASE_CONFIG.projectId
  );
}

async function connectCloudCatalog() {
  if (!isFirebaseConfigured()) return false;

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    cloudDatabase = firebase.database();
    cloudStorage = firebase.storage ? firebase.storage() : null;
    return true;
  } catch (error) {
    console.warn("No se pudo conectar Firebase.", error);
    cloudDatabase = null;
    cloudStorage = null;
    return false;
  }
}

async function loadCloudCatalog() {
  const connected = await connectCloudCatalog();
  if (!connected) {
    applyStoredCatalog();
    return;
  }

  try {
    const snapshot = await cloudDatabase.ref(FIREBASE_PRODUCTS_PATH).get();
    if (snapshot.exists()) {
      const cloudProducts = snapshot.val();
      if (Array.isArray(cloudProducts) && cloudProducts.length) {
        products.splice(0, products.length, ...cloudProducts.map((product, index) => cleanProduct(product, index + 1)));
        rememberProductsLocally();
      }
      return;
    }

    await cloudDatabase.ref(FIREBASE_PRODUCTS_PATH).set(productDefaults);
  } catch (error) {
    console.warn("No se pudo cargar el catalogo en la nube.", error);
    applyStoredCatalog();
  }
}

async function saveCloudCatalog() {
  rememberProductsLocally();

  if (!cloudDatabase) return;

  await cloudDatabase.ref(FIREBASE_PRODUCTS_PATH).set(products);
}

function rememberProductsLocally() {
  try {
    localStorage.setItem("dulceriaTereProducts", JSON.stringify(products));
    localStorage.removeItem("dulceriaTereProductOverrides");
  } catch (error) {
    console.warn("No se pudo guardar una copia local del catalogo.", error);
  }
}

const state = {
  category: "Todos",
  query: "",
  cart: readStoredArray("dulceriaTereCart"),
  favorites: readStoredArray("dulceriaTereFavorites"),
  selectedProduct: null
};

const elements = {
  body: document.body,
  productGrid: document.querySelector("#productGrid"),
  categoryTabs: document.querySelector("#categoryTabs"),
  searchInput: document.querySelector("#searchInput"),
  resultsText: document.querySelector("#resultsText"),
  favoriteCount: document.querySelector("#favoriteCount"),
  stockCount: document.querySelector("#stockCount"),
  cartDrawer: document.querySelector("#cartDrawer"),
  cartToggle: document.querySelector("#cartToggle"),
  closeCart: document.querySelector("#closeCart"),
  cartItems: document.querySelector("#cartItems"),
  cartTotal: document.querySelector("#cartTotal"),
  cartCount: document.querySelector("#cartCount"),
  clearCart: document.querySelector("#clearCart"),
  whatsappOrder: document.querySelector("#whatsappOrder"),
  themeToggle: document.querySelector("#themeToggle"),
  openBestSellers: document.querySelector("#openBestSellers"),
  brandMark: document.querySelector(".brand-mark"),
  modal: document.querySelector("#productModal"),
  closeModal: document.querySelector("#closeModal"),
  modalImageWrap: document.querySelector("#modalImageWrap"),
  modalImage: document.querySelector("#modalImage"),
  modalCategory: document.querySelector("#modalCategory"),
  modalTitle: document.querySelector("#modalTitle"),
  modalDescription: document.querySelector("#modalDescription"),
  modalTags: document.querySelector("#modalTags"),
  modalPrice: document.querySelector("#modalPrice"),
  modalAddCart: document.querySelector("#modalAddCart"),
  modalFavorite: document.querySelector("#modalFavorite"),
  managerModal: document.querySelector("#managerModal"),
  closeManager: document.querySelector("#closeManager"),
  managerList: document.querySelector("#managerList"),
  addProduct: document.querySelector("#addProduct"),
  saveProducts: document.querySelector("#saveProducts"),
  resetProducts: document.querySelector("#resetProducts")
};

function saveState() {
  localStorage.setItem("dulceriaTereCart", JSON.stringify(state.cart));
  localStorage.setItem("dulceriaTereFavorites", JSON.stringify(state.favorites));
}

function getCategories() {
  return ["Todos", ...new Set(products.map(product => product.category))];
}

function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getFilteredProducts() {
  const query = normalizeText(state.query);
  return products.filter(product => {
    const matchesCategory = state.category === "Todos" || product.category === state.category;
    const searchable = normalizeText(`${product.name} ${product.category} ${product.description} ${product.tags.join(" ")}`);
    return matchesCategory && searchable.includes(query);
  });
}

function createTag(tag) {
  const className = tag === "Oferta" ? "tag offer" : "tag";
  return `<span class="${className}">${tag}</span>`;
}

function renderCategories() {
  elements.categoryTabs.innerHTML = getCategories().map(category => `
    <button class="category-tab ${state.category === category ? "active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();
  elements.resultsText.textContent = filteredProducts.length
    ? `${filteredProducts.length} producto${filteredProducts.length === 1 ? "" : "s"} listo${filteredProducts.length === 1 ? "" : "s"} para agregar.`
    : "No encontramos productos con esos filtros.";
  elements.stockCount.textContent = filteredProducts.reduce((total, product) => total + product.stock, 0);
  elements.favoriteCount.textContent = state.favorites.length;

  if (!filteredProducts.length) {
    elements.productGrid.innerHTML = `
      <article class="empty-state glass">
        <h3>Sin resultados</h3>
        <p>Prueba con otra categoria o una busqueda mas corta.</p>
      </article>
    `;
    return;
  }

  elements.productGrid.innerHTML = filteredProducts.map(product => {
    const isFavorite = state.favorites.includes(product.id);
    const cartItem = state.cart.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    return `
      <article class="product-card glass">
        <div class="product-image">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
          ${quantityInCart ? `<span class="product-cart-badge">En carrito: ${quantityInCart}</span>` : ""}
          <button class="favorite-button ${isFavorite ? "active" : ""}" type="button" data-favorite="${product.id}" aria-label="${isFavorite ? "Quitar" : "Agregar"} ${product.name} ${isFavorite ? "de" : "a"} favoritos" aria-pressed="${isFavorite}">
            &hearts;
          </button>
        </div>
        <div class="product-info">
          <div class="tag-list">${product.tags.map(createTag).join("")}</div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="price-row">
            <span class="price">${currency.format(product.price)}</span>
            <small>${product.stock} en stock</small>
          </div>
          <div class="card-actions">
            <button class="secondary-button details-button" type="button" data-details="${product.id}">Detalles</button>
            <button class="primary-button" type="button" data-cart="${product.id}">
              ${quantityInCart ? `Agregar (${quantityInCart})` : "Agregar"}
            </button>
          </div>
          ${quantityInCart ? `
            <div class="product-cart-controls" aria-label="Cantidad en carrito">
              <strong>${quantityInCart}</strong>
              <button type="button" data-cart="${product.id}" aria-label="Agregar una unidad de ${escapeHtml(product.name)}">+</button>
              <button class="product-remove-button" type="button" data-card-decrease="${product.id}" aria-label="Quitar una unidad de ${escapeHtml(product.name)}">-</button>
            </div>
          ` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function renderCart() {
  const totalItems = state.cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = state.cart.reduce((total, item) => {
    const product = products.find(current => current.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  elements.cartCount.textContent = totalItems;
  elements.cartTotal.textContent = currency.format(totalPrice);
  elements.cartToggle.classList.toggle("has-items", totalItems > 0);

  if (!state.cart.length) {
    elements.cartItems.innerHTML = `
      <div class="empty-state">
        <h3>Carrito vacio</h3>
        <p>Agrega tus dulces favoritos y arma tu pedido.</p>
      </div>
    `;
    return;
  }

  elements.cartItems.innerHTML = state.cart.map(item => {
    const product = products.find(current => current.id === item.id);
    if (!product) return "";
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <p>${currency.format(product.price)} c/u</p>
          <div class="quantity-row">
            <button type="button" data-decrease="${product.id}" aria-label="Disminuir cantidad">-</button>
            <strong>${item.quantity}</strong>
            <button type="button" data-increase="${product.id}" aria-label="Aumentar cantidad">+</button>
            <button class="remove-item" type="button" data-remove="${product.id}">Quitar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function addToCart(productId) {
  const product = products.find(current => current.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, product.stock);
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }

  saveState();
  renderCart();
  renderProducts();
  notifyCartUpdate();
}

function changeQuantity(productId, amount) {
  const product = products.find(current => current.id === productId);
  const item = state.cart.find(current => current.id === productId);
  if (!product || !item) return;

  item.quantity += amount;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(current => current.id !== productId);
  } else {
    item.quantity = Math.min(item.quantity, product.stock);
  }

  saveState();
  renderCart();
  renderProducts();
}

function toggleFavorite(productId) {
  const isFavorite = state.favorites.includes(productId);
  state.favorites = isFavorite
    ? state.favorites.filter(id => id !== productId)
    : [...state.favorites, productId];
  saveState();
  renderProducts();
  updateModalFavorite();
}

function openCart() {
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
}

function openModal(productId) {
  const product = products.find(current => current.id === productId);
  if (!product) return;

  state.selectedProduct = product;
  elements.modalImage.src = product.image;
  elements.modalImage.alt = product.name;
  elements.modalCategory.textContent = product.category;
  elements.modalTitle.textContent = product.name;
  elements.modalDescription.textContent = product.description;
  elements.modalTags.innerHTML = product.tags.map(createTag).join("");
  elements.modalPrice.textContent = currency.format(product.price);
  updateModalFavorite();
  elements.modal.classList.add("open");
  elements.modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  elements.modal.classList.remove("open");
  elements.modal.setAttribute("aria-hidden", "true");
  elements.modalImage.style.transform = "scale(1)";
  state.selectedProduct = null;
}

function updateModalFavorite() {
  if (!state.selectedProduct) return;
  const isFavorite = state.favorites.includes(state.selectedProduct.id);
  elements.modalFavorite.textContent = isFavorite ? "Quitar favorito" : "Favorito";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}

function tagsToText(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

function textToTags(text) {
  return text.split(",").map(tag => tag.trim()).filter(Boolean);
}

function getNextProductId() {
  return Math.max(0, ...products.map(product => Number(product.id) || 0)) + 1;
}

function renderManager() {
  elements.managerList.innerHTML = products.map(product => `
    <article class="manager-row" data-manager-row="${product.id}">
      <div class="manager-product-heading">
        <img src="${escapeHtml(product.image)}" alt="">
        <div>
          <strong>${escapeHtml(product.name)}</strong>
          <small>${escapeHtml(product.category)}</small>
        </div>
      </div>
      <label>
        Nombre
        <input type="text" value="${escapeHtml(product.name)}" data-manager-field="name">
      </label>
      <label>
        Categoria
        <input type="text" value="${escapeHtml(product.category)}" data-manager-field="category">
      </label>
      <label>
        Precio
        <input type="number" min="0" step="1" value="${product.price}" data-manager-field="price">
      </label>
      <label>
        Stock
        <input type="number" min="0" step="1" value="${product.stock}" data-manager-field="stock">
      </label>
      <label class="manager-wide">
        Descripcion
        <textarea rows="2" data-manager-field="description">${escapeHtml(product.description)}</textarea>
      </label>
      <label class="manager-wide">
        Imagen
        <input type="text" value="${escapeHtml(product.image)}" data-manager-field="image">
      </label>
      <label>
        Subir imagen
        <input type="file" accept="image/*" data-manager-file="${product.id}">
      </label>
      <label>
        Etiquetas
        <input type="text" value="${escapeHtml(tagsToText(product.tags))}" data-manager-field="tags" placeholder="Nuevo, Oferta">
      </label>
      <button class="secondary-button manager-remove" type="button" data-manager-remove="${product.id}">Quitar</button>
    </article>
  `).join("");
}

function openManager() {
  renderManager();
  elements.managerModal.classList.add("open");
  elements.managerModal.setAttribute("aria-hidden", "false");
}

function rememberAdminSession() {
  localStorage.setItem(ADMIN_SESSION_KEY, String(Date.now() + ADMIN_SESSION_DURATION));
}

function hasAdminSession() {
  const expiresAt = Number(localStorage.getItem(ADMIN_SESSION_KEY));
  if (expiresAt > Date.now()) return true;

  localStorage.removeItem(ADMIN_SESSION_KEY);
  return false;
}

function requestManagerAccess() {
  if (hasAdminSession()) {
    openManager();
    return;
  }

  const password = window.prompt("Contraseña de administrador:");
  if (password === null) return;

  if (password === ADMIN_PASSWORD) {
    rememberAdminSession();
    openManager();
    return;
  }

  alert("Contraseña incorrecta.");
}

function closeManager() {
  elements.managerModal.classList.remove("open");
  elements.managerModal.setAttribute("aria-hidden", "true");
}

async function saveProductChanges() {
  elements.saveProducts.disabled = true;
  elements.saveProducts.textContent = cloudDatabase ? "Guardando en nube..." : "Guardando...";

  const updatedProducts = [...elements.managerList.querySelectorAll("[data-manager-row]")].map((row, index) => {
    const id = Number(row.dataset.managerRow) || index + 1;
    const readField = field => row.querySelector(`[data-manager-field="${field}"]`)?.value || "";
    return cleanProduct({
      id,
      name: readField("name"),
      category: readField("category"),
      price: readField("price"),
      stock: readField("stock"),
      description: readField("description"),
      image: readField("image"),
      tags: textToTags(readField("tags"))
    }, id);
  });

  products.splice(0, products.length, ...updatedProducts);
  try {
    await saveCloudCatalog();
  } catch (error) {
    console.warn("No se pudieron guardar los cambios.", error);
    alert("No se pudieron guardar los cambios. Si acabas de subir una imagen, revisa que Firebase Storage este activo y permita subir archivos.");
    elements.saveProducts.disabled = false;
    elements.saveProducts.textContent = "Guardar cambios";
    return;
  }

  if (state.category !== "Todos" && !products.some(product => product.category === state.category)) {
    state.category = "Todos";
  }

  state.cart = state.cart.filter(item => products.some(product => product.id === item.id));
  state.favorites = state.favorites.filter(id => products.some(product => product.id === id));
  saveState();
  renderCategories();
  renderProducts();
  renderCart();
  closeManager();
  elements.saveProducts.disabled = false;
  elements.saveProducts.textContent = "Guardar cambios";
}

async function resetProductChanges() {
  products.splice(0, products.length, ...productDefaults.map(product => ({ ...product, tags: [...product.tags] })));

  try {
    await saveCloudCatalog();
  } catch {
    localStorage.removeItem("dulceriaTereProductOverrides");
    localStorage.removeItem("dulceriaTereProducts");
  }

  state.cart = state.cart.filter(item => products.some(product => product.id === item.id));
  state.favorites = state.favorites.filter(id => products.some(product => product.id === id));
  saveState();
  renderCategories();
  renderProducts();
  renderCart();
  renderManager();
}

function addManagerProduct() {
  products.push({
    id: getNextProductId(),
    name: "Nuevo producto",
    category: "Dulces",
    price: 0,
    description: "Descripcion del producto.",
    image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=900&q=80",
    tags: ["Nuevo"],
    stock: 0
  });
  renderManager();
}

async function updateManagerImage(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  const row = input.closest("[data-manager-row]");
  const imageField = row.querySelector('[data-manager-field="image"]');
  const previewImage = row.querySelector(".manager-product-heading img");
  input.disabled = true;

  try {
    const compressed = await compressImage(file);

    console.log("Original:", (file.size / 1024 / 1024).toFixed(2), "MB");
    console.log("Comprimida:", (compressed.length * 3 / 4 / 1024).toFixed(0), "KB");

    imageField.value = compressed;
    previewImage.src = compressed;

    if (!cloudStorage) return;

    try {
      const imageUrl = await uploadProductImage(compressed, file.name);
      imageField.value = imageUrl;
      previewImage.src = imageUrl;
    } catch (uploadError) {
      console.warn("No se pudo subir la imagen a Firebase Storage. Se usara la copia comprimida.", uploadError);
      alert("La imagen ya se puso como vista previa, pero no se pudo subir a Firebase Storage. Puedes guardar, aunque conviene revisar Firebase Storage.");
    }
  } catch (error) {
    console.warn("No se pudo procesar la imagen.", error);
    alert("No se pudo procesar la imagen. Prueba con otra foto en formato JPG o PNG.");
  } finally {
    input.disabled = false;
    input.value = "";
  }
}

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

async function uploadProductImage(dataUrl, fileName) {
  const safeName = String(fileName || "producto.jpg")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const storageName = `${Date.now()}-${safeName || "producto.jpg"}`;
  const imageReference = cloudStorage.ref(`${FIREBASE_PRODUCT_IMAGES_PATH}/${storageName}`);
  const snapshot = await imageReference.put(dataUrlToBlob(dataUrl), { contentType: "image/jpeg" });

  return snapshot.ref.getDownloadURL();
}

function notifyCartUpdate() {
  elements.cartToggle.classList.remove("cart-bump");
  void elements.cartToggle.offsetWidth;
  elements.cartToggle.classList.add("cart-bump");
}

function buildWhatsappMessage() {
  const lines = state.cart.map(item => {
    const product = products.find(current => current.id === item.id);
    if (!product) return "";
    const subtotal = product.price * item.quantity;
    return `- ${product.name}
  Cantidad: ${item.quantity}
  Subtotal: ${currency.format(subtotal)}`;
  }).filter(Boolean);

  const total = state.cart.reduce((sum, item) => {
    const product = products.find(current => current.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const message = [
    "Hola Dulcería Tere, quiero hacer este pedido:",
    "",
    lines.join("\n\n"),
    "",
    `Total estimado: ${currency.format(total)}`,
    "",
    "Mis datos:",
    "Nombre:",
    "Direccion o punto de entrega:",
    "Comentarios:"
  ].join("\n");

  return encodeURIComponent(message);
}

function sendWhatsappOrder() {
  if (!state.cart.length) {
    openCart();
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsappMessage()}`, "_blank");
}

function applyThemeFromStorage() {
  const savedTheme = localStorage.getItem("dulceriaTereTheme");
  if (savedTheme === "dark") {
    elements.body.classList.add("dark");
  }
}

function toggleTheme() {
  elements.body.classList.toggle("dark");
  localStorage.setItem("dulceriaTereTheme", elements.body.classList.contains("dark") ? "dark" : "light");
}

function initParticles() {
  const canvas = document.querySelector("#particles");
  const context = canvas.getContext("2d");
  const colors = ["#ff4fa3", "#18d4cf", "#ffffff"];
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    particles = Array.from({ length: Math.min(80, Math.floor(window.innerWidth / 16)) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 2.5 + 0.8,
      speed: Math.random() * 0.35 + 0.12,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  function draw() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(particle => {
      particle.y -= particle.speed;
      if (particle.y < -10) {
        particle.y = window.innerHeight + 10;
        particle.x = Math.random() * window.innerWidth;
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = particle.color;
      context.globalAlpha = 0.35;
      context.fill();
    });
    context.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

function bindEvents() {
  document.querySelector(".search-box").addEventListener("submit", event => {
    event.preventDefault();
  });

  elements.searchInput.addEventListener("input", event => {
    state.query = event.target.value;
    renderProducts();
  });

  elements.categoryTabs.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    renderCategories();
    renderProducts();
  });

  elements.productGrid.addEventListener("click", event => {
    const cartButton = event.target.closest("[data-cart]");
    const detailsButton = event.target.closest("[data-details]");
    const favoriteButton = event.target.closest("[data-favorite]");
    const cardDecreaseButton = event.target.closest("[data-card-decrease]");

    if (cartButton) addToCart(Number(cartButton.dataset.cart));
    if (detailsButton) openModal(Number(detailsButton.dataset.details));
    if (favoriteButton) toggleFavorite(Number(favoriteButton.dataset.favorite));
    if (cardDecreaseButton) changeQuantity(Number(cardDecreaseButton.dataset.cardDecrease), -1);
  });

  elements.cartItems.addEventListener("click", event => {
    const increase = event.target.closest("[data-increase]");
    const decrease = event.target.closest("[data-decrease]");
    const remove = event.target.closest("[data-remove]");

    if (increase) changeQuantity(Number(increase.dataset.increase), 1);
    if (decrease) changeQuantity(Number(decrease.dataset.decrease), -1);
    if (remove) {
      state.cart = state.cart.filter(item => item.id !== Number(remove.dataset.remove));
      saveState();
      renderCart();
      renderProducts();
    }
  });

  elements.cartToggle.addEventListener("click", openCart);
  elements.closeCart.addEventListener("click", closeCart);
  elements.clearCart.addEventListener("click", () => {
    state.cart = [];
    saveState();
    renderCart();
    renderProducts();
  });
  elements.whatsappOrder.addEventListener("click", sendWhatsappOrder);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.openBestSellers.addEventListener("click", () => {
    state.category = "Todos";
    state.query = "Mas vendido";
    elements.searchInput.value = "Mas vendido";
    renderCategories();
    renderProducts();
    document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
  });

  elements.closeModal.addEventListener("click", closeModal);
  elements.modalAddCart.addEventListener("click", () => {
    if (state.selectedProduct) addToCart(state.selectedProduct.id);
  });
  elements.modalFavorite.addEventListener("click", () => {
    if (state.selectedProduct) toggleFavorite(state.selectedProduct.id);
  });

  elements.cartDrawer.addEventListener("click", event => {
    if (event.target === elements.cartDrawer) closeCart();
  });
  elements.modal.addEventListener("click", event => {
    if (event.target === elements.modal) closeModal();
  });

  elements.modalImageWrap.addEventListener("mousemove", event => {
    const rect = elements.modalImageWrap.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    elements.modalImage.style.transformOrigin = `${x}% ${y}%`;
    elements.modalImage.style.transform = "scale(1.85)";
  });
  elements.modalImageWrap.addEventListener("mouseleave", () => {
    elements.modalImage.style.transform = "scale(1)";
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCart();
      closeModal();
      closeManager();
    }
  });

  elements.brandMark.addEventListener("click", event => {
    if (event.detail === 3) requestManagerAccess();
  });

  elements.closeManager.addEventListener("click", closeManager);
  elements.addProduct.addEventListener("click", addManagerProduct);
  elements.saveProducts.addEventListener("click", saveProductChanges);
  elements.resetProducts.addEventListener("click", resetProductChanges);
  elements.managerList.addEventListener("click", event => {
    const removeButton = event.target.closest("[data-manager-remove]");
    if (!removeButton) return;
    removeButton.closest("[data-manager-row]").remove();
  });
  elements.managerList.addEventListener("change", event => {
    const fileInput = event.target.closest("[data-manager-file]");
    if (fileInput) updateManagerImage(fileInput);
  });
  elements.managerList.addEventListener("input", event => {
    const imageField = event.target.closest('[data-manager-field="image"]');
    if (!imageField) return;

    const row = imageField.closest("[data-manager-row]");
    const previewImage = row.querySelector(".manager-product-heading img");
    previewImage.src = imageField.value.trim();
  });
  elements.managerModal.addEventListener("click", event => {
    if (event.target === elements.managerModal) closeManager();
  });
}

async function init() {
  await loadCloudCatalog();
  applyThemeFromStorage();
  renderCategories();
  renderProducts();
  renderCart();
  bindEvents();
  initParticles();
}

async function compressImage(file, maxWidth = 800, quality = 0.8) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = function (e) {

            const img = new Image();

            img.onload = function () {

                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {

                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;

                }

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", quality));

            };

            img.src = e.target.result;

        };

        reader.readAsDataURL(file);

    });

}

init();
