const elements = {
  menuGrid: document.getElementById("menu-grid"),
  cartItems: document.getElementById("cart-items"),
  billSubtotal: document.getElementById("bill-subtotal"),
  billTotal: document.getElementById("bill-total"),
  clearCart: document.getElementById("clear-cart"),
  printBill: document.getElementById("print-bill"),
  payNow: document.getElementById("pay-now"),
  menuSearch: document.getElementById("menu-search"),
  menuFilter: document.getElementById("menu-filter"),
  menuForm: document.getElementById("menu-form"),
  menuId: document.getElementById("menu-id"),
  menuName: document.getElementById("menu-name"),
  menuPrice: document.getElementById("menu-price"),
  menuCategory: document.getElementById("menu-category"),
  menuImage: document.getElementById("menu-image"),
  cancelEdit: document.getElementById("cancel-edit"),
  adminList: document.getElementById("menu-admin-list"),
  dailyReportBody: document.getElementById("daily-report-body"),
  monthlyReportBody: document.getElementById("monthly-report-body"),
  qrModal: document.getElementById("qr-modal"),
  closeModal: document.getElementById("close-modal"),
  confirmPayment: document.getElementById("confirm-payment"),
  year: document.getElementById("year"),
};

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const storageKeys = {
  menu: "spice-garden-menu",
  sales: "spice-garden-sales",
};

const defaultMenu = [
  {
    id: "idly",
    name: "Idly",
    price: 30,
    category: "classic",
    description: "Steamed rice cakes with chutney & sambar.",
    image:
      "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "puttu",
    name: "Puttu",
    price: 60,
    category: "classic",
    description: "Kerala style rice flour logs with kadala curry.",
    image:
      "https://images.pexels.com/photos/1307658/pexels-photo-1307658.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "coffee",
    name: "Filter Coffee",
    price: 40,
    category: "beverage",
    description: "Strong decoction served piping hot.",
    image:
      "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "dosai",
    name: "Dosai",
    price: 55,
    category: "classic",
    description: "Paper thin dosa with chutney trio.",
    image:
      "https://images.pexels.com/photos/1051399/pexels-photo-1051399.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "spl-dosai",
    name: "Spl Dosai",
    price: 80,
    category: "special",
    description: "Chef's special masala dosai with podi drizzle.",
    image:
      "https://images.pexels.com/photos/2638026/pexels-photo-2638026.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "onion-dosai",
    name: "Onion Dosai",
    price: 75,
    category: "special",
    description: "Crispy dosa topped with caramelised onions.",
    image:
      "https://images.pexels.com/photos/1487511/pexels-photo-1487511.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "ghee-roast",
    name: "Ghee Roast",
    price: 90,
    category: "special",
    description: "Golden roast soaked in aromatic ghee.",
    image:
      "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "poori",
    name: "Poori",
    price: 65,
    category: "classic",
    description: "Fluffy puris with aloo masala.",
    image:
      "https://images.pexels.com/photos/2714726/pexels-photo-2714726.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "chappathi",
    name: "Chappathi",
    price: 55,
    category: "classic",
    description: "Soft whole wheat rotis with kurma.",
    image:
      "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "parotta",
    name: "Parotta",
    price: 70,
    category: "classic",
    description: "Layered Malabar parotta with salna.",
    image:
      "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
  {
    id: "vadai",
    name: "Vadai",
    price: 25,
    category: "classic",
    description: "Crispy medu vadai served with sambar.",
    image:
      "https://images.pexels.com/photos/1352277/pexels-photo-1352277.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
  },
];

let menuItems = loadMenu();
let cartState = {};
let editMode = null;

init();

function init() {
  elements.year.textContent = new Date().getFullYear();
  renderMenu(menuItems);
  renderAdminList();
  renderCart();
  renderReports();
  bindEvents();
}

function bindEvents() {
  elements.menuSearch.addEventListener("input", applyMenuFilters);
  elements.menuFilter.addEventListener("change", applyMenuFilters);

  elements.clearCart.addEventListener("click", () => {
    cartState = {};
    renderCart();
  });

  elements.printBill.addEventListener("click", () => {
    if (!Object.keys(cartState).length) {
      alert("No items in the bill yet.");
      return;
    }
    window.print();
  });

  elements.payNow.addEventListener("click", () => {
    if (!Object.keys(cartState).length) {
      alert("Add at least one dish to the cart to proceed.");
      return;
    }
    toggleModal(true);
  });

  elements.closeModal.addEventListener("click", () => toggleModal(false));
  elements.qrModal.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal__overlay")) {
      toggleModal(false);
    }
  });

  elements.confirmPayment.addEventListener("click", confirmPayment);

  elements.cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === "increment") updateQuantity(id, 1);
    if (action === "decrement") updateQuantity(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  elements.menuForm.addEventListener("submit", handleMenuSubmit);
  elements.cancelEdit.addEventListener("click", resetForm);

  elements.adminList.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    if (!action || !id) return;
    if (action === "edit") startEdit(id);
    if (action === "delete") deleteMenuItem(id);
  });
}

