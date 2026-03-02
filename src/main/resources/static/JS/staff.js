// Bọc TẤT CẢ code bên trong sự kiện này để đảm bảo trang web đã tải xong HTML
document.addEventListener('DOMContentLoaded', function() {

    const orderBoard = document.getElementById('order-board');
    const tableGrid = document.getElementById('table-grid');

    const statusDict = {
        'pending': { text: 'Chờ xác nhận', bg: 'bg-pending' },
        'cooking': { text: 'Đang chế biến', bg: 'bg-cooking' },
        'served': { text: 'Đã phục vụ', bg: 'bg-served' },
        'payment_requested': { text: 'Khách gọi tính tiền', bg: 'bg-cancelled' } 
    };

    // --- KHỞI TẠO BÀN DỰ PHÒNG ---
    const initialTables = [
        { id: 1, name: "Bàn 01", status: "empty" }, { id: 2, name: "Bàn 02", status: "empty" },
        { id: 3, name: "Bàn 03", status: "empty" }, { id: 4, name: "Bàn 04", status: "empty" },
        { id: 5, name: "Bàn 05", status: "empty" }, { id: 6, name: "Bàn 06", status: "empty" }
    ];

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
        });
    }

    // 1. ĐỌC DỮ LIỆU ĐƠN HÀNG
    function getLiveOrders() {
        let status = localStorage.getItem('tableStatus_v3');
        if (!status || status === 'ordering' || status === 'cancelled') return []; 

        let cart = JSON.parse(localStorage.getItem('healthyFoodCart_v3')) || [];
        if (cart.length === 0) return [];

        let note = localStorage.getItem('tableNote_v3') || "";
        
        let currentTableId = localStorage.getItem('myTableId');
        let allTables = JSON.parse(localStorage.getItem('restaurantTables')) || initialTables;
        let tableObj = allTables.find(t => t.id == currentTableId);
        let tableName = tableObj ? tableObj.name : "Chưa rõ bàn";

        return [{
            id: "ORD-" + (currentTableId || "XXX"),
            table: tableName,
            time: "Vừa xong", 
            status: status, 
            items: cart.map(c => ({ name: c.Name, qty: c.quantity })),
            note: note
        }];
    }

    let currentFilter = 'all';

    // 2. VẼ GIAO DIỆN ĐƠN HÀNG
    window.renderOrders = function() {
        if (!orderBoard) return;
        orderBoard.innerHTML = '';
        
        let liveOrders = getLiveOrders();
        let filteredOrders = currentFilter !== 'all' ? liveOrders.filter(o => o.status === currentFilter) : liveOrders;

        if (filteredOrders.length === 0) {
            orderBoard.innerHTML = '<h3 style="color:#888; grid-column:1/-1; text-align:center; padding: 50px 0;">Không có đơn hàng nào ở trạng thái này.</h3>';
            return;
        }

        filteredOrders.forEach(order => {
            let itemsHTML = '';
            order.items.forEach(item => {
                itemsHTML += `<div class="order-item-row"><span class="order-item-qty">x${item.qty}</span><span>${item.name}</span></div>`;
            });

            let noteHTML = order.note ? `<div class="order-note"><i class="fa-solid fa-pen"></i> ${order.note}</div>` : '';
            
            let actionButtons = '';
            if (order.status === 'pending') {
                actionButtons = `
                    <button class="btn btn-outline" onclick="promptCancel('${order.id}', '${order.table}')">Hủy đơn</button>
                    <button class="btn btn-primary" onclick="changeOrderStatus('cooking')" style="flex: 2;">Xác nhận (Báo bếp)</button>
                `;
            } else if (order.status === 'cooking') {
                actionButtons = `<button class="btn btn-primary" style="background:#27ae60; width: 100%;" onclick="changeOrderStatus('served')">Mang ra bàn</button>`;
            } else if (order.status === 'served') {
                actionButtons = `<button class="btn btn-outline" onclick="changeOrderStatus('payment_requested')" style="width: 100%;">Khách gọi thanh toán</button>`;
            } else if (order.status === 'payment_requested') {
                actionButtons = `<button class="btn btn-primary" style="background:#8e44ad; width: 100%;" onclick="completeTable()">Hoàn tất & Đóng bàn</button>`;
            }

            const cardHTML = `
                <div class="order-card status-${order.status}">
                    <div class="order-card-header">
                        <span class="order-table">${order.table}</span>
                        <div>
                            <span class="order-time"><i class="fa-regular fa-clock"></i> ${order.time}</span>
                            <span class="order-badge ${statusDict[order.status].bg}">${statusDict[order.status].text}</span>
                        </div>
                    </div>
                    <div class="order-items-list">${itemsHTML}</div>
                    ${noteHTML}
                    <div class="order-actions">${actionButtons}</div>
                </div>
            `;
            orderBoard.innerHTML += cardHTML;
        });
    }

    // 3. VẼ SƠ ĐỒ BÀN (Đã bỏ nút Khắc phục sự cố)
    window.renderTableMap = function() {
        if (!tableGrid) return;
        tableGrid.innerHTML = '';
        let restaurantTables = JSON.parse(localStorage.getItem('restaurantTables')) || initialTables;

        restaurantTables.forEach(t => {
            const statusClass = t.status === 'empty' ? 'table-empty' : 'table-occupied';
            const statusText = t.status === 'empty' ? 'Trống' : 'Có khách';
            tableGrid.innerHTML += `
                <div class="table-box ${statusClass}">
                    <div>${t.name}</div>
                    <span>${statusText}</span>
                </div>
            `;
        });
    }

    // --- HÀM GIẢI PHÓNG BÀN ---
    function freeCurrentTable() {
        let tId = localStorage.getItem('myTableId');
        let freshTables = JSON.parse(localStorage.getItem('restaurantTables')) || initialTables;
        const index = freshTables.findIndex(t => t.id == tId);
        if(index !== -1) {
            freshTables[index].status = 'empty';
            localStorage.setItem('restaurantTables', JSON.stringify(freshTables));
        }
        localStorage.removeItem('myTableId');
    }

    // --- CÁC HÀM NGHIỆP VỤ ---
    window.changeOrderStatus = function(newStatus) {
        localStorage.setItem('tableStatus_v3', newStatus);
        renderOrders();
    }

    window.completeTable = function() {
        if(confirm("Xác nhận khách đã thanh toán và dọn bàn?")) {
            localStorage.setItem('tableStatus_v3', 'ordering');
            localStorage.setItem('healthyFoodCart_v3', '[]');
            localStorage.setItem('tableNote_v3', '');
            
            freeCurrentTable(); 
            
            renderOrders();
            renderTableMap();
        }
    }

    const cancelModal = document.getElementById('cancel-modal');
    const cancelReason = document.getElementById('cancel-reason');

    window.promptCancel = function(orderId, tableName) {
        document.getElementById('cancel-table-name').innerText = tableName;
        cancelReason.value = ''; 
        cancelModal.style.display = 'flex';
    }

    if(document.getElementById('btn-abort-cancel')) document.getElementById('btn-abort-cancel').addEventListener('click', () => cancelModal.style.display = 'none');
    if(document.getElementById('close-cancel-modal')) document.getElementById('close-cancel-modal').addEventListener('click', () => cancelModal.style.display = 'none');

    if(document.getElementById('btn-confirm-cancel')) {
        document.getElementById('btn-confirm-cancel').addEventListener('click', function() {
            const reason = cancelReason.value.trim();
            if (!reason) { alert("Bắt buộc phải nhập lý do hủy đơn!"); return; }
            
            localStorage.setItem('tableNote_v3', reason); 
            localStorage.setItem('tableStatus_v3', 'cancelled');
            
            freeCurrentTable(); 
            
            cancelModal.style.display = 'none';
            renderOrders(); 
            renderTableMap();
        });
    }

    // Lọc trạng thái
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

    // CHẠY LẦN ĐẦU
    renderOrders(); 
    renderTableMap();

    // LẮNG NGHE KHÁCH HÀNG THAO TÁC
    window.addEventListener('storage', function(event) {
        if (event.key === 'tableStatus_v3' || event.key === 'healthyFoodCart_v3' || event.key === 'restaurantTables') {
            renderOrders(); 
            renderTableMap(); 
        }
    });
});