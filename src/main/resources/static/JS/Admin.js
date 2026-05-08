// ==========================================
// 0. CHỐT CHẶN BẢO MẬT (AUTH GUARD) VÀ ĐĂNG XUẤT
// ==========================================
// 👉 ĐÃ TRẢ VỀ LOCALSTORAGE NHƯ NGUYÊN BẢN
const loggedInUserStr = localStorage.getItem('loggedInUser');
const jwtToken = localStorage.getItem('jwtToken');

if (!loggedInUserStr || !jwtToken) {
    alert("🔒 Vui lòng đăng nhập để truy cập trang Quản trị!");
    window.location.href = "home.html";
} else {
    const currentUser = JSON.parse(loggedInUserStr);

    if (currentUser.role !== 'Admin') {
        alert("⛔ Bạn không có quyền truy cập khu vực của Quản lý!");
        window.location.href = currentUser.role === 'Staff' ? "Staff.html" : "home.html";
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const greetingElement = document.querySelector('.admin-header-top span');
            if (greetingElement) {
                greetingElement.innerHTML = `👋 Chào Quản lý, <b style="color: var(--primary-color);">${currentUser.fullName}</b>`;
            }
        });
    }
}

// ==========================================
// TẠO HÀM BỌC FETCH BẢO MẬT (API INTERCEPTOR)
// ==========================================
let isRedirecting = false;

