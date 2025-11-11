document.addEventListener("DOMContentLoaded", function () {
  // ... (Giữ nguyên phần ADMINS và adminTableBody) ...

  // ===== DANH SÁCH ADMIN =====
  const ADMINS = [
    { username: "admin1", password: "1" },
  ];

  const adminTableBody = document.querySelector("#adminUsersTable tbody");
  ADMINS.forEach((admin) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${admin.username}</td>
      <td>${admin.password}</td>
    `;
    adminTableBody.appendChild(row);
  });

  // ===== DANH SÁCH KHÁCH HÀNG =====
  const USER_STORAGE_KEY = 'soi_registered_user';
  let users = getUsers() || []; // Sử dụng 'let' vì users sẽ được thay đổi

  // ====== HÀM LẤY USERS TỪ LOCAL STORAGE ======
  function getUsers() {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  }

  // Cập nhật hàm saveUsers để sử dụng 'users' toàn cục
  function saveUsers() {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  }


  const usersTable = document.querySelector("#customerUsersTable tbody");
  const addCustomerBtn = document.querySelector(".add-customer-btn");
  const searchCustomer = document.querySelector("#searchCustomer");

  // Đảm bảo mỗi user có trường 'isLocked'
  users = users.map(user => ({
      ...user,
      isLocked: user.isLocked !== undefined ? user.isLocked : false // Mặc định là không khóa
  }));
  saveUsers(); // Lưu lại với trường isLocked mới nếu cần

  // ======= RENDER DANH SÁCH (Cập nhật) =======
  function renderCustomers() {
    usersTable.innerHTML = "";
    users.forEach((c, i) => {
      const lockStatus = c.isLocked ? "Khóa" : "Hoạt động";
      const lockClass = c.isLocked ? "status-locked" : "status-active";
      const lockBtnText = c.isLocked ? "Mở khóa" : "Khóa TK";

      const row = document.createElement("tr");
      if (c.isLocked) {
          row.classList.add("locked-user");
      }
      row.innerHTML = `
        <td>${c.email}</td>
        <td>********</td> <td>${c.firstName}</td>
        <td>${c.lastName}</td>
        <td>${c.phone}</td>
        <td>${c.address}</td>
        <td>${c.createdAt ? c.createdAt : "—"}</td>
        <td><span class="${lockClass}">${lockStatus}</span></td>
        <td>
          <button class="btn-reset-password">Reset Mật khẩu</button>
          <button class="btn-lock">${lockBtnText}</button>
          <button class="btn-edit">Sửa</button>
          <button class="btn-delete">Xóa</button>
        </td>
      `;
      attachCustomerEvents(row, i);
      usersTable.appendChild(row);
    });
    applyFilters();
  }


  // ======= TÌM KIẾM KHÁCH HÀNG =======
  function applyFilters() {
    const keyword = searchCustomer.value.trim().toLowerCase();
    usersTable.querySelectorAll("tr").forEach((row) => {
      const match = row.textContent.toLowerCase().includes(keyword);
      row.style.display = match ? "" : "none";
    });
  }

  searchCustomer.addEventListener("input", applyFilters);

  // Kiểm tra định dạng Email cơ bản
  function isValidEmail(email) {
      // Regex đơn giản để kiểm tra định dạng email@domain.com
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  }

  // Kiểm tra Số điện thoại (chấp nhận 10 hoặc 11 số, chỉ chứa chữ số)
  function isValidPhone(phone) {
      // Regex cho SDT Việt Nam (10 hoặc 11 số)
      const phoneRegex = /^\d{10,11}$/;
      return phoneRegex.test(phone);
  }


  // ======= THÊM KHÁCH HÀNG (Cập nhật - Thêm data-attribute) =======
  addCustomerBtn.addEventListener("click", () => {
    const newRow = document.createElement("tr");
    newRow.classList.add("editing");
    newRow.innerHTML = `
      <td contenteditable="true">email@example.com</td>
      <td contenteditable="true" data-original-password="">password</td> <td contenteditable="true">First Name</td>
      <td contenteditable="true">Last Name</td>
      <td contenteditable="true">0123456789</td>
      <td contenteditable="true">Địa chỉ</td>
      <td>${new Date().toLocaleString("vi-VN")}</td>
      <td><span class="status-active">Hoạt động</span></td>
      <td>
        <button class="btn-save-inline">Lưu</button>
        <button class="btn-cancel-inline">Hủy</button>
      </td>
    `;
    usersTable.appendChild(newRow);
    newRow.scrollIntoView({ behavior: "smooth" });

    newRow.querySelector(".btn-save-inline").addEventListener("click", () => {
        const newEmail = newRow.children[0].textContent.trim();
        const newPassword = newRow.children[1].textContent.trim();
        const newFirstName = newRow.children[2].textContent.trim();
        const newLastName = newRow.children[3].textContent.trim();
        const newPhone = newRow.children[4].textContent.trim();
        const newAddress = newRow.children[5].textContent.trim();
        const newCreatedAt = newRow.children[6].textContent.trim();
        // === BẮT ĐẦU KIỂM TRA LOGIC ===
        if (!isValidEmail(newEmail)) {
            alert("Lỗi: Email không hợp lệ. Vui lòng nhập đúng định dạng (vd: user@example.com).");
            newRow.children[0].focus();
            return; // Dừng lại nếu email sai
        }

        if (users.some(user => user.email === newEmail)) {
            alert("Lỗi: Email này đã tồn tại trong danh sách khách hàng.");
            newRow.children[0].focus();
            return; // Dừng lại nếu email đã tồn tại
        }

        if (!isValidPhone(newPhone)) {
            alert("Lỗi: Số điện thoại không hợp lệ. Vui lòng nhập 10 hoặc 11 chữ số.");
            newRow.children[4].focus();
            return; // Dừng lại nếu SDT sai
        }

        if (newPassword.length < 1) {
            alert("Lỗi: Mật khẩu không được để trống.");
            newRow.children[1].focus();
            return; // Dừng lại nếu Mật khẩu trống
        }
        // === KẾT THÚC KIỂM TRA LOGIC ===

        // Nếu mọi thứ hợp lệ, tiến hành lưu
        users.push({
            email: newEmail,
            password: newPassword,
            firstName: newFirstName,
            lastName: newLastName,
            phone: newPhone,
            address: newAddress,
            createdAt: newCreatedAt,
            isLocked: false,
        });
        saveUsers();
        renderCustomers();
    });

    newRow
      .querySelector(".btn-cancel-inline")
      .addEventListener("click", () => newRow.remove());
  });

  // ======= SỬA / XÓA / RESET / KHÓA KHÁCH HÀNG (Cập nhật) =======
  function attachCustomerEvents(row, index) {
      // === CHỨC NĂNG SỬA (Cập nhật để ẩn mật khẩu khi sửa) ===
    row.querySelector(".btn-edit").addEventListener("click", () => {
      const c = users[index];
      row.classList.add("editing");
      // Khi sửa, ô mật khẩu hiển thị chuỗi ẩn. Admin phải nhập mật khẩu mới nếu muốn thay đổi.
      row.innerHTML = `
        <td contenteditable="true">${c.email}</td>
        <td contenteditable="true" data-original-password="${c.password}">********</td> <td contenteditable="true">${c.firstName}</td>
        <td contenteditable="true">${c.lastName}</td>
        <td contenteditable="true">${c.phone}</td>
        <td contenteditable="true">${c.address}</td>
        <td>${c.createdAt}</td>
        <td><span class="${c.isLocked ? "status-locked" : "status-active"}">${c.isLocked ? "Khóa" : "Hoạt động"}</span></td>
        <td>
          <button class="btn-save-inline">Lưu</button>
          <button class="btn-cancel-inline">Hủy</button>
        </td>
      `;
      row.querySelector(".btn-save-inline").addEventListener("click", () => {
        // Lấy dữ liệu mới
        const updatedEmail = row.children[0].textContent.trim();
        const newPasswordText = row.children[1].textContent.trim();
        const updatedFirstName = row.children[2].textContent.trim();
        const updatedLastName = row.children[3].textContent.trim();
        const updatedPhone = row.children[4].textContent.trim();
        const updatedAddress = row.children[5].textContent.trim();

        const oldPassword = row.children[1].getAttribute('data-original-password');
        // const c = users[index]; // Lấy user cũ để giữ createdAt và isLocked (đã có ở scope ngoài)


        // === BẮT ĐẦU KIỂM TRA LOGIC KHI SỬA ===
        if (!isValidEmail(updatedEmail)) {
            alert("Lỗi: Email không hợp lệ. Vui lòng nhập đúng định dạng (vd: user@example.com).");
            row.children[0].focus();
            return;
        }

        // Kiểm tra trùng lặp email (trừ chính email đang được sửa)
        if (users.some((user, i) => i !== index && user.email === updatedEmail)) {
            alert("Lỗi: Email này đã tồn tại trong danh sách khách hàng khác.");
            row.children[0].focus();
            return;
        }

        if (!isValidPhone(updatedPhone)) {
            alert("Lỗi: Số điện thoại không hợp lệ. Vui lòng nhập 10 hoặc 11 chữ số.");
            row.children[4].focus();
            return;
        }

        // Xác định mật khẩu cuối cùng (giữ cũ nếu vẫn là ******** hoặc trống)
        const finalPassword = newPasswordText === '********' || newPasswordText === '' ? oldPassword : newPasswordText;
        if (finalPassword.length < 1) {
             alert("Lỗi: Mật khẩu không được để trống.");
             row.children[1].focus();
             return;
        }
        // === KẾT THÚC KIỂM TRA LOGIC KHI SỬA ===

        // Nếu mọi thứ hợp lệ, tiến hành lưu
        users[index] = {
          email: updatedEmail,
          password: finalPassword,
          firstName: updatedFirstName,
          lastName: updatedLastName,
          phone: updatedPhone,
          address: updatedAddress,
          createdAt: c.createdAt,
          isLocked: c.isLocked,
        };
        saveUsers();
        renderCustomers();
      });
      row
        .querySelector(".btn-cancel-inline")
        .addEventListener("click", renderCustomers);
    });

    // === CHỨC NĂNG XÓA  ===
    row.querySelector(".btn-delete").addEventListener("click", () => {
      if (confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
        users.splice(index, 1);
        saveUsers();
        renderCustomers();
      }
    });

    // === CHỨC NĂNG RESET MẬT KHẨU (Mới) ===
    row.querySelector(".btn-reset-password").addEventListener("click", () => {
        const newPassword = prompt("Nhập mật khẩu mới cho tài khoản " + users[index].email + ":\n(Để trống nếu muốn đặt là '123456')");
        if (newPassword !== null) {
            users[index].password = newPassword.trim() || "123456";
            saveUsers();
            alert("Mật khẩu của " + users[index].email + " đã được đặt lại thành: " + users[index].password);
            renderCustomers(); // Render lại để cập nhật mật khẩu hiển thị
        }
    });

    // === CHỨC NĂNG KHÓA / MỞ KHÓA (Mới) ===
    row.querySelector(".btn-lock").addEventListener("click", () => {
        const isCurrentlyLocked = users[index].isLocked;
        const action = isCurrentlyLocked ? "mở khóa" : "khóa";
        if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${users[index].email} không?`)) {
            users[index].isLocked = !isCurrentlyLocked;
            saveUsers();
            alert(`Tài khoản ${users[index].email} đã được ${action}.`);
            renderCustomers(); // Render lại để cập nhật trạng thái
        }
    });
  }

  // ======= KHỞI CHẠY (Cập nhật) =======
  renderCustomers();
});
