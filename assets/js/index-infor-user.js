/* =========================================
 * FILE: index-infor-user.js (PHIÊN BẢN TỐI ƯU)
 * ========================================= */

// === KEY LƯU TRỮ ===
const USER_STORAGE_KEY = "soi_registered_user";
const CURRENT_USER_KEY = "soi_current_user";
const CART_STORAGE_KEY = "soiStuCart";
const ORDER_HISTORY_KEY = "soi_order_history";

// === HÀM HỖ TRỢ ===
const formatPrice = (price) => {
  if (isNaN(price)) return "Giá không xác định";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleString("vi-VN", options);
};
function isValidPhone(phone) {
  const phoneRegex = /^0\d{9}$/; // Regex SĐT 10 số
  return phoneRegex.test(phone);
}
function translateClientStatus(status) {
  switch (status) {
    case "processing":
      return '<span class="order-status-tag status-processing">Đang chờ xử lý</span>';
    case "delivered":
      return '<span class="order-status-tag status-delivered">Đã xử lý</span>';
    case "canceled":
      return '<span class="order-status-tag status-canceled">Đã hủy</span>';
    default:
      return '<span class="order-status-tag status-unknown">Không rõ</span>';
  }
}

// ===================================
// LOGIC MODAL THÔNG TIN TÀI KHOẢN
// ===================================

// Lấy các DOM element của modal (chỉ 1 lần)
const userInfoModal = document.getElementById("userInfoModal");
const valEmail = userInfoModal?.querySelector("#modalEmail .value");
const valFirstName = userInfoModal?.querySelector("#modalFirstName .value");
const valLastName = userInfoModal?.querySelector("#modalLastName .value");
const valPhone = userInfoModal?.querySelector("#modalPhone .value");
const valAddress = userInfoModal?.querySelector("#modalAddress .value");
const editableFields = [valFirstName, valLastName, valPhone, valAddress];

// Lấy các nút
const btnCloseModal = document.getElementById("btn-close-modal");
const btnEditInfo = document.getElementById("btn-edit-info");
const btnCancelInfo = document.getElementById("btn-cancel-info");
const btnSaveInfo = document.getElementById("btn-save-info");

/**
 * Nạp dữ liệu mới nhất vào modal (chỉ vào SPAN)
 */
function loadUserInfo() {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) return null;
  const user = JSON.parse(userJson);

  if (valEmail) valEmail.textContent = user.email || "N/A";
  if (valFirstName) valFirstName.textContent = user.firstName || "N/A";
  if (valLastName) valLastName.textContent = user.lastName || "N/A";
  if (valPhone) valPhone.textContent = user.phone || "Chưa đăng ký";
  if (valAddress) valAddress.textContent = user.address || "Chưa đăng ký";

  return user;
}

/**
 * Hàm CHÍNH: Mở modal (Khi bấm "thông tin tài khoản")
 */
function showUserInfoModal(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const user = loadUserInfo(); // Nạp dữ liệu
  if (!user) {
    alert("❌ Bạn chưa đăng nhập.");
    window.location.href = "user.html";
    return;
  }

  if (userInfoModal) {
    // Đảm bảo ở chế độ XEM
    editableFields.forEach((field) =>
      field.setAttribute("contenteditable", "false")
    );

    // HIỂN THỊ NÚT XEM
    if (btnCloseModal) btnCloseModal.style.display = "block";
    if (btnEditInfo) btnEditInfo.style.display = "block";
    // ẨN NÚT SỬA
    if (btnCancelInfo) btnCancelInfo.style.display = "none";
    if (btnSaveInfo) btnSaveInfo.style.display = "none";

    userInfoModal.classList.add("active"); // Hiển thị modal
  }
}

/**
 * Hàm ĐÓNG modal
 */
function hideModal() {
  if (userInfoModal) {
    userInfoModal.classList.remove("active");
    editableFields.forEach((field) =>
      field.setAttribute("contenteditable", "false")
    );
  }
}

/**
 * Hàm LƯU thông tin (Khi bấm "Lưu")
 */
