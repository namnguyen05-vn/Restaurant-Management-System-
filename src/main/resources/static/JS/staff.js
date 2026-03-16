// ==========================================
// 0. CHỐT CHẶN BẢO MẬT (AUTH GUARD) VÀ ĐĂNG XUẤT
// ==========================================
const loggedInUserStr = localStorage.getItem('loggedInUser');

if (!loggedInUserStr) {
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
                        localStorage.removeItem('loggedInUser');
                        window.location.href = "home.html";
                    }
                });
            }
        });
    }
}

// ==========================================
// CẤU HÌNH API VÀ BIẾN TOÀN CỤC
// ==========================================
const API_ORDER_URL = "http://localhost:8080/api/orders";
const API_TABLE_URL = "http://localhost:8080/api/tables";

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

    // --- LOGIC CHUYỂN TAB (ĐƠN HÀNG <-> QUẢN LÝ BÀN) ---
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
            loadTables(); // Chuyển sang tab bàn thì tải lại sơ đồ bàn
        });
    }

    // ==========================================
    // 1. GỌI API ĐỌC DỮ LIỆU ĐƠN HÀNG (LIVE)
    // ==========================================
    function loadOrders() {
        fetch(API_ORDER_URL)
            .then(res => res.json())
            .then(orders => {
                // Sắp xếp đơn mới nhất lên đầu (ID lớn nhất)
                allOrders = orders.sort((a, b) => b.id - a.id);
                renderOrders();
            })
            .catch(err => console.error("Lỗi tải đơn hàng:", err));
    }

    window.renderOrders = function() {
        if (!orderBoard) return;

        // Ẩn các đơn đã thanh toán hoặc đã hủy khỏi màn hình bếp
        let activeOrders = allOrders.filter(o => o.status !== 'Paid' && o.status !== 'Cancelled');

        // Lọc theo nút filter hiện tại
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
            // Định dạng giờ
            const timeObj = new Date(order.timeCreated || order.orderTime);
            const timeString = timeObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            // Danh sách món ăn từ Backend
            let itemsHTML = '';
            if (order.orderDetails && order.orderDetails.length > 0) {
                order.orderDetails.forEach(item => {
                    itemsHTML += `<div class="order-item-row"><span class="order-item-qty">x${item.quantity}</span><span>${item.food.name}</span></div>`;
                });
            }

            let noteHTML = order.note ? `<div class="order-note" style="color: #e67e22; margin-bottom: 10px;"><i class="fa-solid fa-pen"></i> Ghi chú: ${order.note}</div>` : '';

            // Render nút bấm tùy theo trạng thái (Gọi hàm API thực tế)
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
        fetch(API_TABLE_URL)
            .then(res => res.json())
            .then(tables => {
                if (!tableGrid) return;
                let html = '';
                tables.forEach(t => {
                    const isOccupied = t.status === 'Occupied';
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
        fetch(`${API_ORDER_URL}/${orderId}/status?status=${newStatus}`, { method: 'PUT' })
            .then(res => {
                if (res.ok) {
                    loadOrders(); // Tải lại giao diện ngay

                    // Gửi tín hiệu sang máy khách hàng (home.js) để họ thấy trạng thái đổi
                    localStorage.setItem('tableStatus_v3', newStatus.toLowerCase());
                } else {
                    alert("Lỗi cập nhật trạng thái đơn hàng!");
                }
            });
    }

    window.processPayment = function(orderId) {
        if(confirm("Xác nhận khách đã thanh toán, xuất hóa đơn và dọn bàn?")) {

            // Lấy ID của nhân viên đang đăng nhập để ghi danh vào hóa đơn
            const loggedInUserStr = localStorage.getItem('loggedInUser');
            let staffId = null;
            if (loggedInUserStr) {
                staffId = JSON.parse(loggedInUserStr).id;
            }

            // Đóng gói dữ liệu thanh toán
            const invoicePayload = {
                orderId: orderId,
                staffId: staffId,
                discountAmount: 0, // Mặc định không giảm giá
                paymentMethod: "Tiền mặt" // Mặc định là Tiền mặt
            };

            // Bắn lên API Invoices mới tạo
            fetch("http://localhost:8080/api/invoices", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoicePayload)
            })
                .then(async res => {
                    if (res.ok) {
                        alert("🎉 Đã thanh toán và xuất hóa đơn thành công!");

                        // Xóa giỏ hàng trên máy khách (Để khách khác vào bàn có thể gọi mới)
                        localStorage.setItem('tableStatus_v3', 'ordering');
                        localStorage.setItem('healthyFoodCart_v3', '[]');
                        localStorage.setItem('tableNote_v3', '');
                        localStorage.removeItem('myTableId');
                        localStorage.removeItem('myOrderId');

                        loadOrders(); // Bảng đơn hàng tự động mất đơn này
                        loadTables(); // Bàn tự động chuyển màu xanh (Trống)
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

            // Gọi API Hủy đơn
            fetch(`${API_ORDER_URL}/${orderId}/status?status=Cancelled`, { method: 'PUT' })
                .then(res => {
                    if (res.ok) {
                        alert("Đã hủy đơn hàng!");

                        // Báo cho máy khách
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

    // Cứ 5 giây, tự động gọi Database để lấy đơn hàng và trạng thái bàn mới nhất!
    setInterval(() => {
        loadOrders();
        if (sectionTables && sectionTables.style.display === 'block') {
            loadTables();
        }
    }, 5000);

});