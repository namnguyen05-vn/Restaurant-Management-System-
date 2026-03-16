// ==========================================
// 0. CHỐT CHẶN BẢO MẬT (AUTH GUARD) VÀ ĐĂNG XUẤT
// ==========================================
const loggedInUserStr = localStorage.getItem('loggedInUser');

// 1. Kiểm tra xem có vé (đã đăng nhập) chưa?
if (!loggedInUserStr) {
    alert("🔒 Vui lòng đăng nhập để truy cập trang Quản trị!");
    window.location.href = "home.html"; // Đổi thành tên file trang chủ của bạn nếu cần
} else {
    const currentUser = JSON.parse(loggedInUserStr);

    // 2. Kiểm tra xem vé có đúng là của Admin không?
    if (currentUser.role !== 'Admin') {
        alert("⛔ Bạn không có quyền truy cập khu vực của Quản lý!");
        // Nếu là Staff thì đẩy về trang Staff, không thì đẩy ra Home
        window.location.href = currentUser.role === 'Staff' ? "Staff.html" : "home.html";
    } else {
        // 3. Nếu hợp lệ, tự động in tên Admin lên góc phải màn hình cho xịn!
        document.addEventListener('DOMContentLoaded', () => {
            const greetingElement = document.querySelector('.admin-header-top span');
            if (greetingElement) {
                greetingElement.innerHTML = `👋 Chào Quản lý, <b style="color: var(--primary-color);">${currentUser.fullName}</b>`;
            }
        });
    }
}

// ==========================================
// XỬ LÝ NÚT ĐĂNG XUẤT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.admin-menu li:last-child');
    if (logoutBtn) {
        // Biến nút này thành con trỏ chuột bấm được
        logoutBtn.style.cursor = 'pointer';

        logoutBtn.addEventListener('click', function() {
            if (confirm("Bạn có chắc chắn muốn thoát khỏi hệ thống?")) {
                localStorage.removeItem('loggedInUser'); // Xé vé
                window.location.href = "home.html"; // Đẩy ra ngoài
            }
        });
    }
});
// ==========================================
// CẤU HÌNH API
// ==========================================
const API_FOOD_URL = "http://localhost:8080/api/foods";
const API_USER_URL = "http://localhost:8080/api/users";
const API_TABLE_URL = "http://localhost:8080/api/tables";

