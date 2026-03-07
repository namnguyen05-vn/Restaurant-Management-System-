// ==========================================
// CẤU HÌNH API
// ==========================================
const API_FOOD_URL = "http://localhost:8080/api/foods";

// ==========================================
// 1. LOGIC CHUYỂN TAB (GIAO DIỆN)
// ==========================================
function switchTab(activeMenuId, activeTabId, title) {
    // Ẩn tất cả menu và tab
    const menus = ['menu-dashboard', 'menu-food', 'menu-staff'];
    const tabs = ['tab-dashboard', 'tab-food', 'tab-staff'];

    menus.forEach(id => document.getElementById(id).classList.remove('active-tab'));
    tabs.forEach(id => document.getElementById(id).style.display = 'none');

    // Bật menu và tab được chọn
    document.getElementById(activeMenuId).classList.add('active-tab');
    document.getElementById(activeTabId).style.display = 'block';
    document.getElementById('page-title').innerText = title;
}

// ==========================================
// 2. KẾT NỐI API THỰC TẾ (QUẢN LÝ MÓN ĂN)
// ==========================================

// Lấy danh sách món ăn từ Backend
function loadFoods() {
    fetch(API_FOOD_URL)
        .then(response => {
            if (!response.ok) throw new Error("Lỗi mạng hoặc Server chưa chạy!");
            return response.json();
        })
        .then(foods => renderFoodTable(foods))
        .catch(error => console.error("Lỗi khi tải dữ liệu món ăn:", error));
}

// Vẽ dữ liệu JSON ra bảng HTML
function renderFoodTable(foods) {
    const tbody = document.querySelector("#tab-food .data-table tbody");

    if (foods.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Chưa có món ăn nào trong hệ thống!</td></tr>`;
        return;
    }

    // Tạo một biến chuỗi rỗng để gom toàn bộ HTML
    let htmlContent = "";

    foods.forEach(food => {
        const priceFormatted = food.currentPrice.toLocaleString('vi-VN') + 'đ';
        const statusClass = food.isAvailable ? "status-active" : "status-inactive";
        const statusText = food.isAvailable ? "Đang bán" : "Tạm ngưng";
        const categoryName = food.category ? food.category.name : "Chưa phân loại";

        // Xử lý làm mờ dòng nếu ngừng bán
        const rowStyle = !food.isAvailable ? 'style="opacity: 0.7; background-color: #f9f9f9;"' : '';

        // TỰ ĐỘNG SỬA LỖI ẢNH: Đảm bảo đường dẫn luôn có dấu '/' ở đầu
        let safeImageUrl = "";
        if (food.imageURL) {
            safeImageUrl = food.imageURL.startsWith('/') ? food.imageURL : '/' + food.imageURL;
        } else {
            safeImageUrl = '/image/Flan.png'; // Phòng trường hợp Database bị null
        }

        // Nối dần mã HTML của từng món ăn vào chuỗi
        htmlContent += `
            <tr ${rowStyle}>
                <td>
                    <div style="width: 50px; height: 50px; background-color: #f0f0f0; border-radius: 8px; overflow: hidden; display: inline-block;">
                        <img src="${safeImageUrl}" alt="${food.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/image/Flan.png'">
                    </div>
                </td>
                <td style="color: #888;">#F0${food.id}</td>
                <td style="font-weight: 600;">${food.name}</td>
                <td>${categoryName}</td>
                <td style="font-weight: bold; color: var(--accent-color);">${priceFormatted}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <button class="action-btn" style="background: ${food.isAvailable ? '#f39c12' : '#7f8c8d'};" title="${food.isAvailable ? 'Tạm ngưng' : 'Mở bán'}" onclick="mockToggleStatus(${food.id}, '${food.name}', ${food.isAvailable})">
                        <i class="fa-solid fa-power-off"></i>
                    </button>
                    <button class="action-btn btn-edit" title="Sửa" onclick="openFoodModal('edit', ${food.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn btn-delete" title="Xóa" onclick="deleteFoodAPI(${food.id}, '${food.name}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = htmlContent;
}
// XÓA MÓN ĂN GỌI API THỰC TẾ
function deleteFoodAPI(foodId, foodName) {
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn món "${foodName}" không?`)) {
        fetch(`${API_FOOD_URL}/${foodId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert(`Đã xóa thành công món "${foodName}"!`);
                    loadFoods(); // Tải lại bảng để món ăn biến mất
                } else {
                    alert("Lỗi khi xóa món ăn!");
                }
            })
            .catch(error => console.error('Lỗi DELETE:', error));
    }
}


