/* =========================================
 * FILE: script.js (PHIÊN BẢN TỐI ƯU + VALIDATION GIÁ V2)
 * ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // === KEY LƯU TRỮ ===
  const USER_STORAGE_KEY = "soi_registered_user";
  const CART_STORAGE_KEY = "soiStuCart";
  const SEARCH_HISTORY_KEY = "soi_search_history";
  const CURRENT_USER_KEY = "soi_current_user";

  // === BIẾN TOÀN CỤC ===
  const productListContainer = document.querySelector(".product-list");
  const paginationUl = document.querySelector(".paganigation-ul");
  const noProductMessage = document.querySelector(".no-product-search");

  const allProducts = loadProducts();
  let currentProducts = allProducts;
  let currentPage = 1;
  const productsPerPage = 8;

  // --- Biến Lọc (Filter) ---
  const filterButton = document.querySelector(".filter");
  const searchFilterBox = document.getElementById("search-filter-box");
  const filterOptions = document.querySelectorAll(".filter-option-label");
  const applyFilterButton = searchFilterBox
    ? searchFilterBox.querySelector(".btn-apply-filter")
    : null;
  const categoryCheckboxes = document.querySelectorAll(
    'input[name="category"]'
  );
  const sizeCheckboxes = document.querySelectorAll('input[name="size"]');
  const minPriceInput = document.getElementById("min-price");
  const maxPriceInput = document.getElementById("max-price");

  // --- Biến Thanh Danh mục ---
  const categoryBarLinks = document.querySelectorAll(".category-bar ul li a");

  // --- Biến Modal Chi tiết sản phẩm ---
  const productModal = document.getElementById("product-modal");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalImage = document.getElementById("modal-product-image");
  const modalName = document.getElementById("modal-product-name");
  const modalPrice = document.getElementById("modal-product-price");

  // --- Biến Giỏ hàng ---
  const addToCartButton = productModal
    ? productModal.querySelector(".btn-add-to-cart")
    : null;
  const quantityInput = productModal
    ? productModal.querySelector(".quantity-input")
    : null;
  const minusBtn = productModal
    ? productModal.querySelector('.quantity-btn[data-action="decrease"]')
    : null;
  const plusBtn = productModal
    ? productModal.querySelector('.quantity-btn[data-action="increase"]')
    : null;
  const cartCountBadge = document.querySelector(".cart-count");

  let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  let currentModalProductId = null;

  // --- Biến Modal Cảnh báo ---
  const alertModal = document.getElementById("alert-modal");
  const alertMessage = document.getElementById("alert-message");
  const alertCloseBtn = document.getElementById("alert-close-btn");

  // --- Biến Tìm kiếm ---
  const searchInput = document.getElementById("search-input");
  const suggestionsBox = document.getElementById("search-suggestions-box");
  const historyContainer = document.getElementById("search-history-container");
  const historyList = document.getElementById("search-history-list");
  const suggestionContainer = document.getElementById(
    "search-suggestion-container"
  );
  const suggestionList = document.getElementById("search-suggestion-list");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  let searchHistory =
    JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];

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

  function showAlert(message) {
    if (alertMessage) alertMessage.innerText = message;
    if (alertModal) alertModal.style.display = "block";
    if (modalOverlay) modalOverlay.style.display = "block";
  }

  function hideAlert() {
    if (alertModal) alertModal.style.display = "none";
    if (productModal && productModal.style.display !== "block") {
      if (modalOverlay) modalOverlay.style.display = "none";
    }
  }
  if (alertCloseBtn) alertCloseBtn.addEventListener("click", hideAlert);

  function loadProducts() {
    const ADMIN_PRODUCT_KEY = "productsData";
    const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
    let loadedProducts = [];
    let adminData = localStorage.getItem(ADMIN_PRODUCT_KEY);

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
    } else if (typeof products !== "undefined" && products.length > 0) {
      loadedProducts = products
        .filter((product) => product.isHidden !== true)
        .map((item) => {
          let normalizedSize = Array.isArray(item.size) ? item.size : [];
          return { ...item, size: normalizedSize };
        });
    }
    return loadedProducts;
  }

  // === HÀM GIỎ HÀNG ===
  function updateCartCount() {
    if (!cartCountBadge) return;
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountBadge.innerText = totalItems;
    cartCountBadge.classList.toggle("hidden", totalItems <= 0);
  }
  function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
  function setupQuantitySelector() {
    if (!minusBtn || !plusBtn || !quantityInput) return;
    minusBtn.addEventListener("click", () => {
      let currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
    plusBtn.addEventListener("click", () => {
      let currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
    });
    quantityInput.addEventListener("change", function () {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) {
        this.value = 1;
      }
    });
  }
  function handleAddToCart() {
    if (!localStorage.getItem(CURRENT_USER_KEY)) {
      showAlert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }
    const productId = currentModalProductId;
    const product = allProducts.find((p) => p.id == productId);
    if (!product) return;

    const selectedSizeEl = productModal.querySelector(".size-option.active");
    if (!selectedSizeEl) {
      showAlert("Vui lòng chọn size");
      return;
    }
    const size = selectedSizeEl.innerText;
    const requestedQuantity = parseInt(quantityInput.value);

    const sizeData = product.size.find((s) => s.name === size);
    if (!sizeData || sizeData.quantity <= 0) {
      showAlert("Xin lỗi, size này đã hết hàng.");
      return;
    }

    const stockForThisSize = sizeData.quantity;
    const existingItem = cart.find(
      (item) => item.id == productId && item.size === size
    );
    const quantityInCart = existingItem ? existingItem.quantity : 0;

    if (quantityInCart + requestedQuantity > stockForThisSize) {
      showAlert(
        `Xin lỗi, bạn chỉ có thể mua tối đa ${stockForThisSize} sản phẩm (Size ${size}) này. (Trong giỏ hàng của bạn đã có ${quantityInCart} cái).`
      );
      return;
    }

    if (existingItem) {
      existingItem.quantity += requestedQuantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
        quantity: requestedQuantity,
      });
    }

    saveCart();
    updateCartCount();
    closeAllModals();
    showAlert(
      `Đã thêm ${requestedQuantity} x ${product.name} (Size ${size}) vào giỏ hàng!`
    );
  }

  // === HÀM RENDER ===
  function renderProducts(page, productsToShow) {
    if (!productListContainer || !noProductMessage) return;

    productListContainer.innerHTML = "";
    const hasProducts = productsToShow.length > 0;

    noProductMessage.classList.toggle("hidden", hasProducts);
    productListContainer.style.display = hasProducts ? "grid" : "none";
    if (paginationUl)
      paginationUl.style.display = hasProducts ? "flex" : "none";

    if (!hasProducts) return;

    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsForThisPage = productsToShow.slice(startIndex, endIndex);

    productsForThisPage.forEach((product) => {
      const productHTML = `
                <div class="product-item" data-product-id="${
                  product.id
                }" data-category="${product.category}">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">${formatPrice(product.price)}</p>
                    </div>
                </div>
            `;
      productListContainer.insertAdjacentHTML("beforeend", productHTML);
    });
  }

  function setupPagination(productsToPaginate) {
    if (!paginationUl) return;
    paginationUl.innerHTML = "";
    const pageCount = Math.ceil(productsToPaginate.length / productsPerPage);

    if (pageCount <= 1) {
      paginationUl.style.display = "none";
      return;
    }
    paginationUl.style.display = "flex";

    for (let i = 1; i <= pageCount; i++) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.innerText = i;
      a.dataset.page = i;
      if (i === currentPage) a.classList.add("active");

      a.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = parseInt(e.target.dataset.page);
        renderProducts(currentPage, currentProducts);

        paginationUl.querySelector("a.active")?.classList.remove("active");
        e.target.classList.add("active");
        if (productListContainer)
          productListContainer.scrollIntoView({ behavior: "smooth" });
      });
      li.appendChild(a);
      paginationUl.appendChild(li);
    }
  }

  // ===================================
  // === TỐI ƯU HÓA LOGIC LỌC (CÓ VALIDATION) ===
  // ===================================

  /**
   * HÀM LỌC TỔNG (BỘ NÃO)
   * SỬA ĐỔI: Trả về true (thành công) hoặc false (lỗi)
   */
  function applyAllFilters() {
    // 1. Lấy giá trị từ TÌM KIẾM
    const searchTerm = searchInput.value.trim().toLowerCase();

    // 2. Lấy giá trị từ THANH DANH MỤC
    const activeCategoryBtn = document.querySelector(
      ".category-bar ul li a.active"
    );
    const categoryBarValue = activeCategoryBtn
      ? activeCategoryBtn.textContent.trim()
      : "Shop All";

    // 3. Lấy giá trị từ BỘ LỌC DROPDOWN
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    const selectedSizes = Array.from(sizeCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    // === BẮT ĐẦU VALIDATION GIÁ ===

    const minVal = parseFloat(minPriceInput.value);
    const maxVal = parseFloat(maxPriceInput.value);

    minPriceInput.classList.remove("price-input-error");
    maxPriceInput.classList.remove("price-input-error");

    // Kiểm tra nếu CẢ HAI đều có giá trị VÀ Min > Max
    if (minVal && maxVal && minVal > maxVal) {
      minPriceInput.classList.add("price-input-error");
      maxPriceInput.classList.add("price-input-error");
      return false; // <-- SỬA ĐỔI: Trả về lỗi
    }

    const minPrice = minVal || 0;
    const maxPrice = maxVal || Infinity;

    // === KẾT THÚC VALIDATION GIÁ ===

    let filteredProducts = allProducts;

    // A. Lọc theo TÌM KIẾM (Tên sản phẩm)
    if (searchTerm) {
      filteredProducts = filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    // B. Lọc theo THANH DANH MỤC
    if (categoryBarValue !== "Shop All") {
      let categoryFilterValue = categoryBarValue;
      if (categoryFilterValue === "Jackets") categoryFilterValue = "Jacket";
      if (categoryFilterValue === "T-Shirts") categoryFilterValue = "T-Shirt";
      if (categoryFilterValue === "Polos") categoryFilterValue = "Polo";
      if (categoryFilterValue === "Shirts") categoryFilterValue = "Shirt";

      filteredProducts = filteredProducts.filter(
        (p) => p.category === categoryFilterValue
      );
    }

    // C. Lọc theo DANH MỤC (Dropdown)
    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // D. Lọc theo SIZE (Dropdown)
    if (selectedSizes.length > 0) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.size &&
          product.size.some(
            (sizeData) =>
              selectedSizes.includes(sizeData.name) && sizeData.quantity > 0
          )
      );
    }

    // E. Lọc theo GIÁ (Dropdown)
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );

    // Cập nhật sản phẩm hiện tại và render lại
    currentProducts = filteredProducts;
    currentPage = 1;
    renderProducts(currentPage, currentProducts);
    setupPagination(currentProducts);

    return true; // <-- SỬA ĐỔI: Trả về thành công
  }

  /**
   * Gắn sự kiện cho THANH DANH MỤC
   */
  function setupCategoryBar() {
    categoryBarLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        categoryBarLinks.forEach((a) => a.classList.remove("active"));
        e.target.classList.add("active");

        categoryCheckboxes.forEach((cb) => {
          cb.checked = false;
          const label = cb.closest(".filter-option-label");
          if (label) label.classList.remove("selected");
        });

        applyAllFilters();
      });
    });
  }

  /**
   * Gắn sự kiện cho BỘ LỌC DROPDOWN
   */
  function setupFilterInteractions() {
    // 1. Logic Mở/Đóng Filter Dropdown
    if (filterButton && searchFilterBox) {
      filterButton.addEventListener("click", function (e) {
        e.stopPropagation();
        searchFilterBox.classList.toggle("hidden");
        if (suggestionsBox) suggestionsBox.classList.add("hidden");
      });
    }

    // 2. Logic Nút Apply (SỬA ĐỔI)
    if (applyFilterButton) {
      applyFilterButton.addEventListener("click", function () {
        // Gọi hàm lọc tổng VÀ LẤY KẾT QUẢ
        const filterSuccess = applyAllFilters();

        // Chỉ đóng tab nếu lọc thành công (không có lỗi min > max)
        if (filterSuccess) {
          if (searchFilterBox) searchFilterBox.classList.add("hidden");
        }
        // Nếu filterSuccess == false, không làm gì cả, tab sẽ tự động ở lại.
      });
    }

    // 3. Logic Highlight
    filterOptions.forEach((label) => {
      const checkbox = label.querySelector('input[type="checkbox"]');
      if (!checkbox) return;
      const updateSelectedClass = () => {
        label.classList.toggle("selected", checkbox.checked);
      };
      updateSelectedClass();
      checkbox.addEventListener("change", updateSelectedClass);
    });
  }

  // === HÀM MODAL ===
  function openProductModal(productId) {
    if (!productModal) return;
    const product = allProducts.find((p) => p.id == productId);
    if (!product) return;

    currentModalProductId = product.id;
    if (quantityInput) quantityInput.value = 1;
    if (modalImage) modalImage.src = product.image;
    if (modalName) modalName.innerText = product.name;
    if (modalPrice) modalPrice.innerText = formatPrice(product.price);

    const stockInfo = productModal.querySelector("#modal-stock-info");
    if (stockInfo) {
      stockInfo.innerText = "Vui lòng chọn size để xem tồn kho";
      stockInfo.style.color = "#555";
    }

    const sizeSelector = productModal.querySelector(".size-selector");
    if (sizeSelector) {
      sizeSelector.innerHTML = "";
      let hasAvailableSizes = false;

      product.size.forEach((sizeData) => {
        const sizeName = sizeData.name;
        const stock = sizeData.quantity;

        if (stock > 0) {
          hasAvailableSizes = true;
          const sizeSpan = document.createElement("span");
          sizeSpan.classList.add("size-option");
          sizeSpan.innerText = sizeName;

          sizeSpan.addEventListener("click", () => {
            sizeSelector
              .querySelectorAll(".size-option")
              .forEach((s) => s.classList.remove("active"));
            sizeSpan.classList.add("active");

            if (stockInfo) {
              stockInfo.innerText = `Còn lại: ${stock} sản phẩm`;
              if (stock <= 5) {
                stockInfo.style.color = "#e74c3c";
                stockInfo.innerText += " (Sắp hết!)";
              } else {
                stockInfo.style.color = "#027f4f";
              }
            }
          });
          sizeSelector.appendChild(sizeSpan);
        }
      });

      if (!hasAvailableSizes) {
        sizeSelector.innerText = "Sản phẩm đã hết hàng";
        if (stockInfo) stockInfo.innerText = "";
      }
    }

    productModal.style.display = "block";
    if (modalOverlay) modalOverlay.style.display = "block";
  }

  function closeAllModals() {
    if (productModal) productModal.style.display = "none";
    if (searchFilterBox) searchFilterBox.classList.add("hidden");
    hideAlert();
    if (modalOverlay) modalOverlay.style.display = "none";
    currentModalProductId = null;
  }

  // === CÁC HÀM TÌM KIẾM ===
  function saveSearchHistory() {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
  }
  function addSearchTerm(term) {
    const cleanedTerm = term.trim().toLowerCase();
    if (cleanedTerm === "") return;
    searchHistory = searchHistory.filter(
      (item) => item.toLowerCase() !== cleanedTerm
    );
    searchHistory.unshift(cleanedTerm);
    searchHistory = searchHistory.slice(0, 10);
    saveSearchHistory();
  }
  function renderSearchHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";

    if (searchHistory.length === 0) {
      historyList.innerHTML =
        '<li class="no-history">Không có lịch sử tìm kiếm.</li>';
      if (clearHistoryBtn) clearHistoryBtn.style.display = "none";
      return;
    }

    if (clearHistoryBtn) clearHistoryBtn.style.display = "inline-block";
    searchHistory.forEach((term) => {
      const li = document.createElement("li");
      li.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> <span>${term}</span>`;
      li.addEventListener("click", () => {
        searchInput.value = term;
        applyAllFilters();
        hideSuggestionsBox();
      });
      historyList.appendChild(li);
    });
  }
  function renderSuggestions(searchTerm) {
    if (!suggestionList) return;
    suggestionList.innerHTML = "";
    if (searchTerm === "") return;

    const matchedProducts = allProducts
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);

    if (matchedProducts.length === 0) {
      suggestionList.innerHTML = "<li>Không tìm thấy sản phẩm.</li>";
      return;
    }

    matchedProducts.forEach((product) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <span>${product.name}</span>
            `;
      li.addEventListener("click", () => {
        searchInput.value = product.name;
        addSearchTerm(product.name.trim());
        applyAllFilters();
        hideSuggestionsBox();
      });
      suggestionList.appendChild(li);
    });
  }
  function showSuggestionsBox(mode) {
    if (!suggestionsBox || !historyContainer || !suggestionContainer) return;
    if (searchFilterBox) searchFilterBox.classList.add("hidden");

    if (mode === "history") {
      renderSearchHistory();
      historyContainer.classList.remove("hidden");
      suggestionContainer.classList.add("hidden");
    } else {
      renderSuggestions(searchInput.value.trim().toLowerCase());
      historyContainer.classList.add("hidden");
      suggestionContainer.classList.remove("hidden");
    }
    suggestionsBox.classList.remove("hidden");
  }
  function hideSuggestionsBox() {
    if (suggestionsBox) suggestionsBox.classList.add("hidden");
  }

  /**
   * Gắn sự kiện cho THANH TÌM KIẾM
   */
  function setupSearchListeners() {
    if (!searchInput) return;

    // Lọc KHI GÕ PHÍM
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim().toLowerCase();
      if (searchTerm.length > 0) {
        showSuggestionsBox("suggestions");
      } else {
        showSuggestionsBox("history");
      }
      applyAllFilters();
    });

    // Hiển thị lịch sử KHI CLICK VÀO
    searchInput.addEventListener("focus", () => {
      if (searchFilterBox) searchFilterBox.classList.add("hidden");
      const searchTerm = searchInput.value.trim().toLowerCase();
      if (searchTerm.length > 0) {
        showSuggestionsBox("suggestions");
      } else {
        showSuggestionsBox("history");
      }
    });

    // Xử lý ENTER
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSearchTerm(searchInput.value.trim());
        applyAllFilters();
        hideSuggestionsBox();
        searchInput.blur();
      }
    });

    // Nút XÓA LỊCH SỬ
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        searchHistory = [];
        saveSearchHistory();
        renderSearchHistory();
      });
    }

    // Đóng hộp gợi ý KHI CLICK BÊN NGOÀI
    document.addEventListener("click", (e) => {
      const searchWrapper = document.querySelector(".search-wrapper");
      if (searchWrapper && !searchWrapper.contains(e.target)) {
        hideSuggestionsBox();
        if (searchFilterBox) searchFilterBox.classList.add("hidden");
      }
    });
  }

  // === KHỞI CHẠY VÀ GẮN SỰ KIỆN ===

  if (allProducts.length === 0) {
    console.error("LỖI: Không tìm thấy sản phẩm.");
    if (noProductMessage) {
      noProductMessage.innerText = "Lỗi tải sản phẩm. Vui lòng thử lại.";
      noProductMessage.classList.remove("hidden");
    }
    return;
  }

  // Khởi chạy tất cả
  setupCategoryBar();
  updateCartCount();
  setupQuantitySelector();
  setupFilterInteractions(); // Gộp logic của index-filter.js vào đây
  setupSearchListeners();

  // Gắn sự kiện click sản phẩm
  if (productListContainer) {
    productListContainer.addEventListener("click", (e) => {
      const productItem = e.target.closest(".product-item");
      if (productItem) {
        if (!localStorage.getItem(CURRENT_USER_KEY)) {
          showAlert("Vui lòng đăng nhập để xem chi tiết sản phẩm");
        } else {
          const productId = productItem.dataset.productId;
          openProductModal(productId);
        }
      }
    });
  }

  // Gắn sự kiện đóng modal chung
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeAllModals);
  if (modalOverlay) modalOverlay.addEventListener("click", closeAllModals);

  // Gắn sự kiện thêm vào giỏ hàng
  if (addToCartButton) {
    addToCartButton.addEventListener("click", handleAddToCart);
  }

  // Gọi hàm lọc tổng lần đầu tiên khi tải trang
  applyAllFilters();

  // === CODE SLIDER (Giữ nguyên) ===
  const imgSliderWrapper = document.querySelector(".image-slider-wrapper");
  const imgSlides = document.querySelectorAll(".image-slide");
  const imgPrevBtn = document.getElementById("slider-prev");
  const imgNextBtn = document.getElementById("slider-next");
  const imgDotsContainer = document.getElementById("slider-dots");

  if (imgSliderWrapper && imgSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = imgSlides.length;
    let slideInterval;

    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("span");
      dot.classList.add("slider-dot");
      dot.addEventListener("click", () => {
        goToSlide(i);
        resetInterval();
      });
      imgDotsContainer.appendChild(dot);
    }

    const dots = document.querySelectorAll(".slider-dot");

    function goToSlide(slideIndex) {
      if (slideIndex < 0) {
        currentSlide = totalSlides - 1;
      } else if (slideIndex >= totalSlides) {
        currentSlide = 0;
      } else {
        currentSlide = slideIndex;
      }
      imgSliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlide);
      });
    }

    if (imgPrevBtn)
      imgPrevBtn.addEventListener("click", () => {
        goToSlide(currentSlide - 1);
        resetInterval();
      });
    if (imgNextBtn)
      imgNextBtn.addEventListener("click", () => {
        goToSlide(currentSlide + 1);
        resetInterval();
      });

    function startInterval() {
      slideInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 5000); // 5 giây
    }
    function resetInterval() {
      clearInterval(slideInterval);
      startInterval();
    }
    goToSlide(0);
    startInterval();
  }
});
