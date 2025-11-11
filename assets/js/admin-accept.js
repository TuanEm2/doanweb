// ==============================
//  ADMIN ACCEPT & NAVIGATION SCRIPT
// ==============================

document.addEventListener("DOMContentLoaded", function () {
  // === HẰNG SỐ VÀ KHAI BÁO ===
  const ADMIN_LOGIN_FLAG = "soi_admin_logged_in"; // Khóa lưu trạng thái đăng nhập

  // Danh sách Admin
  const ADMINS = [
    { username: "admin1", password: "1"},
  ];

  // DOM Elements
  const menuItems = document.querySelectorAll(".admin-nav li");
  const sections = document.querySelectorAll(".admin-section");
  const pageTitle = document.getElementById("pageTitle");
  const loginPage = document.querySelector(".admin-login-page");
  const adminWrapper = document.querySelector(".admin-wrapper");
  const loginForm = document.querySelector(".login-form");
  const logoutBtn = document.getElementById("logoutBtn");
  const errorMsg = document.getElementById("loginError");

  // === HÀM CHUYỂN ĐỔI TRẠNG THÁI GIAO DIỆN ===
  /**
   * Ẩn/Hiện giao diện Admin dựa trên trạng thái đăng nhập.
   * @param {boolean} isLoggedIn - Trạng thái đã đăng nhập.
   */
  function toggleAdminView(isLoggedIn) {
      if (isLoggedIn) {
          if (adminWrapper) adminWrapper.style.display = "flex";
          if (loginPage) loginPage.style.display = "none";
          
          // Sau khi đăng nhập, kích hoạt tab đầu tiên (Sản phẩm)
          const firstMenuItem = document.querySelector('.admin-nav li[data-section="products"]');
          if (firstMenuItem) firstMenuItem.click();
      } else {
          if (adminWrapper) adminWrapper.style.display = "none";
          if (loginPage) loginPage.style.display = "flex";
          if (loginForm) loginForm.reset();
          if (errorMsg) errorMsg.textContent = "";
      }
  }

  // === 1. XỬ LÝ ĐĂNG NHẬP ===
  loginForm?.addEventListener("submit", function (e) {
      e.preventDefault();

      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value.trim();

      // Kiểm tra tài khoản trong mảng ADMINS
      let valid = ADMINS.some(admin => admin.username === user && admin.password === pass);

      if (valid) {
          // ✅ Đăng nhập thành công: LƯU TRẠNG THÁI vào Local Storage
          localStorage.setItem(ADMIN_LOGIN_FLAG, "true");
          toggleAdminView(true);
      } else {
          // ❌ Sai tài khoản hoặc mật khẩu
          if (errorMsg) errorMsg.textContent = "Sai tài khoản hoặc mật khẩu!";
          loginForm.classList.add("shake");
          setTimeout(() => loginForm.classList.remove("shake"), 400);
      }
  });

  // === 2. XỬ LÝ ĐĂNG XUẤT ===
  if (logoutBtn) {
      logoutBtn.addEventListener("click", function (e) {
          e.preventDefault();
          // ❌ Đăng xuất: XÓA TRẠNG THÁI khỏi Local Storage
          localStorage.removeItem(ADMIN_LOGIN_FLAG); 
          toggleAdminView(false);
      });
  }
  
  // === 3. XỬ LÝ CHUYỂN TAB (NAVIGATION) ===
  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Xóa active khỏi tất cả
      menuItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      // Ẩn tất cả section
      sections.forEach((sec) => (sec.style.display = "none"));

      // Hiện section tương ứng
      const sectionId = item.getAttribute("data-section");
      const currentSection = document.getElementById(sectionId);
      if (currentSection) currentSection.style.display = "block";

      // Cập nhật tiêu đề bên trái
      const text = item.textContent.trim();
      if (pageTitle) pageTitle.textContent = text;
    });
  });

  // === 4. KIỂM TRA TRẠNG THÁI KHI TẢI TRANG (INIT) ===
  const isLoggedIn = localStorage.getItem(ADMIN_LOGIN_FLAG) === "true";
  toggleAdminView(isLoggedIn);
});