// ==========================================
// 3. ĐIỀU KHIỂN GIAO DIỆN MODAL (POPUP MÓN ĂN)
// ==========================================
const foodModal = document.getElementById('food-modal');
const foodForm = document.getElementById('food-form');

function openFoodModal(mode, foodId = null) {
    foodForm.reset(); // Làm sạch form trước khi mở

    if (mode === 'add') {
        document.getElementById('modal-title').innerText = "Thêm món ăn mới";
        document.getElementById('food-id').value = "";
        document.getElementById('food-image').value = "image/Flan.png"; // Gợi ý link ảnh mặc định
        document.getElementById('food-available').checked = true;

        foodModal.style.display = 'flex'; // Mở popup
    }
    else if (mode === 'edit') {
        document.getElementById('modal-title').innerText = "Chỉnh sửa món ăn #" + foodId;
        document.getElementById('food-id').value = foodId;

        // Hiển thị chữ tạm thời để người dùng biết máy đang xử lý
        document.getElementById('food-name').value = "Đang tải dữ liệu...";
        foodModal.style.display = 'flex'; // Mở popup lên trước cho mượt

        // GỌI API LẤY DỮ LIỆU THẬT TỪ DATABASE
        fetch(`${API_FOOD_URL}/${foodId}`)
            .then(response => {
                if (!response.ok) throw new Error("Lỗi khi tải dữ liệu món ăn!");
                return response.json();
            })
            .then(food => {
                // Đổ dữ liệu từ MySQL vào đúng từng ô Input trên màn hình
                document.getElementById('food-name').value = food.name;
                document.getElementById('food-price').value = food.currentPrice;
                document.getElementById('food-image').value = food.imageURL || "";
                document.getElementById('food-desc').value = food.description || "";
                document.getElementById('food-available').checked = food.isAvailable;

                // Trỏ đúng Danh mục (Khóa ngoại)
                if (food.category) {
                    document.getElementById('food-category').value = food.category.id;
                }
            })
            .catch(error => {
                console.error("Lỗi Edit:", error);
                alert("❌ Không thể tải dữ liệu món ăn này!");
                closeFoodModal(); // Gặp lỗi thì tự động đóng cửa sổ lại
            });
    }
}

function closeFoodModal() {
    foodModal.style.display = 'none';
}

function mockToggleStatus(foodId, foodName, currentStatus) {
    const actionText = currentStatus ? "TẠM NGƯNG bán" : "MỞ BÁN LẠI";

    if (confirm(`Bạn có chắc chắn muốn ${actionText} món "${foodName}" không?`)) {
        // Gửi lệnh PUT lên Spring Boot để lật trạng thái
        fetch(`${API_FOOD_URL}/${foodId}/status`, {
            method: 'PUT'
        })
            .then(response => {
                if (response.ok) {
                    // Lật thành công thì tải lại danh sách món ăn để cập nhật bảng
                    loadFoods();
                } else {
                    alert("❌ Lỗi khi cập nhật trạng thái trên Server!");
                }
            })
            .catch(error => console.error('Lỗi đổi trạng thái:', error));
    }
}

