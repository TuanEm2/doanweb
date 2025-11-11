/* =========================================
 * FILE: index-filter.js (CHỈ QUẢN LÝ GIAO DIỆN)
 * ========================================= */

document.addEventListener('DOMContentLoaded', function() {
    
    // === CÁC BIẾN GIAO DIỆN ===
    const filterButton = document.querySelector('.filter');
    const searchFilterBox = document.getElementById('search-filter-box');
    const filterOptions = document.querySelectorAll('.filter-option-label');
    
    // CÁC BIẾN CỦA THANH TÌM KIẾM (Để đóng khi mở filter)
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions-box');

    // --- 1. LOGIC MỞ/ĐÓNG DROPDOWN ---
    if (filterButton && searchFilterBox) {
        filterButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Ngăn click lan ra document
            
            // Toggle (bật/tắt) hộp filter
            searchFilterBox.classList.toggle('hidden');
            
            // LUÔN LUÔN ẩn hộp gợi ý tìm kiếm khi mở filter
            if (suggestionsBox) suggestionsBox.classList.add('hidden'); 
        });
    }

    // --- 2. LOGIC HIGHLIGHT CHECKBOX ---
    filterOptions.forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        if (!checkbox) return;
        
        // Hàm cập nhật class 'selected'
        const updateSelectedClass = () => {
            label.classList.toggle('selected', checkbox.checked);
        };

        // Cập nhật lần đầu khi tải trang
        updateSelectedClass();
        
        // Cập nhật mỗi khi checkbox thay đổi
        checkbox.addEventListener('change', updateSelectedClass);
    });
    
    // --- 3. LOGIC ĐÓNG KHI CLICK RA NGOÀI ---
    document.addEventListener('click', (e) => {
        const searchWrapper = document.querySelector('.search-wrapper');
        
        // Chỉ ẩn nếu click bên ngoài toàn bộ .search-wrapper
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            if (searchFilterBox) searchFilterBox.classList.add('hidden');
            if (suggestionsBox) suggestionsBox.classList.add('hidden');
        }
    });
    
    // --- 4. ĐÓNG FILTER KHI GÕ TÌM KIẾM ---
    if(searchInput && searchFilterBox) {
        searchInput.addEventListener('focus', () => {
            searchFilterBox.classList.add('hidden');
        });
    }
});