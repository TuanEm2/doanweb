document.addEventListener("DOMContentLoaded", () => {
    // 1. Khai báo các biến DOM và hằng số
    const priceTableBody = document.querySelector("#priceTable tbody");
    const searchPriceInput = document.getElementById("searchPrice");
    const PRODUCTS_STORAGE_KEY = 'productsData';

    let iTems = getiTems();
    
    // ====================== CẤU HÌNH GIÁ VỐN CỐ ĐỊNH ======================
    const FIXED_COST_PRICES = {
        "Jacket": 5000000,
        "Polo": 3000000,
        "T-Shirt": 3000000,
        "Shirt": 4000000
        // Đảm bảo tên loại sản phẩm khớp với data.js
    };

    function getiTems() {
        // Lấy dữ liệu sản phẩm. Nếu không có giá bán (do mới xóa trong data.js), mặc định là 0.
        let items = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || (typeof products !== 'undefined' ? products : []);
        return items.map(item => ({
            ...item,
            // Đảm bảo item có trường price và profitRatio (dùng cho việc lưu giá)
            price: item.price || 0, 
            profitRatio: item.profitRatio !== undefined ? item.profitRatio : 25
        }));
    }

    function saveiTems() {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(iTems));
    }

    // Tỷ lệ lợi nhuận mặc định (Nếu sản phẩm chưa có profitRatio, sẽ dùng 25%)
    const DEFAULT_PROFIT_RATIO = 25; 

    // ====================== HELPERS ======================

    /**
     * Lấy Giá vốn cố định theo loại sản phẩm
     */
    const getFixedCostPrice = (category) => {
        // Trả về giá vốn cố định hoặc 0 nếu không tìm thấy loại
        return FIXED_COST_PRICES[category] || 0;
    };

    /**
     * Tính giá bán từ Giá Vốn và Tỷ lệ Lợi nhuận.
     */
    const calculateSellingPrice = (costPrice, profitRatio) => {
        if (costPrice <= 0 || profitRatio < 0) return 0;
        
        // Giá bán = Giá vốn * (1 + Tỷ lệ lợi nhuận / 100)
        let sellingPrice = costPrice * (1 + profitRatio / 100);
        
        // Làm tròn lên đến nghìn gần nhất (theo yêu cầu ban đầu)
        return Math.ceil(sellingPrice / 1000) * 1000;
    };


    /**
     * LỌC DỮ LIỆU: Lọc mảng dữ liệu dựa trên từ khóa tìm kiếm.
     */

    // ======= Search =======
    const applySearch = (data) => {
        const keyword = searchPriceInput?.value.toLowerCase().trim() || "";
        
        if (!keyword) {
            return data;
        }

        return data.filter(p => {
            // Tính toán các trường cần thiết cho việc tìm kiếm
            const costPrice = getFixedCostPrice(p.category);
            const profitRatio = p.profitRatio !== undefined ? p.profitRatio : DEFAULT_PROFIT_RATIO;
            
            // Chuyển đổi các giá trị số sang chuỗi để tìm kiếm khớp
            const costPriceString = costPrice.toLocaleString('vi-VN').toLowerCase();
            const profitRatioString = profitRatio.toString().toLowerCase();

            // 1. Tìm kiếm theo ID, Tên, Loại
            const matchesNameCategory = p.name.toLowerCase().includes(keyword) || 
                                        p.category.toLowerCase().includes(keyword) ||
                                        p.id.toString().includes(keyword);

            // 2. Tìm kiếm theo Giá Vốn (có định dạng VNĐ)
            const matchesCostPrice = costPriceString.includes(keyword);

            // 3. Tìm kiếm theo Tỷ lệ Lợi nhuận
            const matchesProfitRatio = profitRatioString.includes(keyword);


            // Trả về TRUE nếu khớp với bất kỳ trường nào
            return matchesNameCategory || matchesCostPrice || matchesProfitRatio;
        });
    };

    // ====================== RENDER ======================
    const renderPriceTable = () => {
        priceTableBody.innerHTML = "";

        // Lấy lại dữ liệu sản phẩm MỚI NHẤT từ localStorage
        iTems = getiTems();

        // Lọc và tìm kiếm dữ liệu
        let filteredItems = applySearch(iTems);

        // Sắp xếp lại items theo ID giảm dần (sản phẩm mới nhất lên đầu)
        const sortedItems = filteredItems.sort((a, b) => b.id - a.id); 

        sortedItems.forEach((p, index) => {

            // KIỂM TRA: Nếu sản phẩm không có ID hoặc thông tin cơ bản, bỏ qua
            if (!p || !p.id) {
                return; // Bỏ qua nếu đối tượng không hợp lệ (đã bị xóa)
            }

            // Lấy Giá Vốn cố định
            const costPrice = getFixedCostPrice(p.category);
            
            // Lấy profitRatio đã lưu, nếu chưa có thì dùng mặc định
            const profitRatio = p.profitRatio !== undefined ? p.profitRatio : DEFAULT_PROFIT_RATIO;
            
            // Tính toán giá bán mới từ Giá Vốn cố định và Tỷ lệ Lợi nhuận
            const sellingPrice = calculateSellingPrice(costPrice, profitRatio);
            
            // Cập nhật giá bán và tỷ lệ lợi nhuận vào iTems để đồng bộ với localStorage
            p.price = sellingPrice; 
            p.profitRatio = profitRatio; // Cần cập nhật lại p.profitRatio nếu nó undefined (lần đầu load)

            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td class="cost-price">${costPrice.toLocaleString("vi-VN")} VNĐ</td>
                <td class="profit-ratio">${profitRatio}%</td>
                <td class="selling-price">${sellingPrice.toLocaleString("vi-VN")} VNĐ</td>
                <td>
                    <button class="btn-edit-price">Sửa</button>
                </td>
            `;

            attachEditEvents(row, p.id, costPrice);
            priceTableBody.appendChild(row);
        });
        // LƯU Ý QUAN TRỌNG: Cần lưu lại iTems sau khi tính toán giá bán lần đầu
        saveiTems(); 
    };


    // ====================== EDIT LOGIC ======================
    const attachEditEvents = (row, productId, costPrice) => {
        const editBtn = row.querySelector(".btn-edit-price");
        
        const productIndex = iTems.findIndex(item => item.id === productId);
        if (productIndex === -1) return;

        const p = iTems[productIndex];
        const currentRatio = p.profitRatio !== undefined ? p.profitRatio : DEFAULT_PROFIT_RATIO;
        
        // Edit Logic
        editBtn.addEventListener("click", () => {
            row.classList.add("editing");
            
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${costPrice.toLocaleString("vi-VN")} VNĐ</td>
                
                <td class="profit-ratio-input">
                    <input type="number" class="ratio-input" value="${currentRatio}" min="0" style="width: 60px; text-align: right;"> %
                </td>
                
                <td class="selling-price-preview">
                    ${calculateSellingPrice(costPrice, currentRatio).toLocaleString("vi-VN")} VNĐ
                </td>
                
                <td>
                    <button class="btn-save-price btn-save">Lưu</button>
                    <button class="btn-cancel-price btn-cancel">Hủy</button>
                </td>
            `;

            const ratioInput = row.querySelector(".ratio-input");
            const pricePreview = row.querySelector(".selling-price-preview");

            // Cập nhật giá bán khi thay đổi tỷ lệ lợi nhuận
            ratioInput.addEventListener("input", (e) => {
                let newRatio = parseInt(e.target.value) || 0;
                newRatio = Math.max(0, newRatio); 
                e.target.value = newRatio;

                const newSellingPrice = calculateSellingPrice(costPrice, newRatio);
                pricePreview.innerHTML = newSellingPrice.toLocaleString("vi-VN") + " VNĐ";
            });


            // Lưu Logic
            row.querySelector(".btn-save-price").addEventListener("click", () => {
                const newRatio = parseInt(ratioInput.value) || 0;
                const newSellingPrice = calculateSellingPrice(costPrice, newRatio);
                
                // Cập nhật dữ liệu
                iTems[productIndex].profitRatio = newRatio;
                iTems[productIndex].price = newSellingPrice; // Cập nhật giá bán chính thức
                
                saveiTems();
                renderPriceTable(); // Render lại bảng
                document.dispatchEvent(new Event('productsDataUpdated'));
            });

            // Hủy Logic
            row.querySelector(".btn-cancel-price").addEventListener("click", () => {
                renderPriceTable(); 
            });
        });
    }


    // ====================== LISTENERS & INIT ======================
    searchPriceInput?.addEventListener("input", renderPriceTable); 

    
    document.addEventListener('productsDataUpdated', () => {
        // renderPriceTable() sẽ tự động gọi iTems = getiTems() để lấy dữ liệu mới
        renderPriceTable(); 
    });
    
    // Khởi tạo
    renderPriceTable();
});