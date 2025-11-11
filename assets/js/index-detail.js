// Lấy các phần tử (elements) của modal
const modal = document.getElementById("product-modal");
const overlay = document.getElementById("modal-overlay");
const closeButton = document.getElementById("modal-close");
const productItems = document.querySelectorAll(".product-item");

// Lấy các phần tử TƯƠNG TÁC CHỈ CÓ TRONG MODAL (chỉ cần lấy 1 lần)
const quantityInput = document.querySelector(".quantity-input");
const minusBtn = document.querySelector(".quantity-btn:first-child");
const plusBtn = document.querySelector(".quantity-btn:last-child");
const cartBtn = document.querySelector(".btn-add-to-cart");
const sizeOptions = document.querySelectorAll(".size-option");

// ===================================
// 1. CÁC HÀM XỬ LÝ (SETUP)
// ===================================

// Xử lý chọn Size (Gắn sự kiện 1 lần)
function setupSizeSelector() {
  sizeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // 1. Xóa class 'active' khỏi tất cả các size
      sizeOptions.forEach((opt) => opt.classList.remove("active"));
      // 2. Thêm class 'active' vào size vừa được click
      this.classList.add("active");
    });
  });
}

// Xử lý tăng/giảm số lượng (Gắn sự kiện 1 lần)
function setupQuantitySelector() {
  minusBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1; // FIX: Chỉ trừ 1
    }
  });

  plusBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1; // FIX: Chỉ cộng 1
  });

  // Ngăn người dùng nhập số âm hoặc số không hợp lệ
  quantityInput.addEventListener("change", function () {
    let value = parseInt(this.value);
    if (isNaN(value) || value < 1) {
      this.value = 1;
    }
  });
}

// Xử lý Add To Cart (Gắn sự kiện 1 lần)
function setupAddToCart() {
  cartBtn.addEventListener("click", function () {
    const productName = document.getElementById("modal-product-name").innerText;
    const selectedSize = document.querySelector(
      ".size-option.active"
    ).innerText;
    const quantity = document.querySelector(".quantity-input").value;

    // LOGIC THỰC TẾ Add to Cart sẽ nằm ở đây
    alert(
      `🛒 Đã thêm vào giỏ hàng: ${productName}, Size: ${selectedSize}, Số lượng: ${quantity}`
    );

    closeModal();
  });
}

// ===================================
// 2. HÀM MỞ/ĐÓNG MODAL
// ===================================

function openModal(productElement) {
  // Lấy thông tin từ sản phẩm được click
  const productName = productElement.querySelector("h3").innerText;
  const productPrice = productElement.querySelector(".price").innerText;
  const productImageSrc = productElement.querySelector(
    ".product-image-container img"
  ).src;

  // Cập nhật thông tin lên modal
  document.getElementById("modal-product-name").innerText = productName;
  document.getElementById("modal-product-price").innerText =
    "Price: " + productPrice;
  document.getElementById("modal-product-image").src = productImageSrc;

  // Đặt lại số lượng về 1 mỗi khi modal mở
  quantityInput.value = 1;

  // Hiển thị modal và lớp phủ
  modal.style.display = "block";
  overlay.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  overlay.style.display = "none";
}

// ===================================
// 3. LOGIC KHỞI TẠO (CHẠY 1 LẦN)
// ===================================

// Gắn các sự kiện tương tác CHỈ MỘT LẦN khi trang tải
setupSizeSelector();
setupQuantitySelector();
setupAddToCart();

// Gắn sự kiện mở modal cho từng sản phẩm
productItems.forEach((item) => {
  item.addEventListener("click", function (e) {
    e.stopPropagation();
    openModal(this);
  });
});

// Gắn sự kiện đóng modal
closeButton.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
