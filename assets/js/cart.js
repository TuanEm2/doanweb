/* =========================================
 * FILE: cart.js (PHIÊN BẢN SỬA LỖI HOÀN CHỈNH)
 * ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // === KEY LƯU TRỮ ===
  const CART_STORAGE_KEY = "soiStuCart";
  const USER_STORAGE_KEY = "soi_current_user";
  const ORDER_HISTORY_KEY = "soi_order_history";
  const PRODUCTS_STORAGE_KEY = "productsData"; // Key để đọc kho hàng
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

  // === HÀM TẢI SẢN PHẨM (ĐỌC TỪ LOCALSTORAGE) ===
  // Đây là hàm quan trọng nhất để lấy tồn kho MỚI NHẤT
  function loadProducts() {
    let loadedProducts = [];
    let adminData = localStorage.getItem(PRODUCTS_STORAGE_KEY);

    // 1. Ưu tiên đọc từ localStorage (do admin cập nhật)
    if (adminData && adminData !== "[]") {
      loadedProducts = JSON.parse(adminData)
        .filter((product) => product.isHidden !== true)
        .map((item) => {
          let normalizedSize;
          if (Array.isArray(item.size)) {
            normalizedSize = item.size;
          } else if (typeof item.size === "object" && item.size !== null) {
            normalizedSize = SIZES.map((sizeName) => ({
              name: sizeName,
              quantity: item.size[sizeName] || 0,
            }));
          } else {
            normalizedSize = [];
          }
          return { ...item, size: normalizedSize };
        });
    }
    // 2. Nếu localStorage rỗng, đọc từ file data.js (biến 'products' gốc)
    else if (typeof products !== "undefined" && products.length > 0) {
      loadedProducts = products
        .filter((product) => product.isHidden !== true)
        .map((item) => {
          let normalizedSize = Array.isArray(item.size) ? item.size : [];
          return { ...item, size: normalizedSize };
        });
    }
    return loadedProducts;
  }

  // === BIẾN TOÀN CỤC ===
  // 'allProducts' bây giờ sẽ là dữ liệu mới nhất từ localStorage
  const allProducts = loadProducts();

  // === BIẾN TRANG GIỎ HÀNG ===
  let cartItemsContainer = document.getElementById("cart-items-list");
  const cartTotalPriceEl = document.getElementById("cart-total-price");
  const cartContainer = document.querySelector(".cart-container");

  // === BIẾN MODAL ĐẶT HÀNG ===
  const checkoutBtn = document.querySelector(".btn-checkout");
  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutModalContent = document.querySelector(
    ".checkout-modal-content"
  );
  const cancelCheckoutBtn = document.getElementById("cancelCheckoutBtn");
  const confirmOrderBtn = document.getElementById("confirmOrderBtn");
  const defaultAddressDisplay = document.getElementById(
    "defaultAddressDisplay"
  );
  const newAddressInput = document.getElementById("newAddressInput");
  const addressOptions = document.querySelectorAll(
    'input[name="addressOption"]'
  );
const checkoutTotalPrice = document.getElementById("checkoutTotalPrice");
  const checkoutFinalPrice = document.getElementById("checkoutFinalPrice");
  const checkoutUserName = document.getElementById("checkoutUserName");
  const checkoutUserEmail = document.getElementById("checkoutUserEmail");
  const checkoutProductList = document.getElementById("checkoutProductList");
  const checkoutUserPhone = document.getElementById("checkoutUserPhone");
  const paymentRadioButtons = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  const qrBankImage = document.getElementById("qrBankImage");
  const qrMomoImage = document.getElementById("qrMomoImage");

  // Tải giỏ hàng từ localStorage
  let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

  // === HÀM HỖ TRỢ ===
  const formatPrice = (price) => {
    if (isNaN(price)) {
      return "Giá không xác định";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartSummary();
  }

  // === HÀM XỬ LÝ MODAL ĐẶT HÀNG ===

  function showCheckoutModal() {
    if (cart.length === 0) {
      alert(
        "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng."
      );
      return;
    }
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) {
      alert(
        "Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }
    const user = JSON.parse(userJson);

    if (checkoutUserName)
      checkoutUserName.textContent = `${user.firstName} ${user.lastName}`;
    if (checkoutUserEmail) checkoutUserEmail.textContent = user.email;
    if (checkoutUserPhone)
      checkoutUserPhone.textContent = user.phone || "Chưa đăng ký";

    if (defaultAddressDisplay) {
      defaultAddressDisplay.textContent =
        user.address || "Chưa có địa chỉ (Vui lòng nhập mới)";
    }

    if (checkoutProductList) {
      checkoutProductList.innerHTML = "";
      cart.forEach((item) => {
        const itemHtml = `
                    <div class="checkout-product-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="details">
                            <div class="name">${item.name}</div>
                            <div class="size-qty">Size: ${item.size} (x${
          item.quantity
        })</div>
                        </div>
                        <div class="price">${formatPrice(
                          item.price * item.quantity
                        )}</div>
                    </div>
                `;
        checkoutProductList.innerHTML += itemHtml;
      });
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
if (checkoutTotalPrice) checkoutTotalPrice.innerText = formatPrice(total);
    if (checkoutFinalPrice) checkoutFinalPrice.innerText = formatPrice(total);

    document.querySelector(
      'input[name="addressOption"][value="default"]'
    ).checked = true;
    document.querySelector(
      'input[name="paymentMethod"][value="cash"]'
    ).checked = true;
    if (newAddressInput) {
      newAddressInput.style.display = "none";
      newAddressInput.value = "";
    }
    if (qrBankImage) qrBankImage.classList.remove("is-visible");
    if (qrMomoImage) qrMomoImage.classList.remove("is-visible");
    if (checkoutModal) checkoutModal.classList.add("active");
  }

  function hideCheckoutModal() {
    if (checkoutModal) checkoutModal.classList.remove("active");
  }

  function handleConfirmOrder() {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) {
      alert(
        "Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }
    const user = JSON.parse(userJson);
    const addressChoice = document.querySelector(
      'input[name="addressOption"]:checked'
    ).value;
    const addressObject = {
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
      phone: user.phone || "N/A",
      email: user.email || "N/A",
      address: user.address || "N/A",
    };
    if (addressChoice === "new") {
      const newAddressString = newAddressInput.value.trim();
      if (newAddressString === "") {
        alert("Vui lòng nhập địa chỉ giao hàng mới.");
        return;
      }
      addressObject.address = newAddressString;
    }
    const paymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked'
    ).value;
    const orderTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const newOrder = {
      id: `SOI-${new Date().getTime()}`,
      date: new Date().toISOString(),
      items: cart,
      total: orderTotal,
      address: addressObject,
      paymentMethod: paymentMethod,
      status: "processing",
    };
    let orderHistory =
      JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY)) || [];
    orderHistory.unshift(newOrder);
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orderHistory));
    cart = [];
    saveCart();
    alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!
Cảm ơn bạn đã mua hàng tại SỢI! Bạn sẽ được chuyển về trang chủ.`);
    hideCheckoutModal();
    window.location.href = "index.html";
  }

  // === HÀM TRANG GIỎ HÀNG ===

  function updateCartSummary() {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    if (cartTotalPriceEl) {
      cartTotalPriceEl.innerText = formatPrice(total);
    }
  }

  function removeItemFromCart(index) {
    const item = cart[index];
    if (!item) return;
    if (
      confirm(
`Bạn có chắc muốn xóa "${item.name} - Size ${item.size}" khỏi giỏ hàng?`
      )
    ) {
      cart.splice(index, 1);
      saveCart();
      renderCartItems();
      setupCartActions(); // Phải gọi lại sau khi render
    }
  }

  // (ĐÃ SỬA LỖI [object Object])
  function renderCartItems() {
    if (!cartItemsContainer) {
      console.error("Lỗi: Không tìm thấy 'cart-items-list'.");
      return;
    }
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p style="text-align: center; padding: 30px; font-size: 1.1rem; color: #555;">Giỏ hàng của bạn đang trống.</p>';
      updateCartSummary();
      return;
    }

    cart.forEach((item, index) => {
      const itemPriceValue = parseFloat(item.price || 0);
      const itemQuantity = parseInt(item.quantity || 1);

      // Lấy thông tin đầy đủ của sản phẩm từ allProducts (đã nạp từ localStorage)
      const productInfo = allProducts.find((p) => p.id == item.id);

      // (FIX LỖI [object Object])
      // Lấy các size CÒN HÀNG
      const availableSizes = productInfo
        ? productInfo.size.filter((s) => s.quantity > 0)
        : [{ name: item.size, quantity: 1 }]; // Fallback

      // Tạo HTML cho các nút chọn size
      let sizeOptionsHTML = "";
      availableSizes.forEach((sizeObject) => {
        // 'sizeObject' là {name: "S", quantity: 10}
        const sizeName = sizeObject.name; // Chỉ lấy tên
        sizeOptionsHTML += `<span class="edit-size-option ${
          sizeName === item.size ? "active" : ""
        }" data-size="${sizeName}">${sizeName}</span>`; // Hiển thị tên
      });
      // (KẾT THÚC FIX)

      const itemHtml = `
                <div class="cart-item" data-index="${index}">
                    <div class="cart-item-view">
                        <div class="item-image-container">
                            <img class="item-image" src="${item.image}" alt="${
        item.name
      }">
                        </div>
                        <div class="item-details">
                            <h3 class="item-name">${item.name}</h3>
                            <p class="item-size">Size: ${item.size}</p>
                        </div>
                        <div class="item-slide-wrapper">
                            <div class="item-pricing">
                                <p class="item-price">${formatPrice(
                                  itemPriceValue
                                )}</p> 
                                <p class="item-quantity">Số Lượng: <strong>${itemQuantity}</strong></p>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="btn-edit"><span>Sửa</span></button>
                            <button class="btn-delete"><span>Hủy</span></button>
                        </div>
</div>
                    <div class="item-edit-form">
                        <div class="form-group">
                            <label>Chọn Size:</label>
                            <div class="edit-size-selector">
                                ${sizeOptionsHTML}
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Số lượng:</label>
                            <div class="edit-quantity-selector">
                                <button class="qty-btn" data-action="decrease">-</button>
                                <input type="number" class="qty-input" value="${itemQuantity}" min="1">
                                <button class="qty-btn" data-action="increase">+</button>
                            </div>
                        </div>
                        <div class="edit-actions">
                            <button class="btn-save">Lưu</button>
                            <button class="btn-cancel">Đóng</button>
                        </div>
                    </div>
                </div>
            `;
      cartItemsContainer.innerHTML += itemHtml;
    });

    updateCartSummary();
  }

  // (ĐÃ SỬA LỖI VƯỢT TỒN KHO)
  function setupCartActions() {
    if (!cartItemsContainer) return;

    // Phải xóa listener cũ để tránh lỗi
    const newContainer = cartItemsContainer.cloneNode(true);
    cartItemsContainer.parentNode.replaceChild(
        newContainer,
        cartItemsContainer
    );
    
    // *** DÒNG SỬA QUAN TRỌNG ***
    // Cập nhật lại biến toàn cục để trỏ vào container MỚI
    cartItemsContainer = newContainer; 
    
    // Gắn sự kiện vào biến toàn cục (đã được cập nhật)
    cartItemsContainer.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        if (!cartItem) return;

        const index = parseInt(cartItem.dataset.index);
        if (isNaN(index)) return;

      const itemData = cart[index];
      if (!itemData) return;

      // --- XỬ LÝ NÚT SỬA ---
      if (e.target.closest(".btn-edit")) {
        document.querySelectorAll(".cart-item.is-editing").forEach((item) => {
          if (item !== cartItem) {
            item.classList.remove("is-editing");
          }
        });
        cartItem.classList.add("is-editing");
      }

      // --- XỬ LÝ NÚT ĐÓNG (TRONG FORM SỬA) ---
      if (e.target.closest(".btn-cancel")) {
        cartItem.classList.remove("is-editing");
        const editForm = cartItem.querySelector(".item-edit-form");
        editForm.querySelector(".qty-input").value = itemData.quantity;
        editForm.querySelectorAll(".edit-size-option").forEach((opt) => {
          opt.classList.toggle("active", opt.dataset.size === itemData.size);
        });
      }

      // --- XỬ LÝ NÚT LƯU (ĐÃ FIX TỒN KHO) ---
      if (e.target.closest(".btn-save")) {
        const editForm = cartItem.querySelector(".item-edit-form");

        // 1. Lấy dữ liệu mới từ form
const newQty = parseInt(editForm.querySelector(".qty-input").value);
        const newSizeEl = editForm.querySelector(".edit-size-option.active");

        // 2. Kiểm tra form hợp lệ
        if (newQty < 1) {
          alert("Số lượng phải lớn hơn 0");
          return;
        }
        if (!newSizeEl) {
          alert("Vui lòng chọn size!");
          return;
        }
        const newSize = newSizeEl.dataset.size;

        // 3. Lấy thông tin sản phẩm (từ allProducts)
        const productId = itemData.id;
        const product = allProducts.find((p) => p.id == productId);
        if (!product) {
          alert("Lỗi: Không tìm thấy thông tin sản phẩm.");
          return;
        }

        // 4. Lấy tồn kho của size đã chọn
        const sizeData = product.size.find((s) => s.name === newSize);
        if (!sizeData || sizeData.quantity <= 0) {
          alert("Xin lỗi, size này đã hết hàng.");
          return;
        }
        const stockForThisSize = sizeData.quantity;

        // 5. *** KIỂM TRA TỒN KHO ***
        if (newQty > stockForThisSize) {
          alert(
            `Bạn chỉ có thể đặt tối đa ${stockForThisSize} sản phẩm cho Size ${newSize}.`
          );
          editForm.querySelector(".qty-input").value = stockForThisSize;
          return; // Dừng lại, không lưu
        }

        // 6. Nếu OK, cập nhật giỏ hàng
        cart[index].quantity = newQty;
        cart[index].size = newSize;

        saveCart();

        // Cập nhật giao diện
        const view = cartItem.querySelector(".cart-item-view");
        view.querySelector(".item-size").innerText = `Size: ${newSize}`;
        view.querySelector(".item-quantity strong").innerText = newQty;

        cartItem.classList.remove("is-editing");
        alert("Cập nhật giỏ hàng thành công!");
      }

      // --- XỬ LÝ NÚT HỦY (XÓA) ---
      if (e.target.closest(".btn-delete")) {
        removeItemFromCart(index);
      }

      // --- XỬ LÝ CHỌN SIZE (TRONG FORM SỬA) ---
      if (e.target.closest(".edit-size-option")) {
        const selectedSizeEl = e.target.closest(".edit-size-option");
        cartItem
          .querySelectorAll(".edit-size-option")
          .forEach((opt) => opt.classList.remove("active"));
        selectedSizeEl.classList.add("active");
      }

      // --- XỬ LÝ +/- (TRONG FORM SỬA) ---
      if (e.target.closest(".qty-btn")) {
        const btn = e.target.closest(".qty-btn");
        const action = btn.dataset.action;
        const input = cartItem.querySelector(".qty-input");
        let currentValue = parseInt(input.value);

        if (action === "increase") {
          input.value = currentValue + 1;
        } else if (action === "decrease" && currentValue > 1) {
          input.value = currentValue - 1;
        }
      }
    });
  }

  // === KHỞI CHẠY ===
  if (!localStorage.getItem(USER_STORAGE_KEY)) {
alert("Vui lòng đăng nhập để xem giỏ hàng");
    window.location.href = "user.html";
    return;
  }

  renderCartItems();
  setupCartActions();

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showCheckoutModal();
    });
  }
  if (cancelCheckoutBtn) {
    cancelCheckoutBtn.addEventListener("click", hideCheckoutModal);
  }
  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener("click", handleConfirmOrder);
  }
  if (addressOptions) {
    addressOptions.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.value === "new") {
          if (newAddressInput) newAddressInput.style.display = "block";
        } else {
          if (newAddressInput) newAddressInput.style.display = "none";
        }
      });
    });
  }
  if (checkoutModalContent) {
    checkoutModalContent.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
  if (checkoutModal) {
    checkoutModal.addEventListener("click", hideCheckoutModal);
  }
  if (paymentRadioButtons.length > 0 && qrBankImage && qrMomoImage) {
    paymentRadioButtons.forEach((radio) => {
      radio.addEventListener("change", () => {
        const selectedValue = document.querySelector(
          'input[name="paymentMethod"]:checked'
        ).value;
        qrBankImage.classList.remove("is-visible");
        qrMomoImage.classList.remove("is-visible");
        if (selectedValue === "transfer") {
          qrBankImage.classList.add("is-visible");
        } else if (selectedValue === "online") {
          qrMomoImage.classList.add("is-visible");
        }
      });
    });
  }
});