function toggleModal(show) {
  if (show) {
    elements.qrModal.classList.remove("hidden");
    elements.qrModal.setAttribute("aria-hidden", "false");
  } else {
    elements.qrModal.classList.add("hidden");
    elements.qrModal.setAttribute("aria-hidden", "true");
  }
}

function confirmPayment() {
  if (!Object.keys(cartState).length) {
    alert("Nothing to bill yet.");
    toggleModal(false);
    return;
  }
  const saleItems = Object.values(cartState).map((entry) => ({
    id: entry.id,
    name: entry.name,
    quantity: entry.quantity,
    lineTotal: entry.quantity * entry.price,
  }));
  const total = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const saleRecord = {
    id: crypto.randomUUID ? crypto.randomUUID() : `sale-${Date.now()}`,
    items: saleItems,
    total,
    timestamp: new Date().toISOString(),
  };
  const history = readSales();
  history.push(saleRecord);
  localStorage.setItem(storageKeys.sales, JSON.stringify(history));
  toggleModal(false);
  cartState = {};
  renderCart();
  renderReports();
  alert("Payment recorded and bill cleared.");
}

function addToCart(itemId) {
  const item = menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  if (!cartState[itemId]) {
    cartState[itemId] = {
      ...item,
      quantity: 0,
    };
  }
  cartState[itemId].quantity += 1;
  renderCart();
}

function updateQuantity(itemId, delta) {
  if (!cartState[itemId]) return;
  cartState[itemId].quantity += delta;
  if (cartState[itemId].quantity <= 0) {
    delete cartState[itemId];
  }
  renderCart();
}

function removeFromCart(itemId) {
  delete cartState[itemId];
  renderCart();
}

function renderCart() {
  const ids = Object.keys(cartState);
  if (!ids.length) {
    elements.cartItems.classList.add("empty-state");
    elements.cartItems.textContent =
      "Cart is empty. Tap dishes to start adding items.";
    updateBillTotals(0);
    return;
  }

  elements.cartItems.classList.remove("empty-state");
  elements.cartItems.innerHTML = "";

  ids.forEach((id) => {
    const item = cartState[id];
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item__info">
        <strong>${item.name}</strong>
        <span class="muted">${formatter.format(item.price)} each</span>
      </div>
      <div class="cart-controls">
        <button data-action="decrement" data-id="${id}">−</button>
        <span>${item.quantity}</span>
        <button data-action="increment" data-id="${id}">+</button>
        <strong>${formatter.format(item.quantity * item.price)}</strong>
        <button class="btn ghost" data-action="remove" data-id="${id}">Remove</button>
      </div>
    `;
    elements.cartItems.appendChild(row);
  });

  const subtotal = ids.reduce(
    (sum, key) => sum + cartState[key].price * cartState[key].quantity,
    0
  );
  updateBillTotals(subtotal);
}

function updateBillTotals(amount) {
  elements.billSubtotal.textContent = formatter.format(amount);
  elements.billTotal.textContent = formatter.format(amount);
}

function renderMenu(list) {
  const items = list || [];
  if (!items.length) {
    elements.menuGrid.innerHTML =
      '<p class="muted">No dishes match the current filters.</p>';
    return;
  }
  elements.menuGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "menu-card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="menu-card__title">
        <h3>${item.name}</h3>
        <span class="price">${formatter.format(item.price)}</span>
      </div>
      <p class="muted">${item.description}</p>
      <button class="btn secondary" data-id="${item.id}">Add to cart</button>
    `;
    card.addEventListener("click", (event) => {
      if (event.target.matches("button")) return;
      addToCart(item.id);
    });
    card.querySelector("button").addEventListener("click", (event) => {
      event.stopPropagation();
      addToCart(item.id);
    });
    elements.menuGrid.appendChild(card);
  });
}

function applyMenuFilters() {
  const search = elements.menuSearch.value.trim().toLowerCase();
  const category = elements.menuFilter.value;
  const filtered = menuItems.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const matchesSearch = item.name.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
  renderMenu(filtered);
}