function saveUserInfo() {
  // 1. Lấy dữ liệu mới từ textContent của các span
  const newFirstName = valFirstName.textContent.trim();
  const newLastName = valLastName.textContent.trim();
  const newPhone = valPhone.textContent.trim();
  const newAddress = valAddress.textContent.trim();

  // 2. Validation
  if (!newFirstName || !newLastName || !newPhone || !newAddress) {
    alert("Lỗi: Vui lòng điền đầy đủ các trường.");
    return;
  }
  if (!isValidPhone(newPhone)) {
    alert("Lỗi: Số điện thoại không hợp lệ (Phải là 10 số, bắt đầu bằng 0).");
    return;
  }

  // 3. Cập nhật `soi_current_user` (Phiên hiện tại)
  const currentUserJson = localStorage.getItem(CURRENT_USER_KEY);
  let currentUser = JSON.parse(currentUserJson);
  currentUser.firstName = newFirstName;
  currentUser.lastName = newLastName;
  currentUser.phone = newPhone;
  currentUser.address = newAddress;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  // 4. Cập nhật `soi_registered_user` (Danh bạ tổng)
  let allUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
  const userIndex = allUsers.findIndex((u) => u.email === currentUser.email);
  if (userIndex > -1) {
    allUsers[userIndex] = currentUser;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(allUsers));
  }

  // 5. Cập nhật giao diện
  alert("✅ Cập nhật thông tin thành công!");
  const userNameDisplay = document.getElementById("userNameDisplay");
  if (userNameDisplay) {
    userNameDisplay.textContent = newFirstName;
  }

  // Tắt chế độ sửa
  editableFields.forEach((field) =>
    field.setAttribute("contenteditable", "false")
  );
  // HIỂN THỊ NÚT XEM
  if (btnCloseModal) btnCloseModal.style.display = "block";
  if (btnEditInfo) btnEditInfo.style.display = "block";
  // ẨN NÚT SỬA
  if (btnCancelInfo) btnCancelInfo.style.display = "none";
  if (btnSaveInfo) btnSaveInfo.style.display = "none";
}

// ===================================
// LOGIC KHỞI CHẠY VÀ GẮN SỰ KIỆN CHUNG
// ===================================

document.addEventListener("DOMContentLoaded", () => {
  // --- GẮN SỰ KIỆN CHO NÚT HEADER ---
  const menuInfoLink = document.getElementById("menuInfo")?.querySelector("a");
  if (menuInfoLink) {
    menuInfoLink.addEventListener("click", showUserInfoModal);
  }

  const menuLogoutLink = document
    .getElementById("menuLogout")
    ?.querySelector("a");
  if (menuLogoutLink) {
    menuLogoutLink.addEventListener("click", handleLogout);
  }

  const menuOrdersLink = document
    .getElementById("menuOrders")
    ?.querySelector("a");
  if (menuOrdersLink) {
    menuOrdersLink.addEventListener("click", showOrderHistoryModal);
  }

  // === GẮN SỰ KIỆN CHO NÚT MODAL ===

  // 1. Nút Sửa
  if (btnEditInfo) {
    btnEditInfo.addEventListener("click", () => {
      // ẨN NÚT XEM
      if (btnCloseModal) btnCloseModal.style.display = "none";
      if (btnEditInfo) btnEditInfo.style.display = "none";
      // HIỂN THỊ NÚT SỬA
      if (btnCancelInfo) btnCancelInfo.style.display = "block";
      if (btnSaveInfo) btnSaveInfo.style.display = "block";

      // BẬT CHẾ ĐỘ SỬA
      editableFields.forEach((field) =>
        field.setAttribute("contenteditable", "true")
      );
      if (valFirstName) valFirstName.focus();
    });
  }

  // 2. Nút Hủy
  if (btnCancelInfo) {
    btnCancelInfo.addEventListener("click", () => {
      // HIỂN THỊ NÚT XEM
      if (btnCloseModal) btnCloseModal.style.display = "block";
      if (btnEditInfo) btnEditInfo.style.display = "block";
      // ẨN NÚT SỬA
      if (btnCancelInfo) btnCancelInfo.style.display = "none";
      if (btnSaveInfo) btnSaveInfo.style.display = "none";

      // TẮT CHẾ ĐỘ SỬA
      editableFields.forEach((field) =>
        field.setAttribute("contenteditable", "false")
      );
      loadUserInfo(); // Nạp lại dữ liệu gốc
    });
  }

  // 3. Nút Lưu
  if (btnSaveInfo) {
    btnSaveInfo.addEventListener("click", saveUserInfo);
  }

  // 4. Nút Đóng
  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", hideModal);
  }

  // 5. Gán sự kiện click ra ngoài lớp phủ
  if (userInfoModal) {
    userInfoModal.addEventListener("click", (event) => {
      if (event.target === userInfoModal) {
        hideModal();
      }
    });
  }

  // === KHỞI TẠO HEADER ===
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  const userNameDisplay = document.getElementById("userNameDisplay");
  const menuInfo = document.getElementById("menuInfo");
  const menuOrders = document.getElementById("menuOrders");
  const menuLogout = document.getElementById("menuLogout");
  const menuLogin = document.getElementById("menuLogin");
  const menuRegister = document.getElementById("menuRegister");

  if (userJson && userNameDisplay) {
    const user = JSON.parse(userJson);
    userNameDisplay.textContent = user.firstName ? user.firstName : "Tài khoản";
    if (menuInfo) menuInfo.style.display = "block";
    if (menuOrders) menuOrders.style.display = "block";
    if (menuLogout) menuLogout.style.display = "block";
    if (menuLogin) menuLogin.style.display = "none";
    if (menuRegister) menuRegister.style.display = "none";
  } else if (userNameDisplay) {
    userNameDisplay.textContent = "Tài khoản";
    if (menuInfo) menuInfo.style.display = "none";
    if (menuOrders) menuOrders.style.display = "none";
    if (menuLogout) menuLogout.style.display = "none";
    if (menuLogin) menuLogin.style.display = "block";
    if (menuRegister) menuRegister.style.display = "block";
  }

  // === KIỂM TRA GIỎ HÀNG ===
  const cartLink = document.getElementById("cartLink");
  if (cartLink) {
    cartLink.addEventListener("click", function (event) {
      event.preventDefault();
      const userIsLoggedIn = localStorage.getItem(CURRENT_USER_KEY);
      if (userIsLoggedIn) {
        window.location.href = "cart.html";
      } else {
        alert("Vui lòng đăng nhập để xem giỏ hàng");
        window.location.href = "user.html";
      }
    });
  }

  // === MENU HOVER ===
  const userItem = document.getElementById("userAccountItem");
  const userMenu = document.getElementById("userItemMenu");
  if (userItem && userMenu) {
    userItem.addEventListener("mouseenter", () => {
      userMenu.style.display = "flex";
    });
    userItem.addEventListener("mouseleave", () => {
      userMenu.style.display = "none";
    });
    userMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        userMenu.style.display = "none";
      }
    });
  }

  // === MODAL LỊCH SỬ ĐƠN HÀNG (Gắn sự kiện) ===
  const orderHistoryModal = document.getElementById("orderHistoryModal");
  if (orderHistoryModal) {
    orderHistoryModal.addEventListener("click", (event) => {
      if (event.target === orderHistoryModal) {
        hideOrderHistoryModal();
      }
    });
    const closeBtn = orderHistoryModal.querySelector(".modal-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", hideOrderHistoryModal);
  }
});