// ==========================================
// 1. LOGIC CHUYỂN TAB (GIAO DIỆN)
// ==========================================
function switchTab(activeMenuId, activeTabId, title) {
    // THÊM 'menu-table' VÀ 'tab-table' VÀO MẢNG
    const menus = ['menu-dashboard', 'menu-food', 'menu-staff', 'menu-table'];
    const tabs = ['tab-dashboard', 'tab-food', 'tab-staff', 'tab-table'];

    menus.forEach(id => document.getElementById(id).classList.remove('active-tab'));
    tabs.forEach(id => document.getElementById(id).style.display = 'none');

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

// ==========================================================
// 4. QUẢN LÝ TÀI KHOẢN NHÂN VIÊN (API THỰC TẾ)
// ==========================================================
const staffModal = document.getElementById('staff-modal');
const staffForm = document.getElementById('staff-form');

// 4.1 Tải danh sách nhân viên từ Database
function loadStaffs() {
    fetch(API_USER_URL)
        .then(response => {
            if (!response.ok) throw new Error("Lỗi tải danh sách nhân viên");
            return response.json();
        })
        .then(staffs => renderStaffTable(staffs))
        .catch(error => console.error("Lỗi:", error));
}

// 4.2 Vẽ bảng dữ liệu nhân viên
function renderStaffTable(staffs) {
    const tbody = document.querySelector("#tab-staff .data-table tbody");
    if (staffs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Chưa có nhân viên nào!</td></tr>`;
        return;
    }

    let htmlContent = "";
    // Lấy thông tin người đang đăng nhập để tránh việc tự xóa/khóa chính mình
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    staffs.forEach(staff => {
        const isMe = loggedInUser && loggedInUser.id === staff.id;
        const roleClass = staff.role === 'Admin' ? 'background: #34495e;' : 'background: #3498db;';
        const statusClass = staff.isActive ? "status-active" : "status-inactive";
        const statusText = staff.isActive ? "Hoạt động" : "Đã khóa";
        const rowStyle = !staff.isActive ? 'style="opacity: 0.7; background-color: #f9f9f9;"' : '';

        // Xử lý nút Khóa/Mở khóa
        const toggleBtn = isMe
            ? `<button class="action-btn" style="background: #bdc3c7; cursor: not-allowed;" title="Không thể tự khóa mình"><i class="fa-solid fa-lock"></i></button>`
            : `<button class="action-btn" style="background: ${staff.isActive ? '#f39c12' : '#27ae60'};" title="${staff.isActive ? 'Khóa tài khoản' : 'Mở khóa'}" onclick="toggleStaffStatusAPI(${staff.id}, '${staff.username}', ${staff.isActive})"><i class="fa-solid ${staff.isActive ? 'fa-lock' : 'fa-lock-open'}"></i></button>`;

        // Xử lý nút Xóa
        const deleteBtn = isMe
            ? `<button class="action-btn" style="background: #bdc3c7; cursor: not-allowed;" title="Không thể tự xóa mình"><i class="fa-solid fa-trash"></i></button>`
            : `<button class="action-btn btn-delete" title="Xóa" onclick="deleteStaffAPI(${staff.id}, '${staff.username}')"><i class="fa-solid fa-trash"></i></button>`;

        htmlContent += `
            <tr ${rowStyle}>
                <td style="font-weight: bold; color: #888;">#U00${staff.id}</td>
                <td style="font-weight: 600;">${staff.fullName} ${isMe ? '<span style="color:red; font-size:12px;">(Bạn)</span>' : ''}</td>
                <td>${staff.username}</td>
                <td><span style="${roleClass} color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem;">${staff.role}</span></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${toggleBtn}
                    <button class="action-btn btn-edit" title="Sửa" onclick="openStaffModal('edit', ${staff.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    ${deleteBtn}
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = htmlContent;
}

// 4.3 Đảo trạng thái Khóa/Mở khóa
function toggleStaffStatusAPI(userId, username, isActive) {
    const actionText = isActive ? "KHÓA" : "MỞ KHÓA";
    if (confirm(`Bạn có chắc muốn ${actionText} tài khoản "${username}" không?`)) {
        fetch(`${API_USER_URL}/${userId}/status`, { method: 'PUT' })
            .then(res => {
                if (res.ok) loadStaffs();
                else alert("Lỗi khi cập nhật trạng thái!");
            });
    }
}

// 4.4 Xóa nhân viên
function deleteStaffAPI(userId, username) {
    if (confirm(`CẢNH BÁO: Bạn có chắc muốn xóa VĨNH VIỄN tài khoản "${username}" không?`)) {
        fetch(`${API_USER_URL}/${userId}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    alert("Đã xóa thành công!");
                    loadStaffs();
                } else alert("Lỗi khi xóa nhân viên!");
            });
    }
}

// 4.5 Điều khiển Popup (Load data khi Sửa)
function openStaffModal(mode, userId = null) {
    staffForm.reset();
    if (mode === 'add') {
        document.getElementById('staff-modal-title').innerText = "Thêm Nhân Viên Mới";
        document.getElementById('staff-id').value = "";

        // Bắt buộc nhập pass khi thêm mới
        document.getElementById('staff-password').required = true;
        document.getElementById('staff-password').placeholder = "Nhập mật khẩu...";
        staffModal.style.display = 'flex';
    } else if (mode === 'edit') {
        document.getElementById('staff-modal-title').innerText = "Chỉnh sửa Nhân viên #U00" + userId;
        document.getElementById('staff-id').value = userId;

        // Không bắt buộc nhập pass khi sửa (Nếu để trống = Giữ nguyên pass cũ)
        document.getElementById('staff-password').required = false;
        document.getElementById('staff-password').placeholder = "Bỏ trống nếu không đổi mật khẩu";

        document.getElementById('staff-fullname').value = "Đang tải...";
        staffModal.style.display = 'flex';

        fetch(`${API_USER_URL}/${userId}`)
            .then(res => res.json())
            .then(user => {
                document.getElementById('staff-fullname').value = user.fullName;
                document.getElementById('staff-username').value = user.username;
                document.getElementById('staff-role').value = user.role;
                document.getElementById('staff-active').checked = user.isActive;
            });
    }
}

function closeStaffModal() {
    staffModal.style.display = 'none';
}

// 4.6 Lưu hoặc Cập nhật Nhân viên
function mockSaveStaff(event) {
    event.preventDefault();
    const id = document.getElementById('staff-id').value;

    // Gom dữ liệu từ form
    const data = {
        fullName: document.getElementById('staff-fullname').value,
        username: document.getElementById('staff-username').value,
        role: document.getElementById('staff-role').value,
        isActive: document.getElementById('staff-active').checked
    };

    // Nếu có nhập mật khẩu mới thì mới đính kèm vào cục hàng để gửi đi
    const password = document.getElementById('staff-password').value;
    if (password) {
        data.password = password;
    }

    const method = id === "" ? "POST" : "PUT";
    const url = id === "" ? API_USER_URL : `${API_USER_URL}/${id}`;

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(async response => {
            if (response.ok) {
                alert(id === "" ? "Đã tạo tài khoản thành công!" : "Cập nhật thành công!");
                closeStaffModal();
                loadStaffs(); // Tải lại bảng
            } else {
                const err = await response.text();
                alert("❌ Lỗi: " + err);
            }
        });
}

// ==========================================================
// 5. QUẢN LÝ BÀN ĂN (API THỰC TẾ)
// ==========================================================
const tableModal = document.getElementById('table-modal');
const tableForm = document.getElementById('table-form');

function loadTables() {
    fetch(API_TABLE_URL)
        .then(res => res.json())
        .then(tables => renderTableGrid(tables))
        .catch(err => console.error("Lỗi tải danh sách bàn:", err));
}

function renderTableGrid(tables) {
    const tbody = document.querySelector("#tab-table .data-table tbody");
    if (tables.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Chưa thiết lập bàn nào!</td></tr>`;
        return;
    }

    let html = "";
    tables.forEach(table => {
        const usageText = table.status === 'Empty'
            ? '<span style="color: #27ae60; font-weight: bold;">Trống</span>'
            : '<span style="color: #e74c3c; font-weight: bold;">Đang phục vụ</span>';

        html += `
            <tr>
                <td style="color: #888; font-weight: bold;">#T00${table.id}</td>
                <td style="font-weight: 600; font-size: 1.1rem;">${table.tableNumber}</td>
                <td>${usageText}</td>
                <td>
                    <button class="action-btn btn-edit" title="Sửa" onclick="openTableModal('edit', ${table.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn btn-delete" title="Xóa" onclick="deleteTableAPI(${table.id}, '${table.tableNumber}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function deleteTableAPI(id, name) {
    if (confirm(`CẢNH BÁO: Xóa vĩnh viễn ${name}?`)) {
        fetch(`${API_TABLE_URL}/${id}`, { method: 'DELETE' }).then(() => loadTables());
    }
}

function openTableModal(mode, id = null) {
    tableForm.reset();
    if (mode === 'add') {
        document.getElementById('table-modal-title').innerText = "Thêm Bàn Mới";
        document.getElementById('table-id').value = "";
        document.getElementById('group-table-status').style.display = 'none'; // Mới thêm thì mặc định là trống
        tableModal.style.display = 'flex';
    } else {
        document.getElementById('table-modal-title').innerText = "Sửa " + id;
        document.getElementById('table-id').value = id;
        document.getElementById('group-table-status').style.display = 'block';
        tableModal.style.display = 'flex';

        fetch(`${API_TABLE_URL}/${id}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('table-name').value = data.tableNumber;
                document.getElementById('table-status').value = data.status;
            });
    }
}

function closeTableModal() { tableModal.style.display = 'none'; }

function mockSaveTable(event) {
    event.preventDefault();
    const id = document.getElementById('table-id').value;
    const data = {
        tableNumber: document.getElementById('table-name').value,
        status: id === "" ? "Empty" : document.getElementById('table-status').value
    };

    const method = id === "" ? "POST" : "PUT";
    const url = id === "" ? API_TABLE_URL : `${API_TABLE_URL}/${id}`;

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => {
        if (res.ok) { closeTableModal(); loadTables(); }
        else alert("Lỗi lưu bàn!");
    });
}

// ==========================================
// 6. DOANH THU & DASHBOARD (TỪ API)
// ==========================================
const API_DASHBOARD_URL = "http://localhost:8080/api/dashboard";
let revenueChart; // Biến toàn cục để lưu biểu đồ

function updateDashboardStats() {
    fetch(`${API_DASHBOARD_URL}/stats`)
        .then(res => res.json())
        .then(stats => {
            const revenueEl = document.getElementById('stat-revenue');
            const ordersEl = document.getElementById('stat-orders');
            // Lấy tất cả các thẻ hiển thị số lượng
            const statValues = document.querySelectorAll('.stat-info .value');

            if (revenueEl) revenueEl.innerText = (stats.revenue || 0).toLocaleString('vi-VN') + 'đ';
            if (ordersEl) ordersEl.innerText = (stats.orders || 0) + ' đơn';

            // Cập nhật số món ăn và số bàn
            if (statValues.length >= 4) {
                statValues[2].innerText = (stats.foods || 0) + ' món';
                statValues[3].innerText = (stats.tables || 0) + ' bàn';
            }
        })
        .catch(err => console.error("Lỗi tải thống kê:", err));
}

function initChart() {
    fetch(`${API_DASHBOARD_URL}/chart`)
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('revenueChart');
            if (!ctx) return;

            // Tự động sinh tên ngày cho 7 ngày gần nhất (VD: 25/10, 26/10...)
            const labels = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
            }

            // Xóa biểu đồ cũ trước khi vẽ mới để không bị lỗi đè hình
            if (revenueChart) {
                revenueChart.destroy();
            }

            revenueChart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: data,
                        backgroundColor: '#047857',
                        borderRadius: 5,
                        maxBarThickness: 50 // BỔ SUNG DÒNG NÀY ĐỂ CỘT KHÔNG BỊ BÉO PHÌ
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Giữ nguyên dòng này
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 } // Tránh trục Y hiển thị số thập phân
                        }
                    }
                }
            });
        })
        .catch(err => console.error("Lỗi tải biểu đồ:", err));
}

// ==========================================
// THỰC THI NGAY KHI TRANG WEB TẢI XONG
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // 1. Gắn sự kiện click cho các nút Menu bên trái
    document.getElementById('menu-dashboard').addEventListener('click', () => switchTab('menu-dashboard', 'tab-dashboard', 'Tổng quan hệ thống'));
    document.getElementById('menu-food').addEventListener('click', () => switchTab('menu-food', 'tab-food', 'Quản lý Thực đơn'));
    document.getElementById('menu-staff').addEventListener('click', () => switchTab('menu-staff', 'tab-staff', 'Quản lý Nhân viên'));
    document.getElementById('menu-table').addEventListener('click', () => switchTab('menu-table', 'tab-table', 'Quản lý Cơ sở vật chất'));

    // 2. Tải dữ liệu và vẽ biểu đồ
    loadFoods();
    loadStaffs();
    loadTables();
    updateDashboardStats();
    initChart();
});