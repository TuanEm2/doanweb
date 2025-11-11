document.addEventListener("DOMContentLoaded", function () {
  // === DOM Elements ===
  const ordersTable = document.querySelector("#ordersTable tbody");
  const filterStatus = document.getElementById("filterStatus");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const filterBtn = document.getElementById("filterDateBtn");
  const searchOrder = document.getElementById("searchOrder");

  // DOM cho Modal
  const orderModal = document.getElementById("orderModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalOrderId = document.getElementById("modalOrderId");
  const modalCustomerInfo = document.getElementById("modalCustomerInfo");
  const modalOrderItems = document.getElementById("modalOrderItems");
  const modalOrderTotal = document.getElementById("modalOrderTotal");

  // === KEY CHUNG ===
  const MASTER_ORDER_KEY = "soi_order_history";
  const PRODUCTS_STORAGE_KEY = 'productsData';

  let masterOrders = []; // Danh sách gốc (nested)

  // ======================
  // HELPERS
  // ======================

  function getProducts() {
      return JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [];
  }
  /**
   * Lưu dữ liệu sản phẩm và kích hoạt sự kiện cập nhật chéo.
   */
  function saveProducts(productsData) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsData));
      document.dispatchEvent(new Event('productsDataUpdated'));
  }

  function saveMasterOrders() {
    localStorage.setItem(MASTER_ORDER_KEY, JSON.stringify(masterOrders));
  }

  function formatISODateToVN(isoString) {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString("vi-VN");
    } catch (e) {
      return "Invalid Date";
    }
  }

  function parseVNDate(str) {
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str);
    const parts = str.trim().split(/[\/\-\.]/);
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
  }

  function statusBadge(status) {
    const map = {
      processing: { text: "Đang xử lý", color: "#f1c40f" },
      delivered: { text: "Đã giao", color: "#27ae60" },
      canceled: { text: "Đã hủy", color: "#e74c3c" },
    };
    const s = map[status] || { text: status, color: "#999" };
    return `<span style="background:${s.color};color:white;padding:4px 8px;border-radius:6px;font-size:12px;">${s.text}</span>`;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  /**
   * Hàm GIẢM TỒN KHO cho tất cả sản phẩm trong đơn hàng.
   * @param {Object} order - Đơn hàng đã giao.
   */
  function updateStockFromOrder(order) {
      let productsData = getProducts(); 
      let stockChanged = false;

      // Duyệt qua từng item trong đơn hàng đã giao
      order.items.forEach(orderItem => {
          const product = productsData.find(p => p.id === orderItem.id); // LƯU Ý: orderItem.id cần khớp với product.id
          
          if (product && product.size) {
              const sizeObj = product.size.find(s => s.name === orderItem.size);

              if (sizeObj) {
                  // Đảm bảo không giảm quá mức 0
                  sizeObj.quantity = Math.max(0, sizeObj.quantity - orderItem.quantity);
                  stockChanged = true;
                  
                  // Dọn dẹp mảng size nếu tồn kho về 0
                  product.size = product.size.filter(s => s.quantity > 0);
              } else {
                  console.warn(`[Stock Warning] Size ${orderItem.size} của SP ID ${orderItem.id} không tìm thấy trong kho.`);
              }
          }
      });

      if (stockChanged) {
          saveProducts(productsData); // Lưu lại dữ liệu sản phẩm đã giảm tồn kho
      }
  } 


  /**
   * Hàm HOÀN TÁC TỒN KHO cho tất cả sản phẩm trong đơn hàng (cộng lại tồn kho).
   * @param {Object} order - Đơn hàng bị hủy/hoàn tác.
   */
  function undoStockFromOrder(order) {
      let productsData = getProducts(); 
      let stockChanged = false;

      // Duyệt qua từng item trong đơn hàng
      order.items.forEach(orderItem => {
          const product = productsData.find(p => p.id === orderItem.id); 
          
          if (product && product.size) {
              let sizeObj = product.size.find(s => s.name === orderItem.size);

              if (!sizeObj) {
                  // Nếu size không tồn tại (đã bị xóa do tồn kho về 0), ta thêm lại nó
                  sizeObj = { name: orderItem.size, quantity: 0 };
                  product.size.push(sizeObj);
              }
              
              // CỘNG LẠI số lượng đã trừ đi trước đó
              sizeObj.quantity += orderItem.quantity;
              stockChanged = true;
          }
      });

      if (stockChanged) {
          saveProducts(productsData); // Lưu lại dữ liệu sản phẩm đã cộng lại tồn kho
      }
  }





  // ======================
  // MODAL LOGIC (Giữ nguyên)
  // ======================

  function showOrderModal(order) {
    if (!orderModal || !order) return;
    modalOrderId.textContent = order.id;

    modalCustomerInfo.innerHTML = `
        <strong>Tên:</strong> ${order.address.name || "N/A"}<br>
        <strong>SĐT:</strong> ${order.address.phone || "N/A"}<br>
        <strong>Email:</strong> ${order.address.email || "N/A"}<br>
        <strong>Địa chỉ:</strong> ${order.address.address || "N/A"}
    `;

    modalOrderItems.innerHTML = "";
    order.items.forEach((item) => {
      const itemHTML = `
            <li class="modal-item">
                <img src="${item.image || "assets/images/no-image.png"}" alt="${
        item.name
      }">
                <div class="modal-item-info">
                    <strong>${item.name}</strong> (Size: ${item.size})<br>
                    ${formatPrice(item.price)} x ${item.quantity}
                </div>
                <div class="modal-item-total">
                    ${formatPrice(item.price * item.quantity)}
                </div>
            </li>
        `;
      modalOrderItems.insertAdjacentHTML("beforeend", itemHTML);
    });

    const total = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    modalOrderTotal.textContent = formatPrice(total);
    orderModal.style.display = "block";
  }

  function hideOrderModal() {
    if (orderModal) orderModal.style.display = "none";
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", hideOrderModal);
  window.addEventListener("click", (e) => {
    if (e.target === orderModal) hideOrderModal();
  });

  // ======================
  // RENDER ORDERS (ĐÃ CẬP NHẬT 8 CỘT)
  // ======================
  function renderOrders() {
    ordersTable.innerHTML = "";

    masterOrders.forEach((order, index) => {
      const row = document.createElement("tr");

      const totalOrderPrice = order.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      // (ĐÃ SỬA) Tổng số lượng sản phẩm (không phải số loại)
      const totalItemCount = order.items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      row.dataset.status = order.status || "processing";
      row.dataset.index = index;

      // === BẮT ĐẦU SỬA LỖI (Tạo ra 8 cột) ===
      row.innerHTML = `
            <td>${order.id}</td> <td>${
              order.address.name || "Chưa có địa chỉ"
            }</td> <td>${totalItemCount} sản phẩm</td> <td>${formatPrice(totalOrderPrice)}</td> <td>${formatISODateToVN(order.date)}</td> <td>${statusBadge(order.status)}</td> <td> <button class="btn-details">Chi tiết</button>
            </td>

            <td> <button class="btn-edit">Sửa TT</button>
              <button class="btn-delete">Xóa</button>
            </td>
          `;
      // === KẾT THÚC SỬA LỖI ===

      ordersTable.appendChild(row);
    });

    applyFilters();
  }

  // ======================
  // LOAD ORDERS (Giữ nguyên)
  // ======================
  function loadOrders() {
    const saved = localStorage.getItem(MASTER_ORDER_KEY);
    masterOrders = saved ? JSON.parse(saved) : [];
    masterOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderOrders();
  }

  // ======================
  // FILTER FUNCTION (ĐÃ CẬP NHẬT)
  // ======================
  function applyFilters() {
    const statusValue = filterStatus?.value.toLowerCase() || "all";
    const start = startDate?.value ? parseVNDate(startDate.value) : null;
    const end = endDate?.value ? parseVNDate(endDate.value) : null;
    const keyword = searchOrder?.value.trim().toLowerCase() || "";

    if (end) end.setHours(23, 59, 59, 999);

    const rows = ordersTable.querySelectorAll("tr");
    rows.forEach((row) => {
      const rowStatus = row.dataset.status.toLowerCase();
      
      // === (ĐÃ SỬA) Cột Ngày Đặt bây giờ là 4 ===
      const dateText = row.children[4].textContent.trim(); 
      
      const orderDate = parseVNDate(dateText);
      const fullText = row.textContent.toLowerCase();

      const matchesStatus = statusValue === "all" || rowStatus === statusValue;
      let matchesDate = true;
      if (orderDate) {
        if (start && orderDate < start) matchesDate = false;
        if (end && orderDate > end) matchesDate = false;
      } else {
        if (start || end) matchesDate = false;
      }
      const matchesKeyword = !keyword || fullText.includes(keyword);
      row.style.display =
        matchesStatus && matchesDate && matchesKeyword ? "" : "none";
    });
  }

  // Gắn sự kiện lọc (Giữ nguyên)
  [filterStatus, startDate, endDate, searchOrder].forEach((el) => {
    if (el) el.addEventListener("input", applyFilters);
  });
  if (filterBtn) filterBtn.addEventListener("click", applyFilters);

  // ======================
  // EVENT HANDLERS
  // ======================

  function attachAllRowEvents() {
    ordersTable.addEventListener("click", function (e) {
      const target = e.target;
      const row = target.closest("tr");
      if (!row || row.classList.contains("editing")) return;

      const index = parseInt(row.dataset.index);
      const order = masterOrders[index];

      if (target.classList.contains("btn-details")) {
        showOrderModal(order);
      }
      if (target.classList.contains("btn-edit")) {
        editOrderStatus(row, order, index);
      }
      if (target.classList.contains("btn-delete")) {
        if (
          confirm(
            `Bạn có chắc chắn muốn xóa TOÀN BỘ đơn hàng [${order.id}] không?`
          )
        ) {
          masterOrders.splice(index, 1);
          saveMasterOrders();
          loadOrders();
        }
      }
    });
  }

  /**
   * (ĐÃ CẬP NHẬT) Hàm riêng cho việc sửa trạng thái
   */
  function editOrderStatus(row, order, index) {
    // LƯU TRẠNG THÁI GỐC để kiểm tra
    const originalStatus = order.status;

    // === (ĐÃ SỬA) Cập nhật lại đúng chỉ số cột ===
    const originalStatusCell = row.children[5].innerHTML; // Cột 5 là Trạng thái
    const originalActionCell = row.children[7].innerHTML; // Cột 7 là Hành động
    
    row.classList.add("editing");

    // Thay đổi ô trạng thái (cột 5)
    row.children[5].innerHTML = `
      <select class="order-status" style="width: 100%;">
        <option value="processing" ${
          order.status === "processing" ? "selected" : ""
        }>Đang xử lý</option>
        <option value="delivered" ${
          order.status === "delivered" ? "selected" : ""
        }>Đã giao</option>
        <option value="canceled" ${
          order.status === "canceled" ? "selected" : ""
        }>Đã hủy</option>
      </select>
    `;

    // Thay đổi ô hành động (cột 7)
    row.children[7].innerHTML = `
        <button class="btn-save" style="background: #27ae60;">Lưu</button>
        <button class="btn-cancel" style="background: #7f8c8d;">Hủy</button>
    `;

    // Gắn sự kiện cho nút Lưu/Hủy
    const saveBtn = row.querySelector(".btn-save");
    const cancelBtn = row.querySelector(".btn-cancel");
    const statusSelect = row.querySelector(".order-status");

    saveBtn.onclick = () => {
      const newStatus = statusSelect.value;

      // LOGIC TỒN KHO: Xử lý cả Giảm và Hoàn tác
      
      // Trường hợp 1: Giảm tồn kho (Chuyển từ KHÔNG delivered sang delivered)
      if (newStatus === 'delivered' && originalStatus !== 'delivered') {
          updateStockFromOrder(order); // GIẢM TỒN KHO
      }
      
      // Trường hợp 2: Hoàn tác tồn kho (Chuyển từ delivered sang KHÁC delivered)
      if (originalStatus === 'delivered' && newStatus !== 'delivered') {
          undoStockFromOrder(order); // HOÀN TÁC (CỘNG LẠI) TỒN KHO
      }

      masterOrders[index].status = newStatus;
      saveMasterOrders();
      loadOrders();
    };

    cancelBtn.onclick = () => {
      row.classList.remove("editing");
      // Khôi phục cột 5 và 7
      row.children[5].innerHTML = originalStatusCell;
      row.children[7].innerHTML = originalActionCell;
    };
  }

  // Khởi chạy
  loadOrders();
  attachAllRowEvents();
});