// ===================================
// LOGIC ĐĂNG XUẤT
// ===================================
function handleLogout(event) {
  if (event) event.preventDefault();
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CART_STORAGE_KEY);
    window.location.href = "index.html";
  }
}

// ===================================
// LOGIC MODAL LỊCH SỬ ĐƠN HÀNG
// ===================================
function showOrderHistoryModal(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  renderOrderHistory();
  const modal = document.getElementById("orderHistoryModal");
  if (modal) modal.classList.add("active");
  const menu = document.getElementById("userItemMenu");
  if (menu) menu.style.display = "none";
}

function hideOrderHistoryModal() {
  const modal = document.getElementById("orderHistoryModal");
  if (modal) modal.classList.remove("active");
}

function renderOrderHistory() {
  const container = document.getElementById("order-list-content");
  if (!container) return;
  const orderHistory =
    JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY)) || [];

  if (orderHistory.length === 0) {
    container.innerHTML =
      '<p class="empty-history">Bạn chưa có đơn hàng nào.</p>';
    return;
  }

  container.innerHTML = "";
  orderHistory.sort((a, b) => new Date(b.date) - new Date(a, b));

  orderHistory.forEach((order) => {
    let itemsHtml = "";
    order.items.forEach((item) => {
      itemsHtml += `
                <div class="order-product-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="order-product-details">
                        <div class="name">${item.name}</div>
                        <div class="size-qty">Size: ${item.size} (x${
        item.quantity
      })</div>
                    </div>
                    <div class="order-product-price">${formatPrice(
                      item.price * item.quantity
                    )}</div>
                </div>
            `;
    });

    let addressHtml = "";
    if (typeof order.address === "object" && order.address !== null) {
      addressHtml = `
                ${
                  order.address.name
                    ? `<strong>Người nhận:</strong> ${order.address.name}<br>`
                    : ""
                }
                ${
                  order.address.phone
                    ? `<strong>SĐT:</strong> ${order.address.phone}<br>`
                    : ""
                }
                ${
                  order.address.address
                    ? `<strong>Địa chỉ:</strong> ${order.address.address}`
                    : ""
                }
            `;
    } else {
      addressHtml = `<strong>Địa chỉ giao:</strong> ${order.address || "N/A"}`;
    }

    const orderHtml = `
            <div class="order-item">
                <div class="order-header">
                    <h3>Mã đơn: <span>${order.id}</span></h3>
                    ${translateClientStatus(order.status)} 
                    <div class="order-total">${formatPrice(order.total)}</div>
                </div>
                <div class="order-details">
                    <p><strong>Ngày đặt:</strong> ${formatDate(order.date)}</p>
                    <div class="order-address-details" style="line-height: 1.5;">${addressHtml}</div>
                    <p><strong>Thanh toán:</strong> ${order.paymentMethod}</p>
                </div>
                <div class="order-items-list">
                    <h4>Sản phẩm đã mua:</h4>
                    ${itemsHtml}
                </div>
            </div>
        `;
    container.innerHTML += orderHtml;
  });
}



























