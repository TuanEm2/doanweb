document.addEventListener("DOMContentLoaded", () => {
    // 1. Khai báo các biến DOM và hằng số
    const productsTableBody = document.querySelector("#productsTable tbody");
    const addBtn = document.querySelector(".add-btn");
    const filterSelect = document.getElementById("filterType");
    const searchInput = document.getElementById("searchProduct");

    const productTypes = ["Jacket", "T-Shirt", "Polo", "Shirt"];

    const PRODUCTS_STORAGE_KEY = 'productsData';
    let iTems = getiTems();

    function getiTems() {
        let items = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || (typeof products !== 'undefined' ? products : []);
        // Thêm trường isHidden nếu chưa có
        items = items.map(item => ({
            ...item,
            isHidden: item.isHidden !== undefined ? item.isHidden : false 
        }));
        // Lưu lại ngay lập tức nếu dữ liệu ban đầu không có trường isHidden
        if (!localStorage.getItem(PRODUCTS_STORAGE_KEY) || items.some(item => item.isHidden === undefined)) {
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(items));
        }
        return items;
    }

    function saveiTems() {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(iTems));
        document.dispatchEvent(new Event('productsDataUpdated'));
    }

    // ====================== HELPERS ======================

    const fixImagePath = path => path || "assets/images/no-image.png";

    /**
     * Tìm ID lớn nhất trong mảng iTems và trả về ID tiếp theo (ID lớn nhất + 1)
     */
    const getNextProductId = () => {
        if (iTems.length === 0) {
            return 1;
        }
        
        const maxId = iTems.reduce((max, item) => {
            const currentId = parseInt(item.id); 
            return currentId > max ? currentId : max;
        }, 0); 
        
        return maxId + 1;
    };

    /**
     * LỌC DỮ LIỆU: Lọc mảng dữ liệu dựa trên tiêu chí của Filter và Search.
     * Đây là hàm mới thay thế logic ẩn/hiện cũ.
     * @param {Array<Object>} data - Mảng dữ liệu sản phẩm gốc.
     * @returns {Array<Object>} Mảng dữ liệu đã được lọc và tìm kiếm.
     */
    const applyFiltersAndSearch = (data) => {
        let result = data;
        const selectedType = filterSelect?.value || "all";
        const keyword = searchInput?.value.toLowerCase().trim() || "";
        
        // 1. Lọc theo loại sản phẩm
        if (selectedType !== "all") {
            result = result.filter(p => p.category === selectedType);
        }

        // 2. Lọc theo tìm kiếm (Tên sản phẩm hoặc Loại sản phẩm)
        if (keyword) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(keyword) || 
                p.category.toLowerCase().includes(keyword) ||
                p.id.toString().includes(keyword)
            );
        }
        return result;
    };


    // Hàm kiểm tra đầu vào mới
    const validateProductData = (name, image) => {
        const latinRegex = /^[a-zA-Z0-9\s\-\_]+$/;
        if (!image || image === "assets/images/no-image.png") {
            alert("Lỗi: Vui lòng chọn hình ảnh cho sản phẩm.");
            return false;
        }

        if (name && !latinRegex.test(name)) {
            alert("Lỗi: Tên sản phẩm chỉ được chứa chữ cái Latinh (không dấu), số và các ký tự: dấu cách, gạch ngang (-), gạch dưới (_).");
            return false;
        }


        if (name.length < 3) {
            alert("Lỗi: Tên sản phẩm phải có ít nhất 3 ký tự.");
            return false;
        }
        

        return true;
    };


    
    // ====================== RENDER ======================
    const renderProducts = () => {
        productsTableBody.innerHTML = "";
        
        // 1. Lọc và tìm kiếm dữ liệu 
        let filteredItems = applyFiltersAndSearch(iTems);
        
        // 2. Sắp xếp lại items theo ID giảm dần (sản phẩm mới nhất lên đầu)
        const sortedItems = filteredItems.sort((a, b) => b.id - a.id); 

        sortedItems.forEach((p) => {
            const originalIndex = iTems.findIndex(item => item.id === p.id);
            
            const row = document.createElement("tr");
            
            // THAY ĐỔI: Thêm class và style nếu sản phẩm bị ẩn
            if (p.isHidden) {
                row.classList.add("hidden-product");
            }

            // THAY ĐỔI: Cập nhật cột Hành Động
            const hideBtnText = p.isHidden ? 'Hiện' : 'Ẩn';
            const hideBtnClass = p.isHidden ? 'btn-unhide' : 'btn-hide';

            row.innerHTML = `
                <td>${p.id}</td>
                <td><img src="${fixImagePath(p.image)}" alt="product" style="width:60px;height:60px;object-fit:cover;border-radius:6px;"></td>
                <td>${p.name} <span style="font-size: 12px; color: red;">${p.isHidden ? '(ẨN)' : ''}</span></td>
                <td>${p.category}</td>
                
                
                <td>
                    <button class="btn-edit">Sửa</button>
                    <button class="${hideBtnClass}">${hideBtnText}</button>
                    <button class="btn-delete">Xóa</button>
                </td>
            `;

            attachEditDeleteEvents(row, originalIndex);
            productsTableBody.appendChild(row);
        });

    };

    // ====================== FILTER & SEARCH LISTENERS ======================

    
    // Chỉ cần gọi renderProducts() để kích hoạt hàm applyFiltersAndSearch
    filterSelect?.addEventListener("change", renderProducts); 
    searchInput?.addEventListener("input", renderProducts);

    // ====================== EDIT / DELETE / HIDE ======================
    const attachEditDeleteEvents = (row, index) => {
        const editBtn = row.querySelector(".btn-edit");
        const deleteBtn = row.querySelector(".btn-delete");
        const hideBtn = row.querySelector(".btn-hide, .btn-unhide");

        const p = iTems[index];
        const originalHTML = row.innerHTML; 

        
        // Edit Logic
        editBtn.addEventListener("click", () => {
            row.classList.add("editing");
            
            row.innerHTML = `
                <td>${p.id}</td>
                <td>
                    <img src="${fixImagePath(p.image)}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;">
                    <input type="file" accept="image/*" class="file-input">
                </td>
                <td contenteditable="true">${p.name}</td>
                <td>
                    <select class="product-type-select">
                        ${productTypes.map(t => `<option value="${t}" ${t === p.category ? "selected" : ""}>${t}</option>`).join("")}
                    </select>
                </td>
                
                <td>
                    <button class="btn-save">Lưu</button>
                    <button class="btn-cancel">Hủy</button>
                </td>
            `;

            let imgBase64 = p.image;
            const fileInput = row.querySelector(".file-input");
            fileInput.addEventListener("change", e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => {
                        imgBase64 = ev.target.result;
                        row.querySelector("img").src = imgBase64;
                    }
                    reader.readAsDataURL(file);
                }
            });

            row.querySelector(".btn-save").addEventListener("click", () => {
                const nameNew = row.children[2].innerText.trim();
                const categoryNew = row.querySelector(".product-type-select").value;
             

                
                // --- KIỂM TRA ĐIỀU KIỆN NHẬP VÀO ---
                if (!validateProductData(nameNew,imgBase64)) {
                    return; // Ngừng lưu nếu validation thất bại
                }
                // --- KẾT THÚC KIỂM TRA ---

                iTems[index] = { ...p, name: nameNew, category: categoryNew, image: imgBase64 };
                saveiTems();
                renderProducts();
            });

            row.querySelector(".btn-cancel").addEventListener("click", () => {
                row.innerHTML = originalHTML;
                row.classList.remove("editing");
                attachEditDeleteEvents(row, index); 
            });
        });

        // Delete Logic
        deleteBtn.addEventListener("click", () => {
            if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                iTems.splice(index, 1);
                saveiTems();
                renderProducts();
            }
        });

        // Logic Ẩn/Hiện 
        hideBtn?.addEventListener("click", () => {
            const isHiding = !p.isHidden; // Hành động ngược lại với trạng thái hiện tại
            const actionText = isHiding ? "ẩn" : "hiện";

            if (confirm(`Bạn có chắc chắn muốn ${actionText} sản phẩm "${p.name}"?`)) {
                iTems[index].isHidden = isHiding;
                saveiTems();
                renderProducts(); // Render lại bảng để cập nhật trạng thái
            }
        });
    }

    // ====================== ADD PRODUCT ======================
    addBtn?.addEventListener("click", () => {
        const newRow = document.createElement("tr");
        newRow.classList.add("editing");
        let imgBase64 = "assets/images/no-image.png";

        const nextId = getNextProductId();

        newRow.innerHTML = `
            <td>${nextId}</td>
            <td>
                <img src="${imgBase64}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
                <input type="file" class="file-input">
            </td>
            <td contenteditable="true">Ten san pham moi</td>
            <td>
                <select class="product-type-select">
                    ${productTypes.map(t => `<option value="${t}">${t}</option>`).join("")}
                </select>
            </td>

            <td>
                <button class="btn-save">Lưu</button>
                <button class="btn-cancel">Hủy</button>
            </td>
        `;
        
        const fileInput = newRow.querySelector(".file-input");
        const imgPreview = newRow.querySelector("img");
        fileInput.addEventListener("change", e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = ev => {
                    imgBase64 = ev.target.result;
                    imgPreview.src = imgBase64;
                }
                reader.readAsDataURL(file);
            }
        });

        newRow.querySelector(".btn-save").addEventListener("click", () => {
            const name = newRow.children[2].innerText.trim();
            const category = newRow.querySelector(".product-type-select").value;
           
            
            // --- KIỂM TRA ĐIỀU KIỆN NHẬP VÀO ---
            if (!validateProductData(name, imgBase64)) {
                return; // Ngừng lưu nếu validation thất bại
            }
            // --- KẾT THÚC KIỂM TRA ---

            const newItem = {
                id: nextId,
                name,
                category,
                image: imgBase64,
            };
            iTems.push(newItem);
            saveiTems();
            renderProducts();
        });

        newRow.querySelector(".btn-cancel").addEventListener("click", () => newRow.remove());
        productsTableBody.insertBefore(newRow, productsTableBody.firstChild); 
        
        // Logic cuộn để tránh bị che bởi header cố định
        const headerHeight = 70; // Giả định chiều cao header là 70px
        const tableTop = productsTableBody.getBoundingClientRect().top + window.scrollY;
        
        window.scrollTo({
            top: tableTop - headerHeight, 
            behavior: "smooth"
        });
    });


    // ====================== INIT ======================
    if (filterSelect) filterSelect.value = "all";
    if (searchInput) searchInput.value = "";
    renderProducts();

    // ====================== CẬP NHẬT CHÉO ======================
    /**
     * Lắng nghe sự kiện khi dữ liệu sản phẩm được cập nhật từ các tab khác (ví dụ: Quản lý Giá bán).
     * Khi sự kiện xảy ra, gọi lại renderProducts() để cập nhật hiển thị.
     */
    document.addEventListener('productsDataUpdated', () => {
        // Lấy lại dữ liệu mới nhất (do tab Price đã gọi saveiTems)
        iTems = getiTems(); 
        renderProducts();
    });
});