function handleMenuSubmit(event) {
  event.preventDefault();
  const name = elements.menuName.value.trim();
  const price = Number(elements.menuPrice.value);
  const category = elements.menuCategory.value;
  const image =
    elements.menuImage.value.trim() ||
    "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1";

  if (!name || !price) {
    alert("Please fill in dish name and price.");
    return;
  }

  if (editMode) {
    menuItems = menuItems.map((item) =>
      item.id === editMode ? { ...item, name, price, category, image } : item
    );
  } else {
    const id = slugify(name);
    if (menuItems.some((item) => item.id === id)) {
      alert("A dish with similar name already exists.");
      return;
    }
    menuItems.push({
      id,
      name,
      price,
      category,
      image,
      description: `Freshly made ${name}.`,
    });
  }

  persistMenu();
  renderMenu(menuItems);
  renderAdminList();
  resetForm();
}

function startEdit(itemId) {
  const item = menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  editMode = itemId;
  elements.menuId.value = itemId;
  elements.menuName.value = item.name;
  elements.menuPrice.value = item.price;
  elements.menuCategory.value = item.category;
  elements.menuImage.value = item.image;
  elements.menuForm.querySelector(".btn.primary").textContent = "Update Dish";
  elements.cancelEdit.classList.remove("hidden");
}

function resetForm() {
  editMode = null;
  elements.menuId.value = "";
  elements.menuForm.reset();
  elements.menuForm.querySelector(".btn.primary").textContent = "Add Dish";
  elements.cancelEdit.classList.add("hidden");
}

function deleteMenuItem(itemId) {
  if (!confirm("Remove this dish from the menu?")) return;
  menuItems = menuItems.filter((item) => item.id !== itemId);
  delete cartState[itemId];
  persistMenu();
  renderMenu(menuItems);
  renderAdminList();
  renderCart();
}

function renderAdminList() {
  if (!menuItems.length) {
    elements.adminList.innerHTML = '<p class="muted">No dishes found.</p>';
    return;
  }
  elements.adminList.innerHTML = "";
  menuItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <span>${item.name}</span>
      <span>${formatter.format(item.price)}</span>
      <span>${capitalize(item.category)}</span>
      <span class="admin-actions">
        <button class="btn ghost" data-action="edit" data-id="${item.id}">Edit</button>
        <button class="btn secondary" data-action="delete" data-id="${item.id}">Delete</button>
      </span>
    `;
    elements.adminList.appendChild(row);
  });
}

function loadMenu() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.menu));
    if (Array.isArray(saved) && saved.length) {
      return saved;
    }
  } catch (error) {
    console.warn("Unable to read saved menu. Using defaults.", error);
  }
  localStorage.setItem(storageKeys.menu, JSON.stringify(defaultMenu));
  return JSON.parse(JSON.stringify(defaultMenu));
}

function persistMenu() {
  localStorage.setItem(storageKeys.menu, JSON.stringify(menuItems));
}

function readSales() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.sales));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn("Unable to parse sales data.", error);
    return [];
  }
}

function renderReports() {
  const sales = readSales();
  renderReportTable(sales, "daily");
  renderReportTable(sales, "monthly");
}

function renderReportTable(sales, type) {
  const target =
    type === "daily" ? elements.dailyReportBody : elements.monthlyReportBody;
  if (!sales.length) {
    target.innerHTML = '<tr><td colspan="3" class="muted">No sales yet.</td></tr>';
    return;
  }
  const grouped = groupSales(sales, type);
  const rows = Object.values(grouped)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(
      (entry) => `
    <tr>
      <td>${entry.label}</td>
      <td>${entry.orders}</td>
      <td>${formatter.format(entry.total)}</td>
    </tr>
  `
    )
    .join("");
  target.innerHTML = rows;
}

function groupSales(sales, type) {
  return sales.reduce((acc, sale) => {
    const date = new Date(sale.timestamp);
    const key =
      type === "daily"
        ? date.toISOString().split("T")[0]
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = {
        key,
        label:
          type === "daily"
            ? date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : date.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              }),
        total: 0,
        orders: 0,
        timestamp: date.getTime(),
      };
    }
    acc[key].total += sale.total;
    acc[key].orders += 1;
    return acc;
  }, {});
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Preload default menu into UI on first visit
if (!localStorage.getItem(storageKeys.menu)) {
  localStorage.setItem(storageKeys.menu, JSON.stringify(defaultMenu));
}

