document.addEventListener('DOMContentLoaded', function() {

    // --- 1. LOGIC CHUYỂN TAB ---
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuFood = document.getElementById('menu-food');
    const menuStaff = document.getElementById('menu-staff');
    
    const tabDashboard = document.getElementById('tab-dashboard');
    const tabFood = document.getElementById('tab-food');
    const tabStaff = document.getElementById('tab-staff');
    const pageTitle = document.getElementById('page-title');

    function switchTab(activeMenu, activeTab, title) {
        [menuDashboard, menuFood, menuStaff].forEach(m => m.classList.remove('active-tab'));
        [tabDashboard, tabFood, tabStaff].forEach(t => t.style.display = 'none');
        
        activeMenu.classList.add('active-tab');
        activeTab.style.display = 'block';
        pageTitle.innerText = title;
    }

    menuDashboard.addEventListener('click', () => switchTab(menuDashboard, tabDashboard, 'Tổng quan hệ thống'));
    menuFood.addEventListener('click', () => { switchTab(menuFood, tabFood, 'Quản lý Thực đơn'); });
    menuStaff.addEventListener('click', () => { switchTab(menuStaff, tabStaff, 'Quản lý Nhân viên'); });


    // --- 2. CẬP NHẬT DOANH THU & VẼ BIỂU ĐỒ ---
    function updateDashboardStats() {
        const revenueEl = document.getElementById('stat-revenue');
        const ordersEl = document.getElementById('stat-orders');
        
        if (revenueEl) {
            let totalRevenue = parseInt(localStorage.getItem('restaurantRevenue')) || 0;
            revenueEl.innerText = totalRevenue.toLocaleString('vi-VN') + 'đ';
        }
        
        if (ordersEl) {
            let totalOrders = parseInt(localStorage.getItem('restaurantTotalOrders')) || 0;
            ordersEl.innerText = totalOrders + ' đơn';
        }
    }

    // Lắng nghe nhân viên chốt đơn để cập nhật số ngay lập tức
    window.addEventListener('storage', function(event) {
        if (event.key === 'restaurantRevenue' || event.key === 'restaurantTotalOrders') {
            updateDashboardStats();
        }
    });

    // Vẽ biểu đồ Chart.js
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: [3200000, 2800000, 3500000, 4100000, 4800000, 6500000, 7200000], 
                    backgroundColor: '#047857', 
                    borderRadius: 5
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }

    // ==========================================================
    // 3. ĐIỀU KHIỂN GIAO DIỆN MÔ PHỎNG CRUD (MÓN ĂN)
    // ==========================================================
    const foodModal = document.getElementById('food-modal');
    const foodForm = document.getElementById('food-form');
    const modalTitle = document.getElementById('modal-title');

    // Hàm Mở Popup (Dùng chung cho Thêm mới và Sửa)
    window.openFoodModal = function(mode, foodId = null) {
        foodForm.reset(); // Làm sạch form
        
        if (mode === 'add') {
            modalTitle.innerText = "Thêm món ăn mới";
            document.getElementById('food-id').value = "";
        } else if (mode === 'edit') {
            modalTitle.innerText = "Chỉnh sửa món ăn #" + foodId;
            document.getElementById('food-id').value = foodId;
            
            // Giả lập việc điền dữ liệu cũ vào form khi ấn Sửa
            document.getElementById('food-name').value = (foodId == 16) ? "Phở Bò" : "Bún Đậu";
            document.getElementById('food-price').value = (foodId == 16) ? 45000 : 35000;
            document.getElementById('food-category').value = "mon-chinh";
            document.getElementById('food-available').checked = (foodId == 16) ? true : false;
        }
        
        foodModal.style.display = 'flex';
    }

    // Hàm Đóng Popup
    window.closeFoodModal = function() {
        foodModal.style.display = 'none';
    }
    // Hàm Xử lý khi ấn nút "Bật/Tắt trạng thái"
    window.mockToggleStatus = function(foodId, currentStatus) {
        if (currentStatus === true) {
            // Đang bán -> Bấm để tắt
            if(confirm(`Bạn muốn TẠM NGƯNG bán món #${foodId}?`)) {
                // Sau này: fetch(`/api/foods/${foodId}/status?available=false`, { method: 'PUT' })
                alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [PUT] tạm ngưng món #${foodId} thành công!\n(Giao diện sẽ tự động làm xám món này)`);
            }
        } else {
            // Đang tắt -> Bấm để bật lại
            if(confirm(`Bạn muốn MỞ BÁN LẠI món #${foodId}?`)) {
                // Sau này: fetch(`/api/foods/${foodId}/status?available=true`, { method: 'PUT' })
                alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [PUT] mở bán lại món #${foodId} thành công!\n(Giao diện sẽ tự động sáng lên)`);
            }
        }
    }
    // Hàm Xử lý khi ấn nút "Lưu Dữ Liệu" (Submit Form)
    window.mockSaveFood = function(event) {
        event.preventDefault(); // Chặn việc tải lại trang web
        
        const currentId = document.getElementById('food-id').value;
        const name = document.getElementById('food-name').value;
        
        if (currentId === "") {
            // Sau này: fetch('/api/foods', { method: 'POST', body: ... })
            alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [POST] lưu món mới:\n- Tên: ${name}\nVào Database thành công!`);
        } else {
            // Sau này: fetch(`/api/foods/${currentId}`, { method: 'PUT', body: ... })
            alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [PUT] cập nhật món #${currentId}:\n- Tên mới: ${name}\nVào Database thành công!`);
        }
        
        closeFoodModal();
    }

    // Hàm Xử lý khi ấn nút "Xóa"
    window.mockDeleteFood = function(foodId) {
        if (confirm(`Bạn có chắc chắn muốn xóa món ăn #${foodId} khỏi CSDL không?`)) {
            // Sau này: fetch(`/api/foods/${foodId}`, { method: 'DELETE' })
            alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [DELETE] xóa món #${foodId} thành công!`);
        }
    }
    // ==========================================================
    // 4. ĐIỀU KHIỂN GIAO DIỆN MÔ PHỎNG CRUD (NHÂN VIÊN)
    // ==========================================================
    const staffModal = document.getElementById('staff-modal');
    const staffForm = document.getElementById('staff-form');
    const staffModalTitle = document.getElementById('staff-modal-title');

    // Mở Popup Nhân viên
    window.openStaffModal = function(mode, userId = null) {
        staffForm.reset(); 
        
        if (mode === 'add') {
            staffModalTitle.innerText = "Thêm Nhân Viên Mới";
            document.getElementById('staff-id').value = "";
            document.getElementById('staff-password').required = true; // Bắt buộc nhập pass khi tạo mới
            document.getElementById('staff-password').placeholder = "Nhập mật khẩu...";
        } else if (mode === 'edit') {
            staffModalTitle.innerText = "Chỉnh sửa Nhân viên #U00" + userId;
            document.getElementById('staff-id').value = userId;
            
            // Giả lập điền dữ liệu cũ
            document.getElementById('staff-fullname').value = (userId == 1) ? "Nguyễn Ngọc Hoàng Nam" : "Trần Văn A";
            document.getElementById('staff-username').value = (userId == 1) ? "admin123" : "staff123";
            document.getElementById('staff-role').value = (userId == 1) ? "Admin" : "Staff";
            document.getElementById('staff-active').checked = (userId == 1) ? true : false;
            
            // Khi update, pass thường không bắt buộc (nếu để trống tức là không đổi pass)
            document.getElementById('staff-password').required = false; 
            document.getElementById('staff-password').placeholder = "Bỏ trống nếu không muốn đổi mật khẩu";
        }
        
        staffModal.style.display = 'flex';
    }

    // Đóng Popup
    window.closeStaffModal = function() {
        staffModal.style.display = 'none';
    }

    // Xử lý Lưu dữ liệu Nhân viên
    window.mockSaveStaff = function(event) {
        event.preventDefault(); 
        
        const currentId = document.getElementById('staff-id').value;
        const fullname = document.getElementById('staff-fullname').value;
        const role = document.getElementById('staff-role').value;
        
        if (currentId === "") {
            // Sau này: fetch('/api/users', { method: 'POST', body: ... })
            alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [POST] tạo tài khoản:\n- Tên: ${fullname}\n- Quyền: ${role}`);
        } else {
            // Sau này: fetch(`/api/users/${currentId}`, { method: 'PUT', body: ... })
            alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [PUT] cập nhật nhân viên #${currentId}:\n- Tên: ${fullname}\n- Quyền: ${role}`);
        }
        closeStaffModal();
    }

    // Xử lý Bật/Tắt trạng thái (Khóa tài khoản)
    window.mockToggleStaffStatus = function(userId, isCurrentlyActive) {
        if (isCurrentlyActive) {
            if(confirm(`Bạn muốn KHÓA tài khoản của Nhân viên #U00${userId} không? Họ sẽ không thể đăng nhập.`)) {
                // Sau này: fetch(`/api/users/${userId}/status?active=false`, { method: 'PUT' })
                alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [PUT] KHÓA tài khoản #${userId} thành công!`);
            }
        } else {
            if(confirm(`Bạn muốn MỞ KHÓA tài khoản cho Nhân viên #U00${userId}?`)) {
                // Sau này: fetch(`/api/users/${userId}/status?active=true`, { method: 'PUT' })
                alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [PUT] MỞ KHÓA tài khoản #${userId} thành công!`);
            }
        }
    }

    // Xóa nhân viên
    window.mockDeleteStaff = function(userId) {
        if (confirm(`CẢNH BÁO: Xóa nhân viên sẽ ảnh hưởng đến lịch sử hóa đơn.\nBạn có chắc chắn muốn xóa User #U00${userId}?`)) {
            // Sau này: fetch(`/api/users/${userId}`, { method: 'DELETE' })
            alert(`[MÔ PHỎNG SPRING BOOT]\nĐã gửi lệnh [DELETE] xóa nhân viên #${userId} thành công!`);
        }
    }

    // --- 5. CHẠY CÁC HÀM KHỞI TẠO LẦN ĐẦU KHI LOAD TRANG ---
    updateDashboardStats();
    renderStaffTable(); 
});