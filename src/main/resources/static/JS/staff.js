// ==========================================
// 0. CHỐT CHẶN BẢO MẬT (AUTH GUARD) VÀ ĐĂNG XUẤT
// ==========================================
const loggedInUserStr = localStorage.getItem('loggedInUser');
const jwtToken = localStorage.getItem('jwtToken'); // Lấy Token từ kho

if (!loggedInUserStr || !jwtToken) {
    alert("🔒 Vui lòng đăng nhập để truy cập trang Nhân viên!");
    window.location.href = "home.html";
} else {
    const currentUser = JSON.parse(loggedInUserStr);

    if (currentUser.role !== 'Staff' && currentUser.role !== 'Admin') {
        alert("⛔ Bạn không có quyền truy cập khu vực này!");
        window.location.href = "home.html";
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const nameDisplay = document.getElementById('staff-name-display');
            if (nameDisplay) {
                const prefix = currentUser.role === 'Admin' ? 'QL' : 'NV';
                nameDisplay.innerHTML = `👤 ${prefix}: <b>${currentUser.fullName}</b>`;
            }

            const logoutBtn = document.getElementById('btn-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function() {
                    if (confirm("Bạn có chắc chắn muốn thoát khỏi hệ thống?")) {
                        localStorage.clear(); // Xóa sạch cả User và Token
                        window.location.href = "home.html";
                    }
                });
            }
        });
    }
}

// ==========================================
// TẠO HÀM BỌC FETCH BẢO MẬT (API INTERCEPTOR)
// ==========================================
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
        localStorage.clear();
        window.location.href = "home.html";
        throw new Error("No token found");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token, // Gắn vé VIP vào đây
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });

    // Đá văng ra ngoài nếu token hết hạn hoặc cố tình đổi LocalStorage
    if (response.status === 401 || response.status === 403) {
        alert("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền! Hệ thống sẽ tự động đăng xuất.");
        localStorage.clear();
        window.location.href = "home.html";
        throw new Error("Unauthorized");
    }

    return response;
}

// ==========================================
// CẤU HÌNH API VÀ BIẾN TOÀN CỤC
// ==========================================
const API_ORDER_URL = "http://localhost:8080/api/orders";
const API_TABLE_URL = "http://localhost:8080/api/tables";
const API_INVOICE_URL = "http://localhost:8080/api/invoices"; // Thêm API thanh toán

let allOrders = [];
let currentFilter = 'all';

