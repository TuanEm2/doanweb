document.addEventListener("DOMContentLoaded", () => {
    // 1. Khai báo các biến DOM và hằng số
    const productsTableBody = document.querySelector("#stockTable tbody"); 
    const filterSelect = document.getElementById("stockFilterType"); 
    const searchInput = document.getElementById("stockSearchInput"); 

    const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]; 
    const PRODUCTS_STORAGE_KEY = 'productsData';
    let iTems = getiTems(); 

    // DOM cho Modal Tồn kho
    const stockModal = document.getElementById('stockModal');
    const closeBtn = stockModal?.querySelector('.close-btn');
    const modalSizeDetails = document.getElementById('modalSizeDetails');
    const modalProductName = document.getElementById('modalProductName');

    function getiTems() {
        let items = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || (typeof products !== 'undefined' ? products : []);
        items = items.map(item => ({
            ...item,
            isHidden: item.isHidden !== undefined ? item.isHidden : false 
        }));
        return items;
    }

    // ====================== HELPERS ======================

    const fixImagePath = path => path || "assets/images/no-image.png";
    const formatVN = num => num.toLocaleString("vi-VN");

    /**
     * LỌC DỮ LIỆU
     */
    const applyFiltersAndSearch = (data) => {
        let result = data;
        const selectedType = filterSelect?.value || "all";
        const keyword = searchInput?.value.toLowerCase().trim() || "";
        
        if (selectedType !== "all") {
            result = result.filter(p => p.category === selectedType);
        }

        if (keyword) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(keyword) || 
                p.category.toLowerCase().includes(keyword) ||
                p.id.toString().includes(keyword)
            );
        }
        return result;
    };

    /**
     * Tạo HTML cho cột Tồn kho (Nút Xem Tồn Kho)
     */
    const createSizeDetailsHTML = (sizeArray, productId) => {
        const sizes = Array.isArray(sizeArray) ? sizeArray : []; 
        const availableSizes = sizes.filter(s => s.quantity > 0); 
        const availableCount = availableSizes.length;
        const totalStock = sizes.reduce((sum, s) => sum + s.quantity, 0);

        if (totalStock === 0) {
            return '<span style="color: red; font-weight: bold;">Hết hàng</span>';
        }

        return `
            <button 
                class="btn-show-stock-modal" 
                data-product-id="${productId}" 
                data-count="${availableCount}"
                title="Xem chi tiết tồn kho"
            >
                Xem tồn kho (${availableCount} size)
            </button>
        `;
    };

    /**
     * Hiển thị Modal chi tiết tồn kho
     */
    const showStockModal = (productId) => {
        const product = iTems.find(p => p.id == productId);
        
        if (!product || !stockModal) return;

        const availableSizes = product.size ? product.size.filter(s => s.quantity > 0) : [];
        const LOW_STOCK_THRESHOLD = 3;
        
        const detailsList = availableSizes.map(s => {
            const isLowStock = s.quantity < LOW_STOCK_THRESHOLD; 
            const lowStockTag = isLowStock 
                ? `<span style="color: #ffc107; font-weight: bold; margin-left: 10px;">(Sắp hết hàng)</span>` 
                : '';
                
            return `
                <li>
                    <strong>Size ${s.name}</strong>: ${formatVN(s.quantity)} chiếc
                    ${lowStockTag}
                </li>
            `;
        }).join('');

        modalProductName.textContent = product.name;
        modalSizeDetails.innerHTML = `<ul>${detailsList}</ul>`;

        stockModal.style.display = "block";
    };

    // ====================== RENDER BẢNG TỒN KHO ======================
    const renderStockTable = () => { 
        productsTableBody.innerHTML = "";
        iTems = getiTems(); // Lấy lại iTems (dữ liệu sản phẩm)
        
        let filteredItems = applyFiltersAndSearch(iTems);
        const sortedItems = filteredItems.sort((a, b) => b.id - a.id); 

        sortedItems.forEach((p) => {
            const stockDetailsHTML = createSizeDetailsHTML(p.size, p.id);
            
            const row = document.createElement("tr");
            
            // 5 CỘT (LOẠI BỎ HÀNH ĐỘNG)
            row.innerHTML = `
                <td>${p.id}</td>
                <td><img src="${fixImagePath(p.image)}" alt="product" style="width:60px;height:60px;object-fit:cover;border-radius:6px;"></td>
                <td style="text-align: left;">${p.name}</td>
                <td>${p.category}</td>
                <td>${stockDetailsHTML}</td>
            `; 
            
            productsTableBody.appendChild(row);
        });
    };

    // ====================== LISTENERS ======================
    
    filterSelect?.addEventListener("change", renderStockTable); 
    searchInput?.addEventListener("input", renderStockTable);

    // Gắn sự kiện click cho các nút xem tồn kho (Modal)
    productsTableBody?.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-show-stock-modal')) {
            const productId = e.target.getAttribute('data-product-id');
            showStockModal(productId);
        }
    });

    // Logic đóng modal: 1. Nút (X)
    closeBtn?.addEventListener('click', () => {
        stockModal.style.display = "none";
    });

    // Logic đóng modal: 2. Click ra ngoài modal
    window.addEventListener('click', (e) => {
        if (e.target === stockModal) {
            stockModal.style.display = "none";
        }
    });

    // Cập nhật chéo từ các tab khác
    document.addEventListener('productsDataUpdated', () => {
        iTems = getiTems(); 
        renderStockTable();
    });

    // ====================== INIT ======================
    if (filterSelect) filterSelect.value = "all";
    if (searchInput) searchInput.value = "";
    renderStockTable();
});