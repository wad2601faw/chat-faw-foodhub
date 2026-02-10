        /**
         * CONFIGURATION
         * Set USE_PHP_BACKEND to true if you are hosting the PHP files.
         * Set to false to use the Local Simulation for testing in Canvas.
         */
        const USE_PHP_BACKEND = true; 
        const API_URL = 'api.php'; 

        // Global alert function
        window.showAlert = (title, message) => {
            addMessage(`✨ ${title}\n${message}`, 'bot');
        };

        // Toast notification function
        window.showToast = (message, type = 'info', duration = 3000) => {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            let icon = '✓';
            if (type === 'error') icon = '✕';
            if (type === 'info') icon = 'ℹ';
            if (type === 'loading') icon = '⏳';
            
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <span class="toast-icon">${icon}</span>
                <span class="toast-text">${message}</span>
            `;
            
            container.appendChild(toast);
            
            if (type !== 'loading' && duration > 0) {
                setTimeout(() => {
                    toast.style.animation = 'toastSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
                    setTimeout(() => toast.remove(), 300);
                }, duration);
            }
            
            return toast;
        }; 

        // State
        let currentRole = 'buyer'; // 'buyer' or 'seller'
        let currentRequestId = null;
        let pollingInterval = null;
        let auctionContainer = null;
        let userHabit = null;
        let isLoading = false;

        // UI Elements
        const savedSellerName = localStorage.getItem('seller_name');
        const buyerView = document.getElementById('buyer-view');
        const sellerView = document.getElementById('seller-view');
        const chatArea = document.getElementById('chat-area');
        const sellerRequestsList = document.getElementById('seller-requests');
        const userInput = document.getElementById('user-input');
        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');
        const sendBtn = document.getElementById('send-btn');
        
        // --- UTILITY FUNCTIONS ---
        function showLoading(show = true) {
            isLoading = show;
            if (show) {
                sendBtn.classList.add('btn-loading');
                sendBtn.disabled = true;
            } else {
                sendBtn.classList.remove('btn-loading');
                sendBtn.disabled = false;
            }
        }

        function showError(message) {
            showToast(`❌ ${message}`, 'error', 3000);
            console.error(message);
        }

        // --- CORE LOGIC ---

        // 1. Send Request (Buyer)
        async function sendRequest(text) {
            if (isLoading) return;
            
            // Validate input
            if (!text || text.trim().length === 0) {
                showError('Please describe what you want to eat');
                return;
            }

            if (text.trim().length > 500) {
                showError('Description is too long (max 500 characters)');
                return;
            }

            showLoading(true);
            addMessage(text, 'user');
            const loadingToast = showToast('🔍 Searching for sellers...', 'loading', 0);
            
            if (USE_PHP_BACKEND) {
                try {
                    const formData = new FormData();
                    formData.append('action', 'create_request');
                    formData.append('description', text);
                    
                    const res = await fetch(API_URL, { 
                        method: 'POST', 
                        body: formData,
                        timeout: 10000
                    });
                    
                    if (!res.ok) throw new Error('Server error: ' + res.status);
                    
                    const data = await res.json();
                    
                    if (data.error) {
                        loadingToast.remove();
                        showError(data.error);
                    } else if (data.request_id) {
                        loadingToast.remove();
                        currentRequestId = data.request_id;
                        showToast('✅ Request sent! Sellers are bidding...', 'success', 2000);
                        addMessage("🔔 Waiting for sellers to offer their best price... ⏳", 'bot');
                        startPollingOffers();
                    } else {
                        loadingToast.remove();
                        showError('Unexpected response from server');
                    }
                } catch(e) {
                    loadingToast.remove();
                    showError('Failed to send request: ' + e.message);
                } finally {
                    showLoading(false);
                }
            } else {
                // Mock Backend: Store request in "Cloud" (LocalStorage)
                loadingToast.remove();
                currentRequestId = Date.now();
                const requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
                requests.push({ id: currentRequestId, text: text, timestamp: Date.now() });
                localStorage.setItem('mock_requests', JSON.stringify(requests));
                showToast('✅ Request sent! Sellers are bidding...', 'success', 2000);
                addMessage("🔔 Waiting for sellers to offer their best price... ⏳", 'bot');
                startPollingOffers();
                showLoading(false);
            }
        }

        
        async function renderHabits() {
            try {
                const res = await fetch(`${API_URL}?action=get_habits`);
                if (!res.ok) throw new Error("Bad response");

                const habits = await res.json();

                const box = document.getElementById('habit-box');
                const tags = document.getElementById('habit-tags');

                // No habit data → hide
                if (
                    !habits ||
                    (!habits.avg_price && !habits.last_food && !habits.total_orders)
                ) {
                    box.classList.add('hidden');
                    return;
                }

                // Show box
                box.classList.remove('hidden');
                tags.innerHTML = '';

                // 💰 Average price habit
                if (habits.avg_price) {
                    tags.innerHTML += `
                        <span class="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                            💰 ~Rp ${Number(habits.avg_price).toLocaleString()}
                        </span>
                    `;
                }

                // 🍜 Last chosen food
                if (habits.last_food) {
                    tags.innerHTML += `
                        <span class="bg-white border border-orange-300 text-orange-700
                            text-sm px-3 py-1 rounded-full font-semibold">
                            🍜 ${habits.last_food}
                        </span>
                    `;
                }

            } catch (e) {
                console.error("Habit load failed:", e.message);
            }
        }


        // 2. Poll for Offers (Buyer)
        function startPollingOffers() {
            if (pollingInterval) clearInterval(pollingInterval);
            pollingInterval = setInterval(async () => {
                let offers = [];
                
                if (USE_PHP_BACKEND) {
                    try {
                        const res = await fetch(`${API_URL}?action=get_offers&request_id=${currentRequestId}`);
                        offers = await res.json();
                    } catch(e) {}
                } else {
                    // Mock Backend: Check LocalStorage for offers linked to this request
                    const allOffers = JSON.parse(localStorage.getItem('mock_offers') || '[]');
                    offers = allOffers.filter(o => o.requestId == currentRequestId);
                }

                if (offers.length > 0) {
                    renderAuction(offers);
                   
                }
            }, 2000); // Check every 2 seconds
        }

        async function loadUserHabit() {
            try {
                const res = await fetch(`${API_URL}?action=get_habits`);
                if (!res.ok) throw new Error("Bad response");

                const text = await res.text();
                if (!text) throw new Error("Empty response");

                userHabit = JSON.parse(text);
                console.log("Loaded habit:", userHabit);
            } catch (e) {
                console.error("Failed to load habit:", e.message);
                userHabit = null;
            }
        }


        // 3. Render Auction Cards (Buyer)
        function renderAuction(offers) {
            const avg = userHabit?.avg_price
                ? Number(userHabit.avg_price)
                : null;
            const habits = userHabit || {};
            const cheapestPrice = Math.min(...offers.map(o => Number(o.price)));
            const cheapestBias =
                userHabit && userHabit.total_orders
                    ? userHabit.cheapest_count / userHabit.total_orders
                    : 1; // default = cheapest lover

            function isLikely(price) {
                if (!avg) return false;
                return Math.abs(price - avg) <= avg * 0.2;
            }

                // Smart sorting
                offers.sort((a, b) => {
                    if (!habits.avg_price) {
                        return a.price - b.price;
                    }

                    return Math.abs(a.price - habits.avg_price)
                        - Math.abs(b.price - habits.avg_price);
                });

            const cheapest = Math.min(...offers.map(o => parseInt(o.price)));

            // Create auction container ONCE
            if (!auctionContainer) {
                auctionContainer = document.createElement('div');
                auctionContainer.className = 'bot-msg message-bubble w-full';
                auctionContainer.innerHTML = `
                    <div class="font-bold text-orange-600 mb-2">
                        🔥 LIVE OFFERS
                    </div>
                    <div id="auction-list" class="flex flex-col gap-2"></div>
                `;
                chatArea.appendChild(auctionContainer);
            }

            const list = auctionContainer.querySelector('#auction-list');
            list.innerHTML = ''; // 🔥 CLEAR OLD OFFERS

            offers.forEach((offer, index) => {
                const likely = isLikely(parseInt(offer.price));
                const price = Number(offer.price);
                const isBest = price === cheapestPrice;

                // 🎯 POINT SYSTEM (HABIT-BASED)
                let points = 1;

                if (cheapestBias > 0.6) {
                    // Buyer usually chooses cheapest
                    if (price === cheapestPrice) {
                        points = 10;
                    } else {
                        points = 1;
                    }
                } else {
                    // Buyer flexible
                    if (index === 0) points = 5;
                    else if (index === 1) points = 3;
                    else if (index === 2) points = 2;
                }

                const badgeColor =
                    points >= 8
                        ? 'text-green-600 bg-green-50'
                        : 'text-orange-600 bg-orange-50';

                const card = document.createElement('div');
                card.className = `
                    auction-card p-3 rounded-xl flex justify-between items-center
                    ${isBest ? 'border-2 border-green-500 bg-green-50' : ''}
                    ${likely ? 'border-2 border-orange-500 bg-orange-100' : ''}
                `;

                card.innerHTML = `
                <div>
                    <div class="text-[10px] text-gray-500 font-bold uppercase">
                    ${offer.seller_name}
                    </div>

                    <div class="font-bold text-gray-800 flex items-center gap-2">
                    ${offer.food_name}
                    ${isBest ? '<span class="text-green-600 text-xs font-bold">🏆 BEST PRICE</span>' : ''}
                    ${likely ? '<span class="text-orange-600 text-xs font-bold">⭐ RECOMMENDED</span>' : ''}
                    </div>

                    <div class="text-[10px] ${badgeColor} inline-block px-1 rounded font-bold mt-1">
                    ⭐ Score: ${points} pts
                    ${points >= 8 ? '🔥 BEST MATCH' : ''}
                    </div>
                </div>

                <div class="text-right">
                    <div class="text-lg font-bold text-orange-600">
                    Rp ${parseInt(offer.price).toLocaleString()}
                    </div>

                    <button
                    onclick="openContact(
                        '${offer.seller_name}',
                        '${offer.food_name}',
                        '${offer.price}',
                        '${offer.contact}'
                    )"
                    class="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg mt-1 font-bold hover:bg-orange-600"
                    >
                    Contact
                    </button>
                </div>
                `;


                list.appendChild(card);
            });

            chatArea.scrollTop = chatArea.scrollHeight;
        }


        // 4. Load Requests (Seller)
        async function loadSellerRequests() {
            let requests = [];
            if (USE_PHP_BACKEND) {
                try {
                    showLoading(true);
                    const res = await fetch(`${API_URL}?action=get_requests`);
                    if (!res.ok) throw new Error('Failed to load requests');
                    requests = await res.json();
                } catch(e) {
                    showError('Failed to load requests: ' + e.message);
                } finally {
                    showLoading(false);
                }
            } else {
                requests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
            }

            sellerRequestsList.innerHTML = '';
            if (requests.length === 0) {
                sellerRequestsList.innerHTML = '<div class="text-center text-gray-400 mt-12"><i class="fas fa-inbox text-3xl mb-2 opacity-50"></i><p>No active orders yet...</p></div>';
                return;
            }

            requests.forEach(req => {
                const card = document.createElement('div');
                card.className = 'bg-gradient-to-br from-white to-red-50 p-5 rounded-lg shadow-md border-2 border-red-200 hover:shadow-lg transition';
                
                // Safely get request details
                const requestText = req.description || req.text || 'Unknown request';
                const requestTime = req.created_at ? new Date(req.created_at).toLocaleTimeString() : 'Unknown time';
                
                card.innerHTML = `
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <span class="bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full">🔔 NEW ORDER</span>
                            <p class="font-bold text-gray-800 text-lg mt-2">"${requestText}"</p>
                        </div>
                        <div class="text-xs text-gray-500 whitespace-nowrap ml-3">${requestTime}</div>
                    </div>
                    
                    <!-- Offer Form -->
                    <div class="bg-white p-4 rounded-lg border border-red-100 text-sm space-y-3">
                        <div>
                            <label class="text-xs font-bold text-gray-600 mb-1 block">Food Name *</label>
                            <input type="text" id="offer-name-${req.id}" placeholder="e.g., Creamy Seafood Pasta" class="form-input w-full">
                        </div>
                        
                        <div>
                            <label class="text-xs font-bold text-gray-600 mb-1 block">Your Shop Name *</label>
                            <input type="text" id="offer-seller-${req.id}" value="${savedSellerName || ''}" placeholder="e.g., The Spice Kitchen" class="form-input w-full">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-xs font-bold text-gray-600 mb-1 block">Price (Rp) *</label>
                                <input type="number" id="offer-price-${req.id}" placeholder="25000" min="1" class="form-input w-full">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-gray-600 mb-1 block">WhatsApp *</label>
                                <input type="text" id="offer-contact-${req.id}" placeholder="628xx..." class="form-input w-full">
                            </div>
                        </div>
                        
                        <button onclick="submitOffer(${req.id})" class="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-2.5 rounded-lg hover:shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
                            <i class="fas fa-paper-plane"></i>
                            Submit Offer
                        </button>
                    </div>
                `;
                sellerRequestsList.appendChild(card);
            });
        }

        // 5. Submit Offer (Seller)
        async function submitOffer(reqId) {
            const foodName = document.getElementById(`offer-name-${reqId}`).value.trim();
            const price = document.getElementById(`offer-price-${reqId}`).value.trim();
            const contact = document.getElementById(`offer-contact-${reqId}`).value.trim();
            const sellerName = document.getElementById(`offer-seller-${reqId}`).value.trim();

            // Comprehensive Validation
            if (!sellerName) {
                alert("❌ Please enter your shop name");
                return;
            }
            if (sellerName.length < 2) {
                alert("❌ Shop name is too short (min 2 characters)");
                return;
            }
            if (!foodName) {
                alert("❌ Please enter the dish name");
                return;
            }
            if (foodName.length < 2) {
                alert("❌ Dish name is too short (min 2 characters)");
                return;
            }
            if (!price) {
                alert("❌ Please enter the price");
                return;
            }
            const priceNum = parseInt(price);
            if (isNaN(priceNum) || priceNum <= 0) {
                alert("❌ Price must be a valid positive number");
                return;
            }
            if (priceNum > 10000000) {
                alert("❌ Price seems too high (max Rp 10,000,000)");
                return;
            }
            if (!contact) {
                alert("❌ Please enter WhatsApp contact");
                return;
            }
            if (contact.length < 7) {
                alert("❌ Contact number seems invalid");
                return;
            }

            // Save seller name
            localStorage.setItem('seller_name', sellerName);

            const offerData = {
                request_id: reqId,
                seller_name: sellerName,
                food_name: foodName,
                price: priceNum,
                contact: contact
            };

            if (USE_PHP_BACKEND) {
                try {
                    showLoading(true);
                    const formData = new FormData();
                    formData.append('action', 'add_offer');
                    for (const key in offerData) {
                        formData.append(key, offerData[key]);
                    }
                    const res = await fetch(API_URL, { method: 'POST', body: formData });
                    const data = await res.json();
                    
                    if (data.error) {
                        alert("❌ " + data.error);
                    } else {
                        alert("✅ Offer sent to customer!");
                        loadSellerRequests();
                    }
                } catch(e) {
                    alert("❌ Failed to send offer: " + e.message);
                    console.error(e);
                } finally {
                    showLoading(false);
                }
            } else {
                const offers = JSON.parse(localStorage.getItem('mock_offers') || '[]');
                offers.push({ ...offerData, id: Date.now() });
                localStorage.setItem('mock_offers', JSON.stringify(offers));
                alert("✅ Offer sent to customer!");
                loadSellerRequests();
            }
        }


        // --- UTILS ---

        function addMessage(text, type) {
            const div = document.createElement('div');
            div.className = `${type === 'user' ? 'user-msg' : 'bot-msg'} message-bubble`;
            div.innerText = text;
            chatArea.appendChild(div);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        fetch(`${API_URL}?action=get_habits`)
            .then(res => res.json())
            .then(habits => {
                const container = document.getElementById('habit-summary');
                if (!container) return;

                container.innerHTML = `
                    <div class="text-orange-500 font-bold mb-2">YOUR HABITS</div>
                    <div class="flex gap-2 flex-wrap">
                        <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            💰 ~Rp ${Math.round(habits.avg_price).toLocaleString()}
                        </span>
                        <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            🍽 ${habits.last_food}
                        </span>
                    </div>
                `;
            });
    

            function saveUserHabit(food, price, isCheapest) {
                const fd = new FormData();
                fd.append('action', 'save_habit');
                fd.append('food_name', food);
                fd.append('price', price);
                fd.append('is_cheapest', isCheapest);

                fetch(API_URL, { method: 'POST', body: fd });
            }


        // Modal Logic
        const modal = document.getElementById('contact-modal');
        window.openContact = (seller, food, price, contact, isCheapest) => {
            saveUserHabit(food, price, isCheapest ? 1 : 0);
            setTimeout(() => {
                loadUserHabit();
                renderHabits();
            }, 300);

            // Normalize phone number
            contact = contact.replace(/\D/g, '');

            if (contact.startsWith('0')) {
                contact = '62' + contact.slice(1);
            }

            document.getElementById('modal-seller-name').innerText = seller;
            document.getElementById('modal-food-name').innerText = food;
            document.getElementById('modal-price').innerText =
                "Rp " + parseInt(price).toLocaleString();

            const msg =
                `Hi ${seller}, I want to order ${food} for Rp ${price}. Is it available?`;

            const waLink =
                `https://wa.me/${contact}?text=${encodeURIComponent(msg)}`;

            const btn = document.getElementById('whatsapp-link');
            btn.href = waLink;
            btn.target = '_blank';

            modal.classList.remove('hidden');
            };
        window.closeModal = () => modal.classList.add('hidden');
        window.onclick = (e) => { if (e.target == modal) closeModal(); }

        // Role Switching
        window.setRole = (role) => {
            currentRole = role;
            
            // Update UI
            const buyerBtn = document.getElementById('role-buyer');
            const sellerBtn = document.getElementById('role-seller');
            
            if (role === 'buyer') {
                buyerView.classList.remove('hidden');
                sellerView.classList.add('hidden');
                buyerBtn.classList.add('bg-white', 'text-orange-600');
                buyerBtn.classList.remove('bg-white/20', 'text-white');
                sellerBtn.classList.remove('bg-white', 'text-orange-600');
                sellerBtn.classList.add('bg-white/20', 'text-white');
                
                pageTitle.textContent = '🍽️ Place Your Order';
                pageSubtitle.textContent = 'Find your favorite food at the best price';
            } else {
                buyerView.classList.add('hidden');
                sellerView.classList.remove('hidden');
                sellerBtn.classList.add('bg-white', 'text-orange-600');
                sellerBtn.classList.remove('bg-white/20', 'text-white');
                buyerBtn.classList.remove('bg-white', 'text-orange-600');
                buyerBtn.classList.add('bg-white/20', 'text-white');
                
                pageTitle.textContent = '🏪 Incoming Customer Requests';
                pageSubtitle.textContent = 'Submit your best offers to win these orders';
                
                loadSellerRequests();
            }
        };

        // Init
        loadUserHabit();

        document.getElementById('send-btn').onclick = () => {
            const val = userInput.value.trim();
            if(val) {
                sendRequest(val);
                userInput.value = '';
                userInput.focus();
            } else {
                showError('Please type something');
            }
        }
        
        userInput.onkeypress = (e) => { 
            if(e.key === 'Enter' && !isLoading) {
                const val = userInput.value.trim();
                if(val) {
                    sendRequest(val);
                    userInput.value = '';
                }
            }
        }
        
        userInput.addEventListener('input', () => {
            if (userInput.value.trim().length > 0) {
                document.getElementById('send-btn').disabled = false;
            }
        });
        
        addMessage("👋 Welcome! Type what you want to eat, and sellers will bid for your order.", "bot");