// Bọc TẤT CẢ code bên trong sự kiện DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {

    const orderBoard = document.getElementById('order-board');
    const tableGrid = document.getElementById('table-grid');

    const statusDict = {
        'Pending': { text: 'Chờ xác nhận', bg: 'bg-pending', color: '#f39c12' },
        'Cooking': { text: 'Bếp đang nấu', bg: 'bg-cooking', color: '#3498db' },
        'Served': { text: 'Đã phục vụ', bg: 'bg-served', color: '#27ae60' },
        'payment_requested': { text: 'Khách gọi tính tiền', bg: 'bg-cancelled', color: '#8e44ad' }
    };

    // --- LOGIC CHUYỂN TAB ---
    const navOrders = document.getElementById('nav-orders');
    const navTables = document.getElementById('nav-tables');
    const sectionOrders = document.getElementById('section-orders');
    const sectionTables = document.getElementById('section-tables');

    if(navOrders && navTables) {
        navOrders.addEventListener('click', (e) => {
            e.preventDefault();
            navOrders.classList.add('active-pill');
            navTables.classList.remove('active-pill');
            sectionOrders.style.display = 'block';
            sectionTables.style.display = 'none';
        });

        navTables.addEventListener('click', (e) => {
            e.preventDefault();
            navTables.classList.add('active-pill');
            navOrders.classList.remove('active-pill');
            sectionOrders.style.display = 'none';
            sectionTables.style.display = 'block';
            loadTables();
        });
    }

    // ==========================================
    // 1. GỌI API ĐỌC DỮ LIỆU ĐƠN HÀNG (LIVE)
    // ==========================================
    function loadOrders() {
        fetchWithAuth(API_ORDER_URL) // Đổi thành fetchWithAuth
            .then(res => res.json())
            .then(orders => {
                allOrders = orders.sort((a, b) => b.id - a.id);
                renderOrders();
            })
            .catch(err => console.error("Lỗi tải đơn hàng:", err));
    }

    window.renderOrders = function() {
        if (!orderBoard) return;

        let activeOrders = allOrders.filter(o => o.status !== 'Paid' && o.status !== 'Cancelled');
        let filteredOrders = activeOrders;
        if (currentFilter !== 'all') {
            filteredOrders = activeOrders.filter(o => o.status.toLowerCase() === currentFilter.toLowerCase());
        }

        if (filteredOrders.length === 0) {
            orderBoard.innerHTML = '<h3 style="color:#888; grid-column:1/-1; text-align:center; padding: 50px 0;">Không có đơn hàng nào cần xử lý.</h3>';
            return;
        }

        let html = '';
        filteredOrders.forEach(order => {
            const timeObj = new Date(order.timeCreated || order.orderTime);
            const timeString = timeObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            let itemsHTML = '';
            if (order.orderDetails && order.orderDetails.length > 0) {
                order.orderDetails.forEach(item => {
                    itemsHTML += `<div class="order-item-row"><span class="order-item-qty">x${item.quantity}</span><span>${item.food.name}</span></div>`;
                });
            }

            let noteHTML = order.note ? `<div class="order-note" style="color: #e67e22; margin-bottom: 10px;"><i class="fa-solid fa-pen"></i> Ghi chú: ${order.note}</div>` : '';

            let actionButtons = '';
            if (order.status === 'Pending') {
                actionButtons = `
                    <button class="btn btn-outline" onclick="promptCancel('${order.id}', '${order.table.tableNumber}')">Hủy đơn</button>
                    <button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'Cooking')" style="flex: 2;">Xác nhận (Báo bếp)</button>
                `;
            } else if (order.status === 'Cooking') {
                actionButtons = `<button class="btn btn-primary" style="background:#27ae60; width: 100%;" onclick="updateOrderStatus(${order.id}, 'Served')">Đã xong - Mang ra bàn</button>`;
            } else if (order.status === 'Served') {
                actionButtons = `<button class="btn" style="background:#95a5a6; color:white; width: 100%; cursor:not-allowed;" disabled>Đang phục vụ khách...</button>`;
            } else if (order.status === 'payment_requested') {
                actionButtons = `<button class="btn btn-primary" style="background:#8e44ad; width: 100%;" onclick="processPayment(${order.id})">Hoàn tất & Đóng bàn</button>`;
            }

            const dict = statusDict[order.status] || { text: order.status, bg: '', color: '#333' };

            const cardHTML = `
                <div class="order-card" style="border-top: 4px solid ${dict.color};">
                    <div class="order-card-header">
                        <span class="order-table">${order.table.tableNumber}</span>
                        <div>
                            <span class="order-time"><i class="fa-regular fa-clock"></i> ${timeString}</span>
                            <span class="order-badge" style="background: ${dict.color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${dict.text}</span>
                        </div>
                    </div>
                    <div class="order-items-list">${itemsHTML}</div>
                    ${noteHTML}
                    <div style="font-weight: bold; margin-bottom: 10px; border-top: 1px dashed #ccc; padding-top: 10px;">
                        Tổng tiền: <span style="color: #e74c3c;">${(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div class="order-actions">${actionButtons}</div>
                </div>
            `;
            html += cardHTML;
        });

        orderBoard.innerHTML = html;
    }

    // ==========================================
    // 2. VẼ SƠ ĐỒ BÀN TỪ API
    // ==========================================
    window.loadTables = function() {
        // Chúng ta thêm ?size=100 để đảm bảo lấy hết tất cả các bàn để vẽ sơ đồ
        fetchWithAuth(`${API_TABLE_URL}?size=100`)
            .then(res => res.json())
            .then(data => {
                if (!tableGrid) return;

                // XỬ LÝ DỮ LIỆU PHÂN TRANG: Trích xuất mảng từ thuộc tính 'content'
                const tables = data.content ? data.content : data;

                let html = '';
                tables.forEach(t => {
                    const isOccupied = t.status === 'Occupied';
                    // Nếu là bàn đang có khách (Occupied) thì hiện màu vàng, bàn trống (Empty) hiện màu xanh
                    const bgColor = isOccupied ? '#ffeaa7' : '#55efc4';
                    const iconColor = isOccupied ? '#d35400' : '#00b894';

                    html += `
                        <div style="background: ${bgColor}; padding: 30px; border-radius: 15px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <i class="fa-solid fa-chair" style="font-size: 3rem; color: ${iconColor}; margin-bottom: 15px;"></i>
                            <h3 style="margin: 0; color: #333;">${t.tableNumber}</h3>
                            <p style="margin: 5px 0 0 0; font-weight: bold; color: ${iconColor};">${isOccupied ? 'Đang có khách' : 'Bàn trống'}</p>
                        </div>
                    `;
                });
                tableGrid.innerHTML = html;
            })
            .catch(err => console.error("Lỗi tải sơ đồ bàn:", err));
    }

    // ==========================================
    // 3. API CẬP NHẬT TRẠNG THÁI (NGHIỆP VỤ)
    // ==========================================
    window.updateOrderStatus = function(orderId, newStatus) {
        fetchWithAuth(`${API_ORDER_URL}/${orderId}/status?status=${newStatus}`, { method: 'PUT' }) // Đổi thành fetchWithAuth
            .then(res => {
                if (res.ok) {
                    loadOrders();
                    localStorage.setItem('tableStatus_v3', newStatus.toLowerCase());
                } else {
                    alert("Lỗi cập nhật trạng thái đơn hàng!");
                }
            });
    }

    window.processPayment = function(orderId) {
        if(confirm("Xác nhận khách đã thanh toán, xuất hóa đơn và dọn bàn?")) {

            const loggedInUserStr = localStorage.getItem('loggedInUser');
            let staffId = null;
            if (loggedInUserStr) {
                staffId = JSON.parse(loggedInUserStr).id;
            }

            const invoicePayload = {
                orderId: orderId,
                staffId: staffId,
                discountAmount: 0,
                paymentMethod: "Tiền mặt"
            };

            fetchWithAuth(API_INVOICE_URL, { // Đổi thành fetchWithAuth
                method: 'POST',
                body: JSON.stringify(invoicePayload)
            })
                .then(async res => {
                    if (res.ok) {
                        alert("🎉 Đã thanh toán và xuất hóa đơn thành công!");

                        localStorage.setItem('tableStatus_v3', 'ordering');
                        localStorage.setItem('healthyFoodCart_v3', '[]');
                        localStorage.setItem('tableNote_v3', '');
                        localStorage.removeItem('myTableId');
                        localStorage.removeItem('myOrderId');

                        loadOrders();
                        loadTables();
                    } else {
                        const err = await res.text();
                        alert("❌ Lỗi thanh toán: " + err);
                    }
                })
                .catch(err => alert("Lỗi mạng: " + err));
        }
    }

    // ==========================================
    // 4. HỦY ĐƠN HÀNG (MODAL)
    // ==========================================
    const cancelModal = document.getElementById('cancel-modal');
    const cancelReason = document.getElementById('cancel-reason');

    window.promptCancel = function(orderId, tableName) {
        document.getElementById('cancel-order-id').value = orderId;
        document.getElementById('cancel-table-name').innerText = tableName;
        cancelReason.value = '';
        cancelModal.style.display = 'flex';
    }

    function closeCancel() { cancelModal.style.display = 'none'; }
    if(document.getElementById('btn-abort-cancel')) document.getElementById('btn-abort-cancel').addEventListener('click', closeCancel);
    if(document.getElementById('close-cancel-modal')) document.getElementById('close-cancel-modal').addEventListener('click', closeCancel);

    if(document.getElementById('btn-confirm-cancel')) {
        document.getElementById('btn-confirm-cancel').addEventListener('click', function() {
            const reason = cancelReason.value.trim();
            if (!reason) { alert("Bắt buộc phải nhập lý do hủy đơn!"); return; }

            const orderId = document.getElementById('cancel-order-id').value;

            fetchWithAuth(`${API_ORDER_URL}/${orderId}/status?status=Cancelled`, { method: 'PUT' }) // Đổi thành fetchWithAuth
                .then(res => {
                    if (res.ok) {
                        alert("Đã hủy đơn hàng!");

                        localStorage.setItem('tableNote_v3', reason);
                        localStorage.setItem('tableStatus_v3', 'cancelled');

                        closeCancel();
                        loadOrders();
                        loadTables();
                    }
                });
        });
    }

    // ==========================================
    // 5. LỌC TRẠNG THÁI ĐƠN HÀNG
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active-filter'));
                this.classList.add('active-filter');
                currentFilter = this.getAttribute('data-status');
                renderOrders();
            });
        });
    }

    // ==========================================
    // 6. KHỞI CHẠY VÀ POLLING (THỜI GIAN THỰC)
    // ==========================================
    loadOrders();
    loadTables();

    setInterval(() => {
        loadOrders();
        if (sectionTables && sectionTables.style.display === 'block') {
            loadTables();
        }
    }, 5000);

});