// XỬ LÝ LƯU MÓN ĂN (THÊM MỚI HOẶC SỬA) GỌI API THỰC TẾ
function mockSaveFood(event) {
    event.preventDefault(); // Ngăn trình duyệt load lại trang khi bấm Submit

    const foodId = document.getElementById('food-id').value;
    const name = document.getElementById('food-name').value;
    const price = document.getElementById('food-price').value;

    // LẤY DỮ LIỆU THỰC TẾ TỪ TẤT CẢ CÁC Ô TRÊN FORM (Không code cứng nữa)
    const categoryId = document.getElementById('food-category').value;
    const image = document.getElementById('food-image').value;
    const desc = document.getElementById('food-desc').value;
    const isAvailable = document.getElementById('food-available').checked;

    // Đóng gói dữ liệu thành chuẩn JSON để gửi cho Spring Boot
    const foodData = {
        name: name,
        currentPrice: parseInt(price),
        imageURL: image,
        description: desc,
        isAvailable: isAvailable,
        category: { id: parseInt(categoryId) } // Ép kiểu về số nguyên cho DB hiểu
    };

    // Nếu ID rỗng -> Thêm mới (POST). Nếu có ID -> Sửa (PUT)
    const method = foodId === "" ? "POST" : "PUT";
    const url = foodId === "" ? API_FOOD_URL : `${API_FOOD_URL}/${foodId}`;

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(foodData)
    })
        .then(response => {
            if (response.ok) {
                alert(foodId === "" ? "🎉 Đã thêm món mới thành công vào Database!" : "🎉 Cập nhật thành công!");
                closeFoodModal();
                loadFoods(); // Kéo danh sách mới từ DB về để vẽ lại bảng
            } else {
                alert("❌ Lỗi khi lưu dữ liệu. Vui lòng kiểm tra lại!");
            }
        })
        .catch(error => console.error("Lỗi SAVE:", error));
}


// ==========================================
// 4. ĐIỀU KHIỂN GIAO DIỆN MÔ PHỎNG (NHÂN VIÊN)
// ==========================================
const staffModal = document.getElementById('staff-modal');
const staffForm = document.getElementById('staff-form');

function openStaffModal(mode, userId = null) {
    staffForm.reset();
    if (mode === 'add') {
        document.getElementById('staff-modal-title').innerText = "Thêm Nhân Viên Mới";
        document.getElementById('staff-id').value = "";
        document.getElementById('staff-password').required = true;
    } else if (mode === 'edit') {
        document.getElementById('staff-modal-title').innerText = "Chỉnh sửa Nhân viên #U00" + userId;
        document.getElementById('staff-id').value = userId;
        document.getElementById('staff-password').required = false;
    }
    staffModal.style.display = 'flex';
}

function closeStaffModal() {
    staffModal.style.display = 'none';
}

function mockSaveStaff(event) {
    event.preventDefault();
    alert("Mô phỏng Lưu Nhân Viên!");
    closeStaffModal();
}

function mockToggleStaffStatus(userId, isCurrentlyActive) {
    alert("Mô phỏng Khóa/Mở Khóa Nhân Viên!");
}

function mockDeleteStaff(userId) {
    alert("Mô phỏng Xóa Nhân Viên!");
}


// ==========================================
// 5. DOANH THU & DASHBOARD
// ==========================================
function updateDashboardStats() {
    const revenueEl = document.getElementById('stat-revenue');
    const ordersEl = document.getElementById('stat-orders');
    if (revenueEl) revenueEl.innerText = (parseInt(localStorage.getItem('restaurantRevenue')) || 0).toLocaleString('vi-VN') + 'đ';
    if (ordersEl) ordersEl.innerText = (parseInt(localStorage.getItem('restaurantTotalOrders')) || 0) + ' đơn';
}

function initChart() {
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
                datasets: [{ label: 'Doanh thu (VNĐ)', data: [3200000, 2800000, 3500000, 4100000, 4800000, 6500000, 7200000], backgroundColor: '#047857', borderRadius: 5 }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }
}


// ==========================================
// THỰC THI NGAY KHI TRANG WEB TẢI XONG
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // 1. Gắn sự kiện click cho các nút Menu bên trái
    document.getElementById('menu-dashboard').addEventListener('click', () => switchTab('menu-dashboard', 'tab-dashboard', 'Tổng quan hệ thống'));
    document.getElementById('menu-food').addEventListener('click', () => switchTab('menu-food', 'tab-food', 'Quản lý Thực đơn'));
    document.getElementById('menu-staff').addEventListener('click', () => switchTab('menu-staff', 'tab-staff', 'Quản lý Nhân viên'));

    // 2. Tải dữ liệu và vẽ biểu đồ
    loadFoods(); // GỌI API LẤY MÓN ĂN TỪ SPRING BOOT
    updateDashboardStats();
    initChart();

    // 3. Lắng nghe thay đổi doanh thu (từ tab thu ngân)
    window.addEventListener('storage', function(event) {
        if (event.key === 'restaurantRevenue' || event.key === 'restaurantTotalOrders') updateDashboardStats();
    });
});