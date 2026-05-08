// Bọc TẤT CẢ code bên trong sự kiện này để đảm bảo trang web đã tải xong HTML
document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 1. CẤU HÌNH API VÀ KHAI BÁO BIẾN DỮ LIỆU
    // ==========================================
    const API_FOOD_URL = "http://localhost:8080/api/foods";
    const API_FOOD_SEARCH_URL = "http://localhost:8080/api/foods/search"; // API Tìm kiếm mới thêm
    const API_USER_LOGIN_URL = "http://localhost:8080/api/users/login";
    const API_TABLE_URL = "http://localhost:8080/api/tables";
    const API_ORDER_URL = "http://localhost:8080/api/orders";

    let foodDatabase = [];
    let restaurantTables = [];

    // Hàm tiện ích: Chuẩn hóa dữ liệu từ Backend gửi về để khớp với Frontend
    function formatFoodData(item) {
        let catSlug = "mon-chinh";
        if (item.category) {
            if (item.category.id === 2) catSlug = "do-uong";
            if (item.category.id === 3) catSlug = "trang-mieng";
        }
        let safeImageUrl = item.imageURL ? (item.imageURL.startsWith('/') ? item.imageURL : '/' + item.imageURL) : '/image/Flan.png';
        return {
            FoodID: item.id,
            Name: item.name,
            CurrentPrice: item.currentPrice,
            ImageURL: safeImageUrl,
            Description: item.description,
            CategoryID: catSlug,
            IsAvailable: item.isAvailable,
            rating: Math.floor(item.rating || 5)
        };
    }

    // ==========================================
    // 2. GỌI API LẤY DỮ LIỆU TỪ BACKEND
    // ==========================================

    // 2.1 Lấy Thực Đơn (Chạy 1 lần khi load trang)
    function loadMenuFromDatabase() {
        // THAY ĐỔI 1: Yêu cầu Backend trả 1000 món ăn trên 1 trang để khách tha hồ chọn
        fetch(`${API_FOOD_URL}?size=1000`)
            .then(response => {
                if (!response.ok) throw new Error("Lỗi kết nối Backend");
                return response.json();
            })
            .then(data => {
                // THAY ĐỔI 2: Xử lý dữ liệu phân trang.
                // Lấy mảng thực tế nằm trong thuộc tính 'content'
                const rawData = data.content ? data.content : data;

                foodDatabase = rawData.map(item => formatFoodData(item));

                renderSlider();
                if (typeof window.applyFilters === 'function') window.applyFilters();
            })
            .catch(error => console.error("Lỗi lấy thực đơn:", error));
    }

    // 2.2 Lấy Danh sách Bàn ăn
    function loadTablesFromDatabase() {
        // Cập nhật: Thêm ?size=100 để lấy toàn bộ danh sách bàn (giả sử quán có tối đa 100 bàn)
        fetch(`${API_TABLE_URL}?size=100`)
            .then(res => res.json())
            .then(data => {
                // XỬ LÝ PHÂN TRANG: Lấy mảng thực tế từ thuộc tính 'content'
                const rawData = data.content ? data.content : data;

                // Ánh xạ dữ liệu DB sang chuẩn Frontend
                restaurantTables = rawData.map(t => ({
                    id: t.id,
                    name: t.tableNumber,
                    status: t.status // "Empty" hoặc "Occupied"
                }));
                updateCartUI(true); // Cập nhật lại thanh chọn bàn
            })
            .catch(err => console.error("Lỗi tải danh sách bàn:", err));
    }

    // ==========================================
    // 3. CÁC HÀM TIỆN ÍCH & VẼ GIAO DIỆN MÓN ĂN
    // ==========================================
    function formatMoney(amount) { return amount.toLocaleString('vi-VN') + 'đ'; }

    function generateFoodCard(food) {
        const stars = '⭐'.repeat(food.rating);
        let actionButtons = `
            <a href="#" class="btn btn-primary" onclick="handleAddToCart(${food.FoodID}, true); return false;">Đặt ngay</a>
            <button class="btn-outline-icon" onclick="handleAddToCart(${food.FoodID}, false); return false;">🛒</button>
        `;
        let stockOverlay = '';

        if (!food.IsAvailable) {
            actionButtons = `<button class="btn" style="background:#ccc; color:#666; width:100%; cursor:not-allowed;" disabled>Hết hàng</button>`;
            stockOverlay = `<div style="position:absolute; top:10px; left:10px; background:red; color:white; padding:5px 10px; border-radius:5px; font-weight:bold; z-index:10; font-size:0.8rem;">TẠM HẾT</div>`;
        }

        return `
            <div class="product-card" data-category="${food.CategoryID}" style="position:relative; opacity: ${food.IsAvailable ? '1' : '0.6'};">
                ${stockOverlay}
                <div class="product-img-wrapper">
                    <img src="${food.ImageURL}" alt="${food.Name}" onerror="this.src='/image/Flan.png'">
                </div>
                <div class="product-info">
                    <div class="product-header">
                        <h3 title="${food.Description}">${food.Name}</h3>
                        <span class="price">${formatMoney(food.CurrentPrice)}</span>
                    </div>
                    <div class="rating">${stars}</div>
                    <div class="product-actions">
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    }

    // ==============================================================
    // 4. XỬ LÝ TRANG CHỦ: HIỂN THỊ MÓN NỔI BẬT & SLIDER
    // ==============================================================
    const sliderTrack = document.getElementById('popular-slider-track');

    function renderSlider() {
        if (sliderTrack) {
            const popularFoods = foodDatabase.filter(food => food.rating === 5 && food.IsAvailable);
            sliderTrack.innerHTML = '';
            popularFoods.forEach(food => { sliderTrack.innerHTML += generateFoodCard(food); });
            initSlider();
        }
    }

    function initSlider() {
        const track = document.getElementById('popular-slider-track');
        if(!track) return;
        const cards = track.querySelectorAll('.product-card');
        if(cards.length === 0) return;

        const nextBtn = document.querySelector('.nav-arrow.next');
        const prevBtn = document.querySelector('.nav-arrow.prev');

        let currentIndex = 0;
        const cardWidth = 280; const gap = 30; const itemWidth = cardWidth + gap;
        const sliderContainer = document.querySelector('.slider-container');
        const itemsPerView = Math.floor(sliderContainer.offsetWidth / itemWidth);
        const maxIndex = cards.length - itemsPerView > 0 ? cards.length - itemsPerView : 0;

        function updateSlider() {
            if (currentIndex < 0) currentIndex = 0;
            if (currentIndex > maxIndex) currentIndex = 0;
            track.style.transform = `translateX(${-(currentIndex * itemWidth)}px)`;
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => { currentIndex++; updateSlider(); resetAutoPlay(); });
            prevBtn.addEventListener('click', () => { currentIndex--; if (currentIndex < 0) currentIndex = maxIndex; updateSlider(); resetAutoPlay(); });
        }

        let autoPlayInterval;
        function startAutoPlay() { autoPlayInterval = setInterval(() => { currentIndex++; updateSlider(); }, 2000); }
        function resetAutoPlay() { clearInterval(autoPlayInterval); startAutoPlay(); }

        startAutoPlay();
        track.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        track.addEventListener('mouseleave', startAutoPlay);
    }

    // ==============================================================
    // 5. XỬ LÝ TRANG MENU: RENDER MÓN ĂN VÀ BỘ LỌC (ĐÃ CẬP NHẬT GỌI API)
    // ==============================================================
    const menuContainer = document.getElementById('menu-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('search-input');

    let currentCategory = 'all';
    let currentSearchWord = '';

    function renderMenu(itemsToRender) {
        if (!menuContainer) return;
        menuContainer.innerHTML = '';
        if (itemsToRender.length === 0) {
            menuContainer.innerHTML = `<h3 style="grid-column: 1/-1; text-align: center; color: #888; padding: 50px;">Không tìm thấy món ăn nào!</h3>`;
            return;
        }
        itemsToRender.forEach(food => { menuContainer.innerHTML += generateFoodCard(food); });
    }

    window.applyFilters = async function() {
        let sourceData = foodDatabase; // Mặc định dùng mảng tải ban đầu

        // Nếu khách hàng có gõ từ khóa tìm kiếm -> Gọi Backend
        if (currentSearchWord !== '') {
            try {
                const url = `${API_FOOD_SEARCH_URL}?keyword=${encodeURIComponent(currentSearchWord)}`;
                const response = await fetch(url);

                if (response.status === 204 || response.status === 404) {
                    sourceData = []; // Backend báo không có món nào
                } else if (response.ok) {
                    const rawData = await response.json();
                    // Chuẩn hóa dữ liệu API trả về bằng hàm tiện ích
                    sourceData = rawData.map(item => formatFoodData(item));
                }
            } catch (error) {
                console.error("Lỗi gọi API tìm kiếm:", error);
                sourceData = [];
            }
        }

        // Sau khi có dữ liệu (Từ DB tĩnh hoặc từ API Tìm kiếm), tiến hành lọc theo danh mục
        let filteredData = sourceData;
        if (currentCategory !== 'all') {
            filteredData = filteredData.filter(food => food.CategoryID === currentCategory);
        }

        renderMenu(filteredData);
    }

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active-filter'));
                this.classList.add('active-filter');
                currentCategory = this.getAttribute('data-filter');
                window.applyFilters();
            });
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            searchInput.classList.toggle('active-search');
            if (searchInput.classList.contains('active-search')) searchInput.focus();
            else { searchInput.value = ''; currentSearchWord = ''; window.applyFilters(); }
        });

        // Sự kiện gõ phím tìm kiếm
        searchInput.addEventListener('input', function() {
            currentSearchWord = this.value.trim(); // Lấy từ khóa chính xác
            window.applyFilters();
        });
    }

    // ==============================================================
    // 6. XỬ LÝ ĐĂNG NHẬP (GỌI API) VÀ POPUP MODAL
    // ==============================================================
    const modal = document.getElementById("login-modal");
    const loginBtn = document.getElementById("login-btn");
    const closeBtn = document.querySelector(".close-modal");

    if (modal && loginBtn && closeBtn) {
        loginBtn.addEventListener('click', function(e) { e.preventDefault(); modal.style.display = "flex"; });
        closeBtn.addEventListener('click', function() { modal.style.display = "none"; });
        window.addEventListener('click', function(e) { if (e.target == modal) { modal.style.display = "none"; } });
    }

    const pwdInput = document.getElementById("pwd-input");
    const pwdEye = document.getElementById("pwd-eye");

    if (pwdInput && pwdEye) {
        pwdEye.addEventListener("click", function() {
            const type = pwdInput.getAttribute("type") === "password" ? "text" : "password";
            pwdInput.setAttribute("type", type);
            this.classList.toggle("fa-eye-slash");
            this.classList.toggle("fa-eye");
            this.style.color = type === "text" ? "var(--primary-color)" : "#888";
        });
    }

    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('username-input');
            const passwordInput = document.getElementById('pwd-input');

            if (!usernameInput || !passwordInput) {
                alert("Lỗi Giao diện: Không tìm thấy ô nhập liệu!"); return;
            }

            const payload = {
                username: usernameInput.value.trim(),
                password: passwordInput.value.trim()
            };

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Đang xác thực..."; submitBtn.disabled = true;

            fetch(API_USER_LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(async response => {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;

                    if (response.ok) {
                        return response.json(); // Bây giờ nó trả về JSON chứa Token
                    } else {
                        const errorMessage = await response.text();
                        throw new Error(errorMessage);
                    }
                })
                .then(data => {
                    localStorage.setItem('loggedInUser', JSON.stringify(data));
                    localStorage.setItem('jwtToken', data.token);

                    if (data.role === 'Admin') window.location.href = "Admin.html";
                    else if (data.role === 'Staff') window.location.href = "Staff.html";
                })
                .catch(error => alert("❌ Đăng nhập thất bại: " + error.message));
        });
    }

    // ==============================================================
    // 7. XỬ LÝ GIỎ HÀNG VÀ TRẠNG THÁI ĐƠN HÀNG TẠI BÀN
    // ==============================================================
    let cart = JSON.parse(localStorage.getItem('healthyFoodCart_v3')) || [];
    let orderStatus = localStorage.getItem('tableStatus_v3') || 'ordering';

    const tableSelector = document.getElementById('table-selector');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const headerCartBtn = document.getElementById('header-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartBadge = document.getElementById('cart-badge');
    const orderBtn = document.getElementById('order-btn');
    const orderStatusBtn = document.getElementById('order-status-btn');
    const noteContainer = document.getElementById('note-container');
    const orderNotes = document.getElementById('order-notes');

    function toggleCart() {
        if(cartSidebar && cartOverlay) { cartSidebar.classList.toggle('active'); cartOverlay.classList.toggle('active'); }
    }

    if(headerCartBtn) headerCartBtn.addEventListener('click', toggleCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if(cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    window.handleAddToCart = function(foodId, openCartSidebar) {
        if (orderStatus !== 'ordering') { alert('Bạn đã gọi món rồi! Vui lòng thanh toán đơn hiện tại trước khi gọi thêm món mới.'); return; }
        const food = foodDatabase.find(f => f.FoodID === foodId);
        if (!food || !food.IsAvailable) return;

        const existingItem = cart.find(item => item.FoodID === foodId);
        if (existingItem) existingItem.quantity += 1;
        else cart.push({ FoodID: food.FoodID, Name: food.Name, CurrentPrice: food.CurrentPrice, ImageURL: food.ImageURL, quantity: 1 });

        updateCartUI();
        if (openCartSidebar) { cartSidebar.classList.add('active'); cartOverlay.classList.add('active'); }
    };

    window.changeQuantity = function(foodId, delta) {
        if (orderStatus !== 'ordering') return;
        const item = cart.find(i => i.FoodID === foodId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) cart = cart.filter(i => i.FoodID !== foodId);
            updateCartUI();
        }
    };

    function updateCartUI(isFromSync = false) {
        let myTableId = localStorage.getItem('myTableId') || "";

        if (tableSelector) {
            tableSelector.innerHTML = '<option value="">-- Chọn bàn của bạn --</option>';
            restaurantTables.forEach(t => {
                if (t.status === 'Empty' || t.id == myTableId) {
                    const isSelected = (t.id == myTableId) ? 'selected' : '';
                    tableSelector.innerHTML += `<option value="${t.id}" ${isSelected}>${t.name}</option>`;
                }
            });
            tableSelector.disabled = (orderStatus !== 'ordering');
        }

        if (!isFromSync) {
            localStorage.setItem('healthyFoodCart_v3', JSON.stringify(cart));
            localStorage.setItem('tableStatus_v3', orderStatus);
        }

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if(cartBadge) cartBadge.innerText = totalItems;

        if (orderBtn && orderStatusBtn && noteContainer) {
            if (cart.length === 0) {
                orderStatusBtn.style.display = 'none';
                noteContainer.style.display = 'block';
                orderBtn.innerText = 'Gọi món';
                orderBtn.style.backgroundColor = 'var(--primary-color)';
                orderBtn.style.cursor = 'pointer';
                orderBtn.disabled = false;
            } else {
                orderStatusBtn.style.display = 'block';

                if (orderStatus === 'ordering') {
                    orderStatusBtn.innerText = 'Đang chọn món...';
                    orderStatusBtn.className = 'status-btn';
                    orderBtn.innerText = 'Gọi món';
                    orderBtn.style.backgroundColor = 'var(--primary-color)';
                    orderBtn.style.cursor = 'pointer';
                    orderBtn.disabled = false;
                    noteContainer.style.display = 'block';
                }
                else if (orderStatus === 'pending') {
                    orderStatusBtn.innerText = 'Chờ nhân viên xác nhận';
                    orderStatusBtn.className = 'status-btn status-preparing';
                    orderBtn.innerText = 'Đã gửi yêu cầu...';
                    orderBtn.style.backgroundColor = '#95a5a6';
                    orderBtn.style.cursor = 'not-allowed';
                    orderBtn.disabled = true;
                    noteContainer.style.display = 'none';
                }
                else if (orderStatus === 'cooking') {
                    orderStatusBtn.innerText = 'Bếp đang làm món';
                    orderStatusBtn.className = 'status-btn status-preparing';
                    orderBtn.innerText = 'Vui lòng đợi trong giây lát...';
                    orderBtn.style.backgroundColor = '#95a5a6';
                    orderBtn.style.cursor = 'not-allowed';
                    orderBtn.disabled = true;
                    noteContainer.style.display = 'none';
                }
                else if (orderStatus === 'served') {
                    orderStatusBtn.innerText = 'Đã phục vụ';
                    orderStatusBtn.className = 'status-btn status-served';
                    orderBtn.innerText = 'Yêu cầu thanh toán';
                    orderBtn.style.backgroundColor = '#d35400';
                    orderBtn.style.cursor = 'pointer';
                    orderBtn.disabled = false;
                    noteContainer.style.display = 'none';
                }
                else if (orderStatus === 'payment_requested') {
                    orderStatusBtn.innerText = 'Đang gọi thanh toán';
                    orderStatusBtn.className = 'status-btn';
                    orderStatusBtn.style.backgroundColor = '#8e44ad';
                    orderBtn.innerText = 'Thu ngân đang tới bàn...';
                    orderBtn.style.backgroundColor = '#95a5a6';
                    orderBtn.style.cursor = 'not-allowed';
                    orderBtn.disabled = true;
                    noteContainer.style.display = 'none';
                }
                else if (orderStatus === 'cancelled') {
                    const reason = localStorage.getItem('tableNote_v3') || 'Không rõ';
                    alert(`❌ Đơn hàng của bạn đã bị hủy bởi nhân viên.\nLý do: ${reason}\n\nVui lòng chọn lại món!`);
                    cart = []; orderStatus = 'ordering'; localStorage.removeItem('tableNote_v3');
                    updateCartUI(); return;
                }
            }
        }

        if (cart.length === 0) {
            if(cartItemsContainer) cartItemsContainer.innerHTML = '<div style="text-align: center; color: #888; margin-top: 50px;">Bàn chưa gọi món nào</div>';
            if(cartTotalPrice) cartTotalPrice.innerText = '0đ';
            return;
        }

        let html = ''; let totalAmount = 0; let isLocked = (orderStatus !== 'ordering');

        cart.forEach(item => {
            totalAmount += item.CurrentPrice * item.quantity;
            const controlHTML = isLocked
                ? `<div class="locked-qty">x${item.quantity}</div>`
                : `<div class="qty-control">
                        <button class="qty-btn" onclick="changeQuantity(${item.FoodID}, -1)">-</button>
                        <input type="text" class="qty-input" value="${item.quantity}" readonly>
                        <button class="qty-btn" onclick="changeQuantity(${item.FoodID}, 1)">+</button>
                   </div>`;

            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <img src="${item.ImageURL}" alt="${item.Name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <h4>${item.Name}</h4>
                            <p>${formatMoney(item.CurrentPrice)}</p>
                        </div>
                    </div>
                    ${controlHTML}
                </div>
            `;
        });

        if(cartItemsContainer) cartItemsContainer.innerHTML = html;
        if(cartTotalPrice) cartTotalPrice.innerText = formatMoney(totalAmount);
    }

    if (orderBtn) {
        orderBtn.addEventListener('click', function() {
            if (cart.length === 0) return;

            if (orderStatus === 'ordering') {
                if (tableSelector && tableSelector.value === "") {
                    alert("Vui lòng chọn bàn bạn đang ngồi trước khi gọi món!");
                    return;
                }

                let selectedTableId = tableSelector.value;
                let note = orderNotes ? orderNotes.value.trim() : '';

                const originalText = orderBtn.innerText;
                orderBtn.innerText = "Đang gửi đơn...";
                orderBtn.disabled = true;

                const orderPayload = {
                    tableId: parseInt(selectedTableId),
                    note: note,
                    items: cart.map(item => ({
                        foodId: item.FoodID,
                        quantity: item.quantity,
                        note: ""
                    }))
                };

                const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                if (loggedInUser && loggedInUser.id) {
                    orderPayload.userId = loggedInUser.id;
                }

                fetch(API_ORDER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                })
                    .then(async response => {
                        orderBtn.innerText = originalText;
                        orderBtn.disabled = false;

                        if (response.ok) return response.json();
                        else {
                            const err = await response.text();
                            throw new Error(err);
                        }
                    })
                    .then(savedOrder => {
                        alert(`🔔 Đã gửi hóa đơn #${savedOrder.id} đến nhà bếp thành công!`);

                        localStorage.setItem('myTableId', selectedTableId);
                        localStorage.setItem('tableNote_v3', note);
                        localStorage.setItem('myOrderId', savedOrder.id);

                        orderStatus = 'pending';

                        const tableIndex = restaurantTables.findIndex(t => t.id == selectedTableId);
                        if(tableIndex !== -1) {
                            restaurantTables[tableIndex].status = 'Occupied';
                        }

                        updateCartUI();
                    })
                    .catch(error => {
                        alert("❌ Lỗi gửi đơn hàng: " + error.message);
                        orderBtn.innerText = originalText;
                        orderBtn.disabled = false;
                    });

            }
            else if (orderStatus === 'served') {
                const myOrderId = localStorage.getItem('myOrderId');
                if (!myOrderId) {
                    alert("Không tìm thấy mã đơn hàng. Vui lòng vẫy tay gọi nhân viên!");
                    return;
                }

                const originalText = orderBtn.innerText;
                orderBtn.innerText = "Đang báo thu ngân...";
                orderBtn.disabled = true;

                fetch(`${API_ORDER_URL}/${myOrderId}/status?status=payment_requested`, { method: 'PUT' })
                    .then(res => {
                        orderBtn.innerText = originalText;
                        orderBtn.disabled = false;

                        if (res.ok) {
                            alert('💳 Đã báo tính tiền! Thu ngân đang kiểm tra hóa đơn và sẽ ra bàn ngay.');
                            orderStatus = 'payment_requested';
                            updateCartUI();
                        } else {
                            alert('❌ Lỗi khi gọi thanh toán. Hãy thử lại!');
                        }
                    })
                    .catch(err => {
                        alert("Lỗi mạng: " + err);
                        orderBtn.innerText = originalText;
                        orderBtn.disabled = false;
                    });
            }
        });
    }

    updateCartUI();

    // ==========================================
    // 8. KHỞI CHẠY LẤY DỮ LIỆU TỪ SERVER
    // ==========================================
    loadMenuFromDatabase();
    loadTablesFromDatabase();

    window.addEventListener('storage', function(event) {
        if (event.key === 'tableStatus_v3' || event.key === 'healthyFoodCart_v3') {
            orderStatus = localStorage.getItem('tableStatus_v3') || 'ordering';
            cart = JSON.parse(localStorage.getItem('healthyFoodCart_v3')) || [];
            updateCartUI(true);
        }
    });

    // ==============================================================
    // 9. NÂNG CẤP: ĐỒNG BỘ ĐƠN HÀNG VÀ CHỐNG XUNG ĐỘT BỘ NHỚ
    // ==============================================================
    function autoSyncOrderStatus() {
        if (orderStatus === 'ordering' || orderStatus === 'payment_requested' || orderStatus === 'cancelled') {
            return;
        }

        const myOrderId = localStorage.getItem('myOrderId');
        if (!myOrderId) return;

        // BẮT BUỘC PHẢI CÓ ?size=1000 ĐỂ KHÔNG BỊ SÓT ĐƠN HÀNG Ở TRANG SAU
        fetch(`${API_ORDER_URL}?size=1000`)
            .then(response => {
                if (!response.ok) throw new Error("Bị chặn hoặc lỗi Server");
                return response.json();
            })
            .then(data => {
                // Xử lý an toàn dữ liệu phân trang
                const rawData = data.content ? data.content : data;
                if (!Array.isArray(rawData)) return;

                // Tìm chính xác đơn hàng của khách
                const myCurrentOrder = rawData.find(order => order.id == myOrderId);

                if (myCurrentOrder) {
                    const statusFromServer = myCurrentOrder.status.toLowerCase();

                    // Nếu trạng thái thay đổi thì mới cập nhật UI
                    if (statusFromServer !== orderStatus && statusFromServer !== 'pending') {
                        console.log("Trạng thái đơn hàng thay đổi thành:", statusFromServer);

                        orderStatus = statusFromServer;
                        localStorage.setItem('tableStatus_v3', orderStatus);

                        // Lệnh này sẽ hiển thị nút "Yêu cầu thanh toán"
                        updateCartUI(true);

                        // Thông báo popup cho khách
                        if (statusFromServer === 'cooking') {
                            alert('👨‍🍳 Bếp đã xác nhận đơn. Món ăn của bạn đang được chế biến!');
                        } else if (statusFromServer === 'served') {
                            alert('🔔 Tinh tinh! Món ăn đã được phục vụ lên bàn. Vui lòng bấm nút Yêu cầu thanh toán khi dùng xong!');
                        } else if (statusFromServer === 'paid') {
                            alert('✅ Đơn hàng đã được thanh toán thành công! Cảm ơn quý khách.');

                            // Chỉ xóa giỏ hàng khi thực sự đã thanh toán xong
                            cart = [];
                            orderStatus = 'ordering';
                            localStorage.removeItem('healthyFoodCart_v3');
                            localStorage.removeItem('tableStatus_v3');
                            localStorage.removeItem('myOrderId');
                            localStorage.removeItem('myTableId');
                            updateCartUI();
                        }
                    }
                }
            })
            .catch(error => {
                // Giấu lỗi để UI khách hàng chạy êm ái
            });
    }
    setInterval(autoSyncOrderStatus, 5000);
});