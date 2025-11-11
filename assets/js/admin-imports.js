document.addEventListener("DOMContentLoaded", () => {
    // 1. KHAI BÁO CÁC BIẾN DOM VÀ HẰNG SỐ
    const importsTableBody = document.querySelector("#importsTable tbody");
    const addImportBtn = document.querySelector(".add-import-btn");
    
    // === BIẾN LỌC ===
    const searchImportInput = document.getElementById("searchImport");
    const filterImportStatus = document.getElementById("filterImportStatus"); 
    const importStartDateInput = document.getElementById("importStartDate"); 
    const importEndDateInput = document.getElementById("importEndDate");     
    const filterImportDateBtn = document.getElementById("filterImportDateBtn"); 
    // ======================================

    const IMPORTS_STORAGE_KEY = 'importsData';
    const PRODUCTS_STORAGE_KEY = 'productsData';
    const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]; 

    const FIXED_COST_PRICES = {
        "Jacket": 5000000,
        "Polo": 3000000,
        "T-Shirt": 3000000,
        "Shirt": 4000000
    };  

    // Lấy Giá vốn cố định theo loại sản phẩm
    const getFixedCostPrice = (category) => {
        return FIXED_COST_PRICES[category] || 0;
    };
    
    // Tạo chuỗi HTML cho các option Size
    const SIZES_OPTIONS_HTML = SIZES.map(s => `<option value="${s}">${s}</option>`).join('');

    
    // ====================== DỮ LIỆU & LƯU TRỮ ======================
    let importItems = getImportItems();
    let productItems; // Khai báo toàn cục, sẽ được gán trong refreshProductItems()

    function saveProducts() {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productItems));
        // Kích hoạt sự kiện để các tab khác (như admin-products, admin-stock) cập nhật
        document.dispatchEvent(new Event('productsDataUpdated'));
    }
    
    function getImportItems() {
        // Đảm bảo trả về mảng nếu localStorage trống
        const storedImports = localStorage.getItem(IMPORTS_STORAGE_KEY);
        if (storedImports) {
            return JSON.parse(storedImports);
        }
        return (typeof imports !== 'undefined' && Array.isArray(imports)) ? imports : [];
    }

    function saveImportItems() {
        localStorage.setItem(IMPORTS_STORAGE_KEY, JSON.stringify(importItems));
    }

    function getProducts() {
        // Luôn tải lại dữ liệu sản phẩm mới nhất từ localStorage
        let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || (typeof window.products !== 'undefined' ? window.products : []);
        return products;
    }
    
    // ====================== HELPERS ======================
    /**
     * Cập nhật biến productItems và trả về danh sách sản phẩm mới nhất.
     */
    function refreshProductItems() {
        // Cập nhật biến toàn cục productItems
        productItems = getProducts();
        return productItems;
    }


    const getNextImportId = () => {
        const currentImports = getImportItems(); 
        const initialId = 1; 
        
        if (!Array.isArray(currentImports) || currentImports.length === 0) return initialId;
        
        const maxId = currentImports.reduce((max, item) => {
            const currentId = parseInt(item.importId);
            return currentId > max ? currentId : max;
        }, initialId - 1); 
        
        return maxId + 1;
    };

    const formatVN = num => num.toLocaleString("vi-VN");

    /**
     * Parse date từ format ISO (yyyy-mm-dd).
     * Trả về ngày bắt đầu của ngày đó.
     */
    function parseDate(isoString) {
        if (!isoString) return null;
        const date = new Date(isoString);
        // Kiểm tra tính hợp lệ
        if (isNaN(date)) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    /**
     * Hàm CỘNG DỒN TỒN KHO vào sản phẩm gốc (Chỉ gọi khi Hoàn thành)
     */
    function updateStockFromImport(item) {
        const product = productItems.find(p => p.id === item.productId);

        if (!product) {
            console.error(`Sản phẩm ID ${item.productId} không tồn tại.`);
            return false;
        }

        // 1. CẬP NHẬT TỒN KHO SẢN PHẨM (Logic cộng dồn)
        // Đảm bảo mảng size tồn tại
        if (!product.size) { 
             product.size = [];
        }
        
        let sizeObj = product.size.find(s => s.name === item.size);

        if (sizeObj) {
            sizeObj.quantity += item.quantity;
        } else {
            product.size.push({ name: item.size, quantity: item.quantity });
        }
        
        item.status = 'completed'; // Đánh dấu là Hoàn thành
        
        saveProducts(); // LƯU DỮ LIỆU SẢN PHẨM ĐÃ CỘNG DỒN
        saveImportItems();
        
        return true;
    }
    
    /**
     * Hàm HOÀN TÁC TỒN KHO (Chỉ chạy khi xóa phiếu đã Hoàn thành)
     */
    function undoStockFromImport(item) {
        const product = productItems.find(p => p.id === item.productId);

        if (product) {
            const sizeObj = product.size.find(s => s.name === item.size);
            if (sizeObj) {
                // Giảm số lượng tồn kho (và đảm bảo không bị âm)
                sizeObj.quantity = Math.max(0, sizeObj.quantity - item.quantity);
                
                // Dọn dẹp mảng size nếu số lượng tồn kho về 0
                product.size = product.size.filter(s => s.quantity > 0);
            }
            saveProducts(); // Lưu thay đổi tồn kho
        } 
    }


    /**
     * Hàm Xóa Phiếu Nhập (Bao gồm Hoàn tác tồn kho nếu đã HT)
     */
    function deleteImport(importId) {
        const importIndex = importItems.findIndex(item => item.importId === importId);
        const item = importItems[importIndex];
        
        if (!confirm(`Bạn có chắc chắn muốn xóa phiếu nhập [${importId}] không?`)) {
            return;
        }
        
        if (item.status === 'completed') {
            // Thao tác Xóa phiếu đã HT phải HOÀN TÁC TỒN KHO
            undoStockFromImport(item);
             alert("✅ Phiếu nhập đã xóa và tồn kho đã được hoàn tác!");
        } else {
            alert("✅ Phiếu nhập đang chờ đã được xóa.");
        }

        importItems.splice(importIndex, 1);
        saveImportItems();
        renderImports();
    }
    
    /**
     * Kiểm tra xem ngày có phải là quá khứ hay không (trước ngày hôm nay).
     * @param {string} dateString - Ngày ở định dạng ISO (yyyy-mm-dd).
     * @returns {boolean} True nếu ngày hợp lệ (ngày hôm nay hoặc tương lai), False nếu là quá khứ.
     */
    function isFutureOrToday(dateString) {
        if (!dateString) return false;
        
        // Tạo đối tượng Date cho ngày nhập (đặt giờ về 00:00:00)
        const inputDate = new Date(dateString);
        inputDate.setHours(0, 0, 0, 0); 
        
        // Tạo đối tượng Date cho ngày hôm nay (đặt giờ về 00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        // Kiểm tra: Ngày nhập phải lớn hơn hoặc bằng ngày hôm nay
        return inputDate >= today;
    }

    // ====================== FILTER FUNCTION ======================
    
    const applyImportFilters = (data) => {
        const keyword = searchImportInput?.value.toLowerCase().trim() || "";
        const statusValue = filterImportStatus?.value.toLowerCase() || "all";
        const start = importStartDateInput?.value ? parseDate(importStartDateInput.value) : null;
        const end = importEndDateInput?.value ? parseDate(importEndDateInput.value) : null;

        if (end) end.setHours(23, 59, 59, 999); // Đặt cuối ngày

        return data.filter(item => {
            // 1. Lọc theo TỪ KHÓA
            const matchesKeyword = !keyword || 
                                   String(item.importId).includes(keyword) ||
                                   String(item.productId).includes(keyword) ||
                                   item.productName.toLowerCase().includes(keyword);

            // 2. Lọc theo TRẠNG THÁI
            const matchesStatus = statusValue === "all" || item.status === statusValue;

            // 3. Lọc theo NGÀY
            let matchesDate = true;
            if (start || end) {
                const itemDate = parseDate(item.importDate); 
                if (itemDate) {
                    if (start && itemDate < start) matchesDate = false;
                    if (end && itemDate > end) matchesDate = false;
                } else {
                    matchesDate = false; 
                }
            }

            return matchesKeyword && matchesStatus && matchesDate;
        });
    };


    // ====================== RENDER IMPORTS ======================

    const renderImports = () => {
        refreshProductItems();
        importsTableBody.innerHTML = "";
        
        let filteredImports = applyImportFilters(importItems); 
        
        filteredImports.sort((a, b) => b.importId - a.importId)
                       .forEach(item => {
            const row = document.createElement("tr");
            row.dataset.id = item.importId;
            
            // --- LOGIC HIỂN THỊ TRẠNG THÁI & HÀNH ĐỘNG ---
            const isCompleted = item.status === 'completed';
            const statusHTML = isCompleted 
                ? `<span style="color: green; font-weight: bold;">Đã HT</span>`
                : `<span style="color: orange; font-weight: bold;">Đang chờ</span>`;

            const actionHTML = isCompleted 
                ? `
                    <button class="btn-delete-import btn-delete" data-id="${item.importId}">Xóa</button> 
                    <span style="color:#555; margin-left: 10px;">| Đã HT</span>
                  `
                : `
                    <button class="btn-complete-import btn-save-inline" data-id="${item.importId}">Hoàn thành</button>
                    <button class="btn-edit-import btn-edit" data-id="${item.importId}">Sửa</button> 
                    <button class="btn-delete-import btn-delete" data-id="${item.importId}">Xóa</button> 
                `;
            // ----------------------------------------------

            row.innerHTML = `
                <td>${item.importId}</td>
                <td>${item.productId}</td>
                <td>${item.productName}</td>
                <td>${item.size}</td>
                <td>${formatVN(item.quantity)}</td>
                <td>${formatVN(item.importPrice)} VNĐ</td>
                <td>${item.importDate}</td>
                <td class="import-status">${statusHTML}</td> 
                <td data-id="${item.importId}" class="action-column">
                    ${actionHTML} 
                </td>
            `;
            importsTableBody.appendChild(row);
        });
    };

    
    // ====================== ADD IMPORT LOGIC ======================
    
    addImportBtn?.addEventListener("click", () => {
        const transactionId = getNextImportId(); 
        const currentDate = new Date().toISOString().slice(0, 10);

        const latestProducts = refreshProductItems();
        
        const productOptions = latestProducts.map(p => 
            `<option value="${p.id}">${p.id} - ${p.name}</option>`
        ).join("");

        const newRow = document.createElement("tr");
        newRow.classList.add("editing");
        newRow.dataset.id = transactionId; 

        newRow.innerHTML = `
            <td>${transactionId}</td>
            <td colspan="2">
                <select id="selectProduct" required style="width: 100%; padding: 5px;">
                    <option value="" disabled selected>-- Chọn Sản phẩm --</option>
                    ${productOptions}
                </select>
            </td>
            <td>
                <select class="selectSize" required style="width: 100%; padding: 5px;">
                    <option value="" disabled selected>-- Size --</option>
                    ${SIZES_OPTIONS_HTML}
                </select>
            </td>
            <td contenteditable="true" class="input-quantity-cell">1</td> 
            <td contenteditable="true" class="input-price-cell">1000</td> 
            <td><input type="date" value="${currentDate}" class="inputDate" style="width: 100%; border: none;"></td>
            <td><span style="color: orange; font-weight: bold;">Đang chờ</span></td>
            <td>
                <button class="btn-save-import btn-save-inline">Lưu</button>
                <button class="btn-cancel-import btn-cancel-inline">Hủy</button>
            </td>
        `;
        
        importsTableBody.insertBefore(newRow, importsTableBody.firstChild); 

        // Logic cuộn
        const headerHeight = 70; 
        const tableTop = importsTableBody.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: tableTop - headerHeight, behavior: "smooth" });

        // Logic Lưu (SAVE IMPORT)
        newRow.querySelector(".btn-save-import").addEventListener("click", () => {
            const selectProduct = newRow.querySelector('#selectProduct');
            const selectedSize = newRow.querySelector('.selectSize').value;

            // ĐỌC DỮ LIỆU AN TOÀN TỪ CONTENTEDITABLE
            const rawQuantity = newRow.querySelector('.input-quantity-cell').textContent.trim();
            const rawPrice = newRow.querySelector('.input-price-cell').textContent.trim();
            
            // SỬA: Đọc số nguyên an toàn
            const quantity = parseInt(rawQuantity.replace(/[^\d]/g, '')) || 0; 
            const importPrice = parseInt(rawPrice.replace(/[^\d]/g, '')) || 0; 
            const date = newRow.querySelector('.inputDate').value;

            const productId = parseInt(selectProduct.value);
            const product = productItems.find(p => p.id === productId); 

            // --- VALIDATION CUỐI CÙNG ---
            if (!product || selectedSize === "") {
                alert("Lỗi: Vui lòng chọn sản phẩm và nhập đầy đủ, hợp lệ");
                return;
            }

            // KIỂM TRA NGÀY MỚI
            if (!isFutureOrToday(date)) {
                alert("❌ Lỗi: Ngày nhập hàng không được là ngày trong quá khứ!");
                return;
            }
            
            const fixedCostPrice = getFixedCostPrice(product.category);

            // KIỂM TRA RÀNG BUỘC GIÁ NHẬP VÀ GIÁ VỐN CỐ ĐỊNH
            if (importPrice !== fixedCostPrice) {
                alert(`❌ Lỗi nhập liệu: Giá nhập (${formatVN(importPrice)} VNĐ) phải bằng Giá Vốn Cố Định (${formatVN(fixedCostPrice)} VNĐ) cho loại sản phẩm ${product.category}.`);
                return; // Dừng lại nếu giá không khớp
            }
            // --- KẾT THÚC VALIDATION ---

            // TẠO PHIẾU NHẬP (Trạng thái Pending)
            const newImport = {
                importId: transactionId, 
                productId: productId,
                productName: product.name,
                size: selectedSize,
                quantity: quantity,
                importPrice: importPrice, 
                importDate: date,
                status: 'pending'
            };
            importItems.push(newImport);
            
            saveImportItems();
            
            renderImports();
            newRow.remove(); 
        });

        // Xử lý Hủy
        newRow.querySelector('.btn-cancel-import')?.addEventListener('click', () => {
            newRow.remove();
        });
    });

    // ====================== SỰ KIỆN HOÀN THÀNH & XÓA & SỬA ======================

    importsTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const row = target.closest('tr'); 
        
        if (!row) return;

        const importId = parseInt(row.dataset.id || target.dataset.id);
        if (isNaN(importId)) return;
        
        const itemIndex = importItems.findIndex(item => item.importId === importId);
        if (itemIndex === -1) return;
        const item = importItems[itemIndex];
        
        // --- 1. HOÀN THÀNH PHIẾU NHẬP (Chuyển trạng thái) ---
        if (target.classList.contains('btn-complete-import')) {
            if (item.status === 'completed') {
                alert("Phiếu nhập này đã được hoàn thành.");
                return;
            }

            if (confirm(`Xác nhận hoàn thành phiếu nhập [${importId}]? Tồn kho sẽ được cộng dồn.`)) {
                if (updateStockFromImport(item)) { // Gọi hàm cập nhật tồn kho
                    alert(`✅ Hoàn thành thành công! Số lượng [${item.quantity}] của sản phẩm [${item.productName}] đã được thêm vào tồn kho.`);
                    renderImports(); 
                } else {
                    alert("❌ Lỗi: Không thể hoàn thành phiếu nhập do không tìm thấy sản phẩm gốc.");
                }
            }
            return;
        }

        // --- 2. XÓA PHIẾU NHẬP (Bao gồm Hoàn tác nếu đã HT) ---
        if (target.classList.contains('btn-delete-import')) {
            deleteImport(importId); 
            return;
        }

        // --- 3. SỬA PHIẾU NHẬP (Triển khai sửa Inline) ---
        if (target.classList.contains('btn-edit-import')) {
            if (item.status === 'completed') {
                alert("Không thể sửa phiếu nhập đã hoàn thành.");
                return;
            }
            
            // Lấy HTML các options sản phẩm (Tương tự ADD)
            const latestProducts = refreshProductItems();
            const productOptions = latestProducts.map(p => 
                `<option value="${p.id}">${p.id} - ${p.name}</option>`
            ).join("");

            // Chuyển hàng sang chế độ chỉnh sửa
            row.classList.add('editing');
            
            row.innerHTML = `
                <td>${item.importId}</td>
                <td colspan="2">
                    <select id="editSelectProduct" class="edit-select-product" style="width: 100%; padding: 5px;">
                        ${productOptions}
                    </select>
                </td>
                <td>
                    <select class="edit-select-size" style="width: 100%; padding: 5px;">
                        ${SIZES.map(s => `<option value="${s}" ${s === item.size ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </td>
                <td contenteditable="true" class="edit-quantity">${item.quantity}</td>
                <td contenteditable="true" class="edit-price">${item.importPrice}</td>
                <td><input type="date" value="${item.importDate}" class="edit-input-date" style="width: 100%; border: none;"></td>
                <td>
                    <span style="color: orange; font-weight: bold;">Đang chờ</span>
                </td>
                <td class="action-column">
                    <button class="btn-save-edit-import btn-save-inline">Lưu</button>
                    <button class="btn-cancel-inline">Hủy</button>
                </td>
            `;

            // Gán giá trị đã chọn cho các selects
            row.querySelector('.edit-select-product').value = item.productId;

            // GẮN SỰ KIỆN LƯU CHỈNH SỬA
            row.querySelector('.btn-save-edit-import').addEventListener('click', () => {
                const newProductId = parseInt(row.querySelector('.edit-select-product').value);
                const newSize = row.querySelector('.edit-select-size').value;
                const newQuantity = parseInt(row.querySelector('.edit-quantity').textContent.replace(/[^0-9]/g, '')) || 0;
                const newPrice = parseInt(row.querySelector('.edit-price').textContent.replace(/[^0-9]/g, '')) || 0; 
                const newDate = row.querySelector('.edit-input-date').value;

                const product = productItems.find(p => p.id === newProductId);

                // Validation cơ bản
                if (!product || newSize === "" || newQuantity <= 0 || newPrice <= 0 || newDate === "") {
                    alert("Lỗi: Dữ liệu sửa không hợp lệ. Vui lòng kiểm tra các trường bắt buộc.");
                    return;
                }

                // KIỂM TRA NGÀY MỚI
                if (!isFutureOrToday(newDate)) {
                    alert("❌ Lỗi: Ngày nhập hàng không được là ngày trong quá khứ!");
                    return;
                }
                
                // === KIỂM TRA RÀNG BUỘC GIÁ NHẬP (MỚI) ===
                const fixedCostPrice = getFixedCostPrice(product.category);

                if (newPrice !== fixedCostPrice) {
                    alert(`❌ Lỗi nhập liệu: Giá nhập (${formatVN(newPrice)} VNĐ) phải bằng Giá Vốn Cố Định (${formatVN(fixedCostPrice)} VNĐ) cho loại sản phẩm ${product.category}.`);
                    return; // Dừng lại nếu giá không khớp
                }
                // === KẾT THÚC KIỂM TRA ===

                // Cập nhật phiếu nhập gốc
                item.productId = newProductId;
                item.productName = product.name; 
                item.size = newSize;
                item.quantity = newQuantity;
                item.importPrice = newPrice; 
                item.importDate = newDate;
                
                saveImportItems(); 
                renderImports(); 
            });
            
            // GẮN SỰ KIỆN HỦY
            row.querySelector('.btn-cancel-inline').addEventListener('click', () => {
                renderImports(); // Tải lại bảng để thoát chế độ chỉnh sửa
            });
            return;
        }
    });

    // ====================== LISTENERS ======================
    // Gắn sự kiện cho Tìm kiếm, Date và STATUS
    [searchImportInput, filterImportStatus, importStartDateInput, importEndDateInput].forEach(el => {
        if (el) el.addEventListener("input", renderImports);
    });
    
    // Nút Lọc (chỉ cần gọi render, vì input đã kích hoạt)
    if (filterImportDateBtn) {
        filterImportDateBtn.addEventListener("click", (e) => {
            e.preventDefault(); 
            renderImports();
        });
    }

    // Gắn sự kiện thêm phiếu nhập
    addImportBtn?.addEventListener("click", () => { /* ... (Logic ADD giữ nguyên) ... */ });

    // ====================== INIT ======================
    // Khởi tạo productItems lần đầu và gọi renderImports
    productItems = refreshProductItems();
    renderImports();

    document.addEventListener('productsDataUpdated', () => {
        // Cập nhật lại dữ liệu sản phẩm (đã được lưu bởi admin-products.js)
        refreshProductItems(); 
        // Vẽ lại bảng ngay lập tức để cập nhật danh sách sản phẩm
        renderImports(); 
    });
});