async function fetchWithAuth(url, options = {}) {
    if (isRedirecting) {
        return new Promise(() => {});
    }

    const token = localStorage.getItem('jwtToken');

    if (!token) {
        if (!isRedirecting) {
            isRedirecting = true;
            alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
            localStorage.clear();
            window.location.href = "home.html";
        }
        throw new Error("No token found");
    }

    options.cache = 'no-store';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        if (!isRedirecting) {
            isRedirecting = true;
            alert("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền! Hệ thống sẽ tự động đăng xuất.");
            localStorage.clear();
            window.location.href = "home.html";
        }
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} - ${errorText}`);
    }

    return response;
}

// ==========================================
// XỬ LÝ NÚT ĐĂNG XUẤT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.admin-menu li:last-child');
    if (logoutBtn) {
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.addEventListener('click', function() {
            if (confirm("Bạn có chắc chắn muốn thoát khỏi hệ thống?")) {
                localStorage.clear();
                window.location.href = "home.html";
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
const API_INVOICE_URL = "http://localhost:8080/api/invoices";
const API_DASHBOARD_URL = "http://localhost:8080/api/dashboard";

let currentFoodPage = 0;
let currentStaffPage = 0;
let currentTablePage = 0;
let currentInvoicePage = 0;
const PAGE_SIZE = 5;

function renderPagination(totalPages, currentPage, containerId, loadFunctionName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (totalPages <= 1) return;

    let html = '<div style="display: flex; justify-content: center; gap: 8px;">';

    const prevDisabled = currentPage === 0 ? 'disabled' : '';
    const prevStyle = currentPage === 0 ? 'background: #ccc; cursor: not-allowed;' : 'background: var(--primary-color); cursor: pointer; color: white;';
    html += `<button style="padding: 6px 12px; border: none; border-radius: 4px; ${prevStyle}" ${prevDisabled} onclick="${loadFunctionName}(${currentPage - 1})">« Trước</button>`;

    for (let i = 0; i < totalPages; i++) {
        const isActive = i === currentPage;
        const btnStyle = isActive
            ? 'background: #2c3e50; color: white; font-weight: bold;'
            : 'background: #ecf0f1; color: #333; cursor: pointer;';
        html += `<button style="padding: 6px 12px; border: none; border-radius: 4px; ${btnStyle}" onclick="${loadFunctionName}(${i})">${i + 1}</button>`;
    }

    const nextDisabled = currentPage === totalPages - 1 ? 'disabled' : '';
    const nextStyle = currentPage === totalPages - 1 ? 'background: #ccc; cursor: not-allowed;' : 'background: var(--primary-color); cursor: pointer; color: white;';
    html += `<button style="padding: 6px 12px; border: none; border-radius: 4px; ${nextStyle}" ${nextDisabled} onclick="${loadFunctionName}(${currentPage + 1})">Sau »</button>`;

    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// KỸ THUẬT DEBOUNCE SEARCH (TÌM KIẾM TỐI ƯU)
// ==========================================
const searchKeywords = { food: '', staff: '', table: '', invoice: '' };
let searchTimeout = null;

function debounceSearch(type, event) {
    if (event && event.key === "Enter") {
        event.preventDefault();
        clearTimeout(searchTimeout);
        executeSearch(type);
        return;
    }
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        executeSearch(type);
    }, 500);
}

function executeSearch(type) {
    const inputElement = document.getElementById(`search-${type}`);
    if (!inputElement) return;

    searchKeywords[type] = inputElement.value.trim();
    console.log(`🔍 Đang tìm kiếm ${type} với từ khóa: "${searchKeywords[type]}"`);

    if (type === 'food') loadFoods(0);
    else if (type === 'staff') loadStaffs(0);
    else if (type === 'table') loadTables(0);
    else if (type === 'invoice') loadInvoices(0);
}

// ==========================================
// 1. LOGIC CHUYỂN TAB (GIAO DIỆN)
// ==========================================
function switchTab(activeMenuId, activeTabId, title) {
    const menus = ['menu-dashboard', 'menu-food', 'menu-staff', 'menu-table', 'menu-invoice'];
    const tabs = ['tab-dashboard', 'tab-food', 'tab-staff', 'tab-table', 'tab-invoice'];

    menus.forEach(id => document.getElementById(id).classList.remove('active-tab'));
    tabs.forEach(id => document.getElementById(id).style.display = 'none');

    document.getElementById(activeMenuId).classList.add('active-tab');
    document.getElementById(activeTabId).style.display = 'block';
    document.getElementById('page-title').innerText = title;
}

// ==========================================
// 2. KẾT NỐI API THỰC TẾ (QUẢN LÝ MÓN ĂN)
// ==========================================
function loadFoods(page = 0) {
    currentFoodPage = page;
    let url = `${API_FOOD_URL}?page=${currentFoodPage}&size=${PAGE_SIZE}`;
    if (searchKeywords.food) {
        url += `&keyword=${encodeURIComponent(searchKeywords.food)}`;
    }
    fetchWithAuth(url)
        .then(response => response.json())
        .then(pageData => {
            renderFoodTable(pageData.content);
            renderPagination(pageData.totalPages, pageData.number, 'pagination-food', 'loadFoods');
        })
        .catch(error => console.error("Lỗi tải món ăn:", error));
}

function renderFoodTable(foods) {
    const tbody = document.querySelector("#tab-food .data-table tbody");
    if (foods.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Chưa có món ăn nào trong hệ thống hoặc không tìm thấy!</td></tr>`;
        return;
    }

    let htmlContent = "";
    foods.forEach(food => {
        const priceFormatted = food.currentPrice.toLocaleString('vi-VN') + 'đ';
        const statusClass = food.isAvailable ? "status-active" : "status-inactive";
        const statusText = food.isAvailable ? "Đang bán" : "Tạm ngưng";
        const categoryName = food.category ? food.category.name : "Chưa phân loại";
        const rowStyle = !food.isAvailable ? 'style="opacity: 0.7; background-color: #f9f9f9;"' : '';

        let safeImageUrl = food.imageURL ? (food.imageURL.startsWith('/') ? food.imageURL : '/' + food.imageURL) : '/image/Flan.png';

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
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
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

function deleteFoodAPI(foodId, foodName) {
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn món "${foodName}" không?`)) {
        fetchWithAuth(`${API_FOOD_URL}/${foodId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert(`Đã xóa thành công món "${foodName}"!`);
                    loadFoods();
                } else alert("Lỗi khi xóa món ăn!");
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
    foodForm.reset();
    if (mode === 'add') {
        document.getElementById('modal-title').innerText = "Thêm món ăn mới";
        document.getElementById('food-id').value = "";
        document.getElementById('food-image').value = "image/Flan.png";
        document.getElementById('food-available').checked = true;
        foodModal.style.display = 'flex';
    }
    else if (mode === 'edit') {
        document.getElementById('modal-title').innerText = "Chỉnh sửa món ăn #" + foodId;
        document.getElementById('food-id').value = foodId;
        document.getElementById('food-name').value = "Đang tải dữ liệu...";
        foodModal.style.display = 'flex';

        fetchWithAuth(`${API_FOOD_URL}/${foodId}`)
            .then(response => response.json())
            .then(food => {
                document.getElementById('food-name').value = food.name;
                document.getElementById('food-price').value = food.currentPrice;
                document.getElementById('food-image').value = food.imageURL || "";
                document.getElementById('food-desc').value = food.description || "";
                document.getElementById('food-available').checked = food.isAvailable;
                if (food.category) document.getElementById('food-category').value = food.category.id;
            })
            .catch(error => {
                console.error("Lỗi Edit:", error);
                alert("❌ Không thể tải dữ liệu món ăn này!");
                closeFoodModal();
            });
    }
}

function closeFoodModal() { foodModal.style.display = 'none'; }

function mockToggleStatus(foodId, foodName, currentStatus) {
    const actionText = currentStatus ? "TẠM NGƯNG bán" : "MỞ BÁN LẠI";
    if (confirm(`Bạn có chắc chắn muốn ${actionText} món "${foodName}" không?`)) {
        fetchWithAuth(`${API_FOOD_URL}/${foodId}/status`, { method: 'PUT' })
            .then(response => {
                if (response.ok) loadFoods();
                else alert("❌ Lỗi khi cập nhật trạng thái trên Server!");
            })
            .catch(error => console.error('Lỗi đổi trạng thái:', error));
    }
}

function mockSaveFood(event) {
    event.preventDefault();
    const foodId = document.getElementById('food-id').value;
    const foodData = {
        name: document.getElementById('food-name').value,
        currentPrice: parseInt(document.getElementById('food-price').value),
        imageURL: document.getElementById('food-image').value,
        description: document.getElementById('food-desc').value,
        isAvailable: document.getElementById('food-available').checked,
        category: { id: parseInt(document.getElementById('food-category').value) }
    };

    const method = foodId === "" ? "POST" : "PUT";
    const url = foodId === "" ? API_FOOD_URL : `${API_FOOD_URL}/${foodId}`;

    fetchWithAuth(url, { method: method, body: JSON.stringify(foodData) })
        .then(response => {
            if (response.ok) {
                alert(foodId === "" ? "🎉 Đã thêm món mới thành công vào Database!" : "🎉 Cập nhật thành công!");
                closeFoodModal();
                loadFoods();
            } else alert("❌ Lỗi khi lưu dữ liệu. Vui lòng kiểm tra lại!");
        })
        .catch(error => console.error("Lỗi SAVE:", error));
}

// ==========================================================
// 4. QUẢN LÝ TÀI KHOẢN NHÂN VIÊN
// ==========================================================
const staffModal = document.getElementById('staff-modal');
const staffForm = document.getElementById('staff-form');

function loadStaffs(page = 0) {
    currentStaffPage = page;
    let url = `${API_USER_URL}?page=${currentStaffPage}&size=${PAGE_SIZE}`;
    if (searchKeywords.staff) {
        url += `&keyword=${encodeURIComponent(searchKeywords.staff)}`;
    }
    fetchWithAuth(url)
        .then(response => response.json())
        .then(pageData => {
            renderStaffTable(pageData.content);
            renderPagination(pageData.totalPages, pageData.number, 'pagination-staff', 'loadStaffs');
        })
        .catch(error => console.error("Lỗi tải nhân viên:", error));
}

function renderStaffTable(staffs) {
    const tbody = document.querySelector("#tab-staff .data-table tbody");
    if (staffs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Chưa có nhân viên nào!</td></tr>`;
        return;
    }

    let htmlContent = "";
    // Đã chuyển lại thành localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    staffs.forEach(staff => {
        const isMe = loggedInUser && loggedInUser.id === staff.id;
        const roleClass = staff.role === 'Admin' ? 'background: #34495e;' : 'background: #3498db;';
        const statusClass = staff.isActive ? "status-active" : "status-inactive";
        const statusText = staff.isActive ? "Hoạt động" : "Đã khóa";
        const rowStyle = !staff.isActive ? 'style="opacity: 0.7; background-color: #f9f9f9;"' : '';

        const toggleBtn = isMe
            ? `<button class="action-btn" style="background: #bdc3c7; cursor: not-allowed;" title="Không thể tự khóa mình"><i class="fa-solid fa-lock"></i></button>`
            : `<button class="action-btn" style="background: ${staff.isActive ? '#f39c12' : '#27ae60'};" title="${staff.isActive ? 'Khóa tài khoản' : 'Mở khóa'}" onclick="toggleStaffStatusAPI(${staff.id}, '${staff.username}', ${staff.isActive})"><i class="fa-solid ${staff.isActive ? 'fa-lock' : 'fa-lock-open'}"></i></button>`;

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

function toggleStaffStatusAPI(userId, username, isActive) {
    const actionText = isActive ? "KHÓA" : "MỞ KHÓA";
    if (confirm(`Bạn có chắc muốn ${actionText} tài khoản "${username}" không?`)) {
        fetchWithAuth(`${API_USER_URL}/${userId}/status`, { method: 'PUT' })
            .then(res => { if (res.ok) loadStaffs(); else alert("Lỗi khi cập nhật trạng thái!"); });
    }
}

function deleteStaffAPI(userId, username) {
    if (confirm(`CẢNH BÁO: Bạn có chắc muốn xóa VĨNH VIỄN tài khoản "${username}" không?`)) {
        fetchWithAuth(`${API_USER_URL}/${userId}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) { alert("Đã xóa thành công!"); loadStaffs(); }
                else alert("Lỗi khi xóa nhân viên!");
            });
    }
}

