// Bọc TẤT CẢ code bên trong sự kiện này để đảm bảo trang web đã tải xong HTML
document.addEventListener('DOMContentLoaded', function() {

    /* ==============================================================
       KHO DỮ LIỆU CHUNG (CHUẨN DATABASE SCHEMA)
       ============================================================== */
    // 1. ĐỔI TÊN MẢNG CỨNG THÀNH "initialFoodDatabase"
    const initialFoodDatabase = [
        { FoodID: 1, Name: "Chè", CurrentPrice: 25000, ImageURL: "/image/Che.png", Description: "Chè ngọt thanh mát", CategoryID: "trang-mieng", IsAvailable: true, rating: 3 },
        { FoodID: 2, Name: "Flan Vani", CurrentPrice: 35000, ImageURL: "/image/Flan.png", Description: "Flan mềm mịn vị Vani", CategoryID: "trang-mieng", IsAvailable: true, rating: 5 },
        { FoodID: 3, Name: "Flan Cherry", CurrentPrice: 45000, ImageURL: "/image/Flan2.png", Description: "Flan kết hợp mứt Cherry", CategoryID: "trang-mieng", IsAvailable: true, rating: 4 },
        { FoodID: 4, Name: "Flan Xoài", CurrentPrice: 45000, ImageURL: "/image/Flan3.png", Description: "Flan xoài tươi mát", CategoryID: "trang-mieng", IsAvailable: true, rating: 5 },
        { FoodID: 5, Name: "Bánh Kem", CurrentPrice: 45000, ImageURL: "/image/BanhKem.png", Description: "Bánh kem mini ngọt ngào", CategoryID: "trang-mieng", IsAvailable: true, rating: 4 },
        { FoodID: 6, Name: "Bánh Cuốn", CurrentPrice: 35000, ImageURL: "/image/BanhCuon.png", Description: "Bánh cuốn thịt mộc nhĩ", CategoryID: "mon-chinh", IsAvailable: true, rating: 4 },
        { FoodID: 7, Name: "Bánh Mỳ Pate", CurrentPrice: 20000, ImageURL: "/image/BanhMy.png", Description: "Bánh mỳ giòn rụm", CategoryID: "mon-chinh", IsAvailable: true, rating: 4 },
        { FoodID: 8, Name: "Bánh Mỳ Sốt Vàng", CurrentPrice: 45000, ImageURL: "/image/BanhMySotVang.png", Description: "Bò sốt vang đậm vị", CategoryID: "mon-chinh", IsAvailable: true, rating: 5 },
        { FoodID: 9, Name: "Bánh Xèo", CurrentPrice: 25000, ImageURL: "/image/BanhXeo.png", Description: "Bánh xèo miền Tây", CategoryID: "mon-chinh", IsAvailable: true, rating: 4 },
        { FoodID: 10, Name: "Bún Bò Huế", CurrentPrice: 40000, ImageURL: "/image/BunBoHue.png", Description: "Chuẩn vị Huế xưa", CategoryID: "mon-chinh", IsAvailable: true, rating: 5 },
        { FoodID: 11, Name: "Bún Chả", CurrentPrice: 35000, ImageURL: "/image/BunCha.png", Description: "Bún chả Hà Nội", CategoryID: "mon-chinh", IsAvailable: true, rating: 5 },
        { FoodID: 12, Name: "Bún Đậu", CurrentPrice: 35000, ImageURL: "/image/BunDau.png", Description: "Bún đậu mắm tôm", CategoryID: "mon-chinh", IsAvailable: false, rating: 4 },
        { FoodID: 13, Name: "Cơm Tấm", CurrentPrice: 45000, ImageURL: "/image/ComTam.png", Description: "Cơm tấm sườn nướng", CategoryID: "mon-chinh", IsAvailable: true, rating: 4 },
        { FoodID: 14, Name: "Gỏi Cuốn", CurrentPrice: 45000, ImageURL: "/image/GoiCuon.png", Description: "Gỏi cuốn tôm thịt", CategoryID: "mon-chinh", IsAvailable: true, rating: 4 },
        { FoodID: 15, Name: "Nem Nướng", CurrentPrice: 50000, ImageURL: "/image/NemNuong.png", Description: "Nem nướng lụi", CategoryID: "mon-chinh", IsAvailable: true, rating: 4 },
        { FoodID: 16, Name: "Phở Bò", CurrentPrice: 45000, ImageURL: "/image/PhoBo.png", Description: "Phở bò truyền thống", CategoryID: "mon-chinh", IsAvailable: true, rating: 5 },
        { FoodID: 17, Name: "Xôi Cốm", CurrentPrice: 25000, ImageURL: "/image/XoiCom.png", Description: "Xôi cốm dừa", CategoryID: "mon-chinh", IsAvailable: true, rating: 5 },
        { FoodID: 18, Name: "Bò Húc", CurrentPrice: 15000, ImageURL: "/image/BoHuc.png", Description: "Nước tăng lực", CategoryID: "do-uong", IsAvailable: true, rating: 3 },
        { FoodID: 19, Name: "Bạc Xỉu", CurrentPrice: 25000, ImageURL: "/image/BacXiu.png", Description: "Bạc xỉu đá", CategoryID: "do-uong", IsAvailable: true, rating: 3 },
        { FoodID: 20, Name: "Cà Phê", CurrentPrice: 25000, ImageURL: "/image/CaPhe.png", Description: "Cà phê đen đá", CategoryID: "do-uong", IsAvailable: true, rating: 4 },
        { FoodID: 21, Name: "Coca", CurrentPrice: 12000, ImageURL: "/image/Coca.png", Description: "Nước ngọt có gas", CategoryID: "do-uong", IsAvailable: true, rating: 3 },
        { FoodID: 22, Name: "Nước Ép Cam", CurrentPrice: 30000, ImageURL: "/image/NuocCam.png", Description: "Cam vắt nguyên chất", CategoryID: "do-uong", IsAvailable: true, rating: 5 },
        { FoodID: 23, Name: "Nước Ép Dâu", CurrentPrice: 30000, ImageURL: "/image/NuocDau.png", Description: "Dâu tây tươi mát", CategoryID: "do-uong", IsAvailable: true, rating: 4 },
        { FoodID: 24, Name: "Nước Lọc", CurrentPrice: 5000, ImageURL: "/image/NuocLoc.png", Description: "Nước tinh khiết", CategoryID: "do-uong", IsAvailable: true, rating: 4 },
        { FoodID: 25, Name: "Pepsi", CurrentPrice: 12000, ImageURL: "/image/Pepsi.png", Description: "Nước ngọt giải khát", CategoryID: "do-uong", IsAvailable: true, rating: 3 }
    ];

    // 2. NẠP DỮ LIỆU VÀO LOCALSTORAGE NẾU CHƯA CÓ
    if (!localStorage.getItem('restaurantMenu')) {
        localStorage.setItem('restaurantMenu', JSON.stringify(initialFoodDatabase));
    }

    // 3. KHAI BÁO BIẾN `foodDatabase` DÙNG TỪ KHÓA `let` ĐỂ LẤY TỪ BỘ NHỚ RA (Quan trọng!)
    let foodDatabase = JSON.parse(localStorage.getItem('restaurantMenu')) || initialFoodDatabase;

    // --- KHỞI TẠO DỮ LIỆU BÀN (Mô phỏng Database Bàn) ---
    const initialTables = [
        { id: 1, name: "Bàn 01", status: "empty" }, { id: 2, name: "Bàn 02", status: "empty" },
        { id: 3, name: "Bàn 03", status: "empty" }, { id: 4, name: "Bàn 04", status: "empty" },
        { id: 5, name: "Bàn 05", status: "empty" }, { id: 6, name: "Bàn 06", status: "empty" }
    ];

    // Hàm tiện ích: Format tiền kiểu Việt Nam (vd: 25000 -> "25.000đ")
    function formatMoney(amount) { return amount.toLocaleString('vi-VN') + 'đ'; }

    // Hàm tiện ích: Sinh ra HTML của 1 món ăn
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
                <div class="product-img-wrapper"><img src="${food.ImageURL}" alt="${food.Name}"></div>
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

    /* ==============================================================
       1. XỬ LÝ TRANG CHỦ: HIỂN THỊ MÓN NỔI BẬT & SLIDER
       ============================================================== */
    const sliderTrack = document.getElementById('popular-slider-track');

    // Chuyển việc vẽ Slider thành 1 hàm để tái sử dụng khi update Real-time
    function renderSlider() {
        if (sliderTrack) {
            // Lấy lại dữ liệu mới nhất
            const currentFoods = JSON.parse(localStorage.getItem('restaurantMenu')) || foodDatabase;
            const popularFoods = currentFoods.filter(food => food.rating === 5 && food.IsAvailable);
            sliderTrack.innerHTML = '';
            popularFoods.forEach(food => { sliderTrack.innerHTML += generateFoodCard(food); });
            initSlider();
        }
    }

    renderSlider(); // Chạy lần đầu

    function initSlider() {
        const track = document.getElementById('popular-slider-track');
        if(!track) return; // Bảo vệ nếu đang ở trang Menu

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

    /* ==============================================================
       2. XỬ LÝ TRANG MENU: RENDER MÓN ĂN VÀ BỘ LỌC
       ============================================================== */
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

    // Đưa applyFilters ra global scope (gắn vào window) để có thể gọi ở cuối file
    window.applyFilters = function() {
        // Cập nhật lại kho dữ liệu mới nhất
        foodDatabase = JSON.parse(localStorage.getItem('restaurantMenu')) || initialFoodDatabase;
        let filteredData = foodDatabase;

        if (currentCategory !== 'all') filteredData = filteredData.filter(food => food.CategoryID === currentCategory);
        if (currentSearchWord !== '') filteredData = filteredData.filter(food => food.Name.toLowerCase().includes(currentSearchWord));
        renderMenu(filteredData);
    }

    if(menuContainer) window.applyFilters(); // Chạy lần đầu

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
        searchInput.addEventListener('input', function() {
            currentSearchWord = this.value.toLowerCase().trim();
            window.applyFilters();
        });
    }

    /* ==============================================================
       3. CÁC XỬ LÝ KHÁC (POPUP ĐĂNG NHẬP, ẨN HIỆN MẬT KHẨU)
       ============================================================== */
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

    /* ==============================================================
       6 & 7. XỬ LÝ GIỎ HÀNG VÀ TRẠNG THÁI ĐƠN HÀNG TẠI BÀN
       ============================================================== */

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
        if(cartSidebar && cartOverlay) {
            cartSidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
        }
    }

    if(headerCartBtn) headerCartBtn.addEventListener('click', toggleCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if(cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    window.handleAddToCart = function(foodId, openCartSidebar) {
        if (orderStatus !== 'ordering') {
            alert('Bạn đã gọi món rồi! Vui lòng thanh toán đơn hiện tại trước khi gọi thêm món mới.');
            return;
        }

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
        let freshTables = JSON.parse(localStorage.getItem('restaurantTables')) || initialTables;
        let myTableId = localStorage.getItem('myTableId') || "";

        if (tableSelector) {
            tableSelector.innerHTML = '<option value="">-- Chọn bàn của bạn --</option>';
            freshTables.forEach(t => {
                if (t.status === 'empty' || t.id == myTableId) {
                    const isSelected = (t.id == myTableId) ? 'selected' : '';
                    tableSelector.innerHTML += `<option value="${t.id}" ${isSelected}>${t.name}</option>`;
                }
            });
            if (orderStatus !== 'ordering') tableSelector.disabled = true;
            else tableSelector.disabled = false;
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

                    cart = [];
                    orderStatus = 'ordering';
                    localStorage.removeItem('tableNote_v3');
                    updateCartUI();
                    return;
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
                localStorage.setItem('myTableId', selectedTableId);

                let freshTables = JSON.parse(localStorage.getItem('restaurantTables')) || initialTables;
                const tableIndex = freshTables.findIndex(t => t.id == selectedTableId);
                if(tableIndex !== -1) {
                    freshTables[tableIndex].status = 'occupied';
                    localStorage.setItem('restaurantTables', JSON.stringify(freshTables));
                }

                let note = orderNotes ? orderNotes.value.trim() : '';
                localStorage.setItem('tableNote_v3', note);
                orderStatus = 'pending';
                updateCartUI();
                alert(`🔔 Đã gửi hóa đơn đến nhà bếp!`);
            }
            else if (orderStatus === 'served') {
                alert('💳 Đã gửi thông báo tính tiền đến thu ngân. Nhân viên sẽ tới bàn ngay!');
                orderStatus = 'payment_requested';
                updateCartUI();
            }
        });
    }

    updateCartUI();

    // ====================================================================
    // 🌟 MA THUẬT REAL-TIME TRÊN FRONTEND (BỔ SUNG THÊM LẮNG NGHE ADMIN)
    // ====================================================================
    window.addEventListener('storage', function(event) {

        // 1. Lắng nghe Nhân viên thay đổi trạng thái đơn hàng hoặc bàn
        if (event.key === 'tableStatus_v3' || event.key === 'healthyFoodCart_v3' || event.key === 'restaurantTables') {
            orderStatus = localStorage.getItem('tableStatus_v3') || 'ordering';
            cart = JSON.parse(localStorage.getItem('healthyFoodCart_v3')) || [];
            updateCartUI(true);
        }

        // 2. Lắng nghe Admin thay đổi thực đơn
        if (event.key === 'restaurantMenu') {
            // Cập nhật lại lưới Menu ngay lập tức (nếu đang ở trang Menu)
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }

            // Cập nhật lại thanh Slider (nếu đang ở trang Home)
            renderSlider();
        }
    });
});