function openStaffModal(mode, userId = null) {
    staffForm.reset();
    if (mode === 'add') {
        document.getElementById('staff-modal-title').innerText = "Thêm Nhân Viên Mới";
        document.getElementById('staff-id').value = "";
        document.getElementById('staff-password').required = true;
        document.getElementById('staff-password').placeholder = "Nhập mật khẩu...";
        staffModal.style.display = 'flex';
    } else if (mode === 'edit') {
        document.getElementById('staff-modal-title').innerText = "Chỉnh sửa Nhân viên #U00" + userId;
        document.getElementById('staff-id').value = userId;
        document.getElementById('staff-password').required = false;
        document.getElementById('staff-password').placeholder = "Bỏ trống nếu không đổi mật khẩu";
        document.getElementById('staff-fullname').value = "Đang tải...";
        staffModal.style.display = 'flex';

        fetchWithAuth(`${API_USER_URL}/${userId}`)
            .then(res => res.json())
            .then(user => {
                document.getElementById('staff-fullname').value = user.fullName;
                document.getElementById('staff-username').value = user.username;
                document.getElementById('staff-role').value = user.role;
                document.getElementById('staff-active').checked = user.isActive;
            });
    }
}

function closeStaffModal() { staffModal.style.display = 'none'; }

function mockSaveStaff(event) {
    event.preventDefault();
    const id = document.getElementById('staff-id').value;
    const data = {
        fullName: document.getElementById('staff-fullname').value,
        username: document.getElementById('staff-username').value,
        role: document.getElementById('staff-role').value,
        isActive: document.getElementById('staff-active').checked
    };

    const password = document.getElementById('staff-password').value;
    if (password) data.password = password;

    const method = id === "" ? "POST" : "PUT";
    const url = id === "" ? API_USER_URL : `${API_USER_URL}/${id}`;

    fetchWithAuth(url, { method: method, body: JSON.stringify(data) })
        .then(async response => {
            if (response.ok) {
                alert(id === "" ? "Đã tạo tài khoản thành công!" : "Cập nhật thành công!");
                closeStaffModal();
                loadStaffs();
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

function loadTables(page = 0) {
    currentTablePage = page;
    let url = `${API_TABLE_URL}?page=${currentTablePage}&size=${PAGE_SIZE}`;
    if (searchKeywords.table) {
        url += `&keyword=${encodeURIComponent(searchKeywords.table)}`;
    }
    fetchWithAuth(url)
        .then(response => response.json())
        .then(pageData => {
            renderTableGrid(pageData.content);
            renderPagination(pageData.totalPages, pageData.number, 'pagination-table', 'loadTables');
        })
        .catch(error => console.error("Lỗi tải bàn:", error));
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
        fetchWithAuth(`${API_TABLE_URL}/${id}`, { method: 'DELETE' }).then(() => loadTables());
    }
}

function openTableModal(mode, id = null) {
    tableForm.reset();
    if (mode === 'add') {
        document.getElementById('table-modal-title').innerText = "Thêm Bàn Mới";
        document.getElementById('table-id').value = "";
        document.getElementById('group-table-status').style.display = 'none';
        tableModal.style.display = 'flex';
    } else {
        document.getElementById('table-modal-title').innerText = "Sửa " + id;
        document.getElementById('table-id').value = id;
        document.getElementById('group-table-status').style.display = 'block';
        tableModal.style.display = 'flex';

        fetchWithAuth(`${API_TABLE_URL}/${id}`)
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

    fetchWithAuth(url, { method: method, body: JSON.stringify(data) }).then(res => {
        if (res.ok) { closeTableModal(); loadTables(); }
        else alert("Lỗi lưu bàn!");
    });
}

// ==========================================
// 6. DOANH THU & DASHBOARD
// ==========================================
function updateDashboardStats(rangeType = 'week') {
    fetchWithAuth(`${API_DASHBOARD_URL}/stats?range=${rangeType}`)
        .then(res => res.json())
        .then(stats => {
            const revenueEl = document.getElementById('stat-revenue');
            const ordersEl = document.getElementById('stat-orders');
            const statValues = document.querySelectorAll('.stat-info .value');

            if (revenueEl) revenueEl.innerText = (stats.revenue || 0).toLocaleString('vi-VN') + 'đ';
            if (ordersEl) ordersEl.innerText = (stats.orders || 0) + ' đơn';

            if (statValues.length >= 4) {
                statValues[2].innerText = (stats.foods || 0) + ' món';
                statValues[3].innerText = (stats.tables || 0) + ' bàn';
            }
        })
        .catch(err => console.error("Lỗi tải thống kê:", err));
}

let revenueChart;
function initChart(rangeType = 'week') {
    fetchWithAuth(`${API_DASHBOARD_URL}/chart?range=${rangeType}`)
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('revenueChart');
            if (!ctx) return;

            if (revenueChart) {
                revenueChart.destroy();
            }

            revenueChart = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: data.data,
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderWidth: 3,
                        pointBackgroundColor: '#2ecc71',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        })
        .catch(err => console.error("Lỗi tải biểu đồ doanh thu:", err));
}

let myTopFoodChart = null;

function loadTopFoodsChartAllTime() {
    console.log("Đang lấy dữ liệu Top 5 món (Tất cả thời gian) có kèm Doanh Thu...");

    fetchWithAuth(`${API_DASHBOARD_URL}/food-stats-alltime`)
        .then(res => res.json())
        .then(allData => {
            window.allFoodStats = allData;

            const top5 = allData.slice(0, 5);
            const ctx = document.getElementById('topFoodChart');
            if (!ctx) return;

            if (myTopFoodChart) myTopFoodChart.destroy();

            if (!top5 || top5.length === 0) {
                const canvasContext = ctx.getContext('2d');
                canvasContext.clearRect(0, 0, ctx.width || 500, ctx.height || 500);
                canvasContext.font = "16px Poppins";
                canvasContext.fillStyle = "#888";
                canvasContext.textAlign = "center";
                canvasContext.fillText("Chưa có dữ liệu món ăn", ctx.parentElement.offsetWidth / 2, ctx.parentElement.offsetHeight / 2);
                return;
            }

            const labels = top5.map(item => item.name);
            const soldData = top5.map(item => item.sold);
            const revenueData = top5.map(item => item.revenue || 0);

            myTopFoodChart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Số phần đã bán',
                        data: soldData,
                        backgroundColor: [
                            'rgba(231, 76, 60, 0.8)', 'rgba(46, 204, 113, 0.8)',
                            'rgba(52, 152, 219, 0.8)', 'rgba(241, 196, 15, 0.8)', 'rgba(155, 89, 182, 0.8)'
                        ],
                        borderWidth: 0,
                        borderRadius: 5,
                        revenue: revenueData
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const sold = context.raw;
                                    const revenue = context.dataset.revenue[context.dataIndex];
                                    return ` Đã bán: ${sold} phần | Doanh thu: ${revenue.toLocaleString('vi-VN')}đ`;
                                }
                            }
                        }
                    },
                    scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        })
        .catch(err => {
            console.error("❌ LỖI VẼ BIỂU ĐỒ TOP 5:", err);
            const ctx = document.getElementById('topFoodChart').getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, 500, 500);
                ctx.fillText("Lỗi tải dữ liệu. Hãy xem Console (F12)!", 150, 150);
            }
        });
}

// 👉 HÀM MỚI: HIỂN THỊ MODAL BÁO CÁO DOANH THU CHI TIẾT
function showAllFoodRevenue() {
    if (!window.allFoodStats || window.allFoodStats.length === 0) {
        alert("Chưa có dữ liệu bán hàng!");
        return;
    }

    const tbody = document.getElementById('revenue-table-body');
    let htmlContent = '';
    let totalAllRevenue = 0;

    // Duyệt qua từng món để tạo dòng <tr>
    window.allFoodStats.forEach((item, index) => {
        const rev = item.revenue || 0;
        totalAllRevenue += rev;

        // Tạo huy hiệu cho Top 1, 2, 3
        let rankBadge = index + 1;
        if (index === 0) rankBadge = '🥇';
        else if (index === 1) rankBadge = '🥈';
        else if (index === 2) rankBadge = '🥉';

        htmlContent += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="text-align: center; font-weight: bold; font-size: 1.1rem; color: #555;">${rankBadge}</td>
                <td style="font-weight: 600; color: #333;">${item.name}</td>
                <td style="text-align: center;">
                    <span style="background: #e1f5fe; color: #0288d1; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">
                        ${item.sold} phần
                    </span>
                </td>
                <td style="text-align: right; font-weight: bold; color: #d35400; font-size: 1.05rem;">
                    ${rev.toLocaleString('vi-VN')}đ
                </td>
            </tr>
        `;
    });

    // Dòng tổng kết ở cuối bảng
    htmlContent += `
        <tr style="background-color: #fcf3cf;">
            <td colspan="3" style="text-align: right; font-weight: bold; font-size: 1.1rem; color: #333;">TỔNG CỘNG TẤT CẢ DOANH THU:</td>
            <td style="text-align: right; font-weight: bold; color: #c0392b; font-size: 1.2rem;">
                ${totalAllRevenue.toLocaleString('vi-VN')}đ
            </td>
        </tr>
    `;

    // Nhồi HTML vào bảng và hiện Modal lên
    tbody.innerHTML = htmlContent;
    document.getElementById('revenue-modal').style.display = 'flex';
}

// Hàm tắt Modal Doanh thu
function closeRevenueModal() {
    document.getElementById('revenue-modal').style.display = 'none';
}

// ==========================================
// 7. QUẢN LÝ LỊCH SỬ HÓA ĐƠN
// ==========================================
function loadInvoices(page = 0) {
    currentInvoicePage = page;
    let url = `${API_INVOICE_URL}?page=${currentInvoicePage}&size=${PAGE_SIZE}`;
    if (searchKeywords.invoice) {
        url += `&keyword=${encodeURIComponent(searchKeywords.invoice)}`;
    }
    fetchWithAuth(url)
        .then(res => res.json())
        .then(pageData => {
            renderInvoiceTable(pageData.content);
            renderPagination(pageData.totalPages, pageData.number, 'pagination-invoice', 'loadInvoices');
        })
        .catch(err => console.error("Lỗi tải hóa đơn:", err));
}

function renderInvoiceTable(invoices) {
    const tbody = document.querySelector("#tab-invoice .data-table tbody");
    if (invoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Chưa có giao dịch nào!</td></tr>`;
        return;
    }

    let html = "";
    invoices.forEach(inv => {
        const rawTime = inv.paymentTime || inv.createdAt || inv.invoiceDate || new Date();
        const timeObj = new Date(rawTime);
        const timeString = timeObj.toLocaleString('vi-VN');

        const staffName = inv.staffName || (inv.staff && inv.staff.fullName) || (inv.staffId ? `NV #${inv.staffId}` : "Hệ thống");
        const orderId = inv.orderId || inv.order_id || (inv.order && inv.order.id) || "N/A";
        const total = inv.totalAmount || inv.total_amount || inv.subtotal || (inv.order && inv.order.totalAmount) || 0;

        html += `
            <tr>
                <td style="font-weight: bold; color: #8e44ad;">#INV${inv.id}</td>
                <td style="color: #888;">Order #${orderId}</td>
                <td><i class="fa-solid fa-user-tag" style="color:#7f8c8d; margin-right:5px;"></i>${staffName}</td>
                <td>${timeString}</td>
                <td><span style="background: #ecf0f1; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${inv.paymentMethod || 'Tiền mặt'}</span></td>
                <td style="font-weight: bold; color: var(--accent-color);">${Number(total).toLocaleString('vi-VN')}đ</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// ==========================================
// THỰC THI NGAY KHI TRANG WEB TẢI XONG
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('menu-dashboard').addEventListener('click', () => switchTab('menu-dashboard', 'tab-dashboard', 'Tổng quan hệ thống'));
    document.getElementById('menu-food').addEventListener('click', () => switchTab('menu-food', 'tab-food', 'Quản lý Thực đơn'));
    document.getElementById('menu-staff').addEventListener('click', () => switchTab('menu-staff', 'tab-staff', 'Quản lý Nhân viên'));
    document.getElementById('menu-table').addEventListener('click', () => switchTab('menu-table', 'tab-table', 'Quản lý Cơ sở vật chất'));
    document.getElementById('menu-invoice').addEventListener('click', () => switchTab('menu-invoice', 'tab-invoice', 'Lịch sử Giao dịch & Hóa đơn'));

    // Bắt đầu tải dữ liệu bảo mật các tab khác
    loadFoods();
    loadStaffs();
    loadTables();
    loadInvoices();

    // Khởi tạo Dashboard
    loadTopFoodsChartAllTime();
    updateDashboardStats('week');
    initChart('week');

    // Lắng nghe sự kiện đổi Dropdown bộ lọc thời gian
    const filterDropdown = document.getElementById('dashboard-filter-dropdown');
    if (filterDropdown) {
        filterDropdown.addEventListener('change', function() {
            const rangeType = this.value;
            updateDashboardStats(rangeType);
            initChart(rangeType);
        });
    }
});