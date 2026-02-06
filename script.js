// ROXY STORE - Ana Site JavaScript

// DOM Elementleri
const splashScreen = document.getElementById('splashScreen');
const mainHeader = document.getElementById('mainHeader');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.getElementById('sidebar');
const closeMenu = document.getElementById('closeMenu');
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.sidebar-nav a, .logo');
const purchaseButtons = document.querySelectorAll('.btn-purchase');
const purchaseModal = document.getElementById('purchaseModal');
const closeModal = document.getElementById('closeModal');
const closeModalButton = document.getElementById('closeModalButton');
const modalServiceTitle = document.getElementById('modalServiceTitle');
const reviewForm = document.getElementById('reviewForm');
const loadUserReviewsBtn = document.getElementById('loadUserReviews');
const userReviewsList = document.getElementById('userReviewsList');
const allReviewsList = document.getElementById('allReviewsList');
const userEmailForReviews = document.getElementById('userEmailForReviews');

// Başlangıç verileri
let reviews = [
    {
        id: 1,
        name: "Ahmet Yılmaz",
        email: "ahmet@example.com",
        content: "WhatsApp global numara satın aldım, çok hızlı ve sorunsuz bir şekilde aktive edildi. Teşekkürler ROXY STORE!",
        date: "2023-10-15",
        reply: "Değerli müşterimiz, geri bildiriminiz için teşekkür ederiz. Memnuniyetiniz bizim için önemli."
    },
    {
        id: 2,
        name: "Zeynep Kaya",
        email: "zeynep@example.com",
        content: "Instagram takipçi satın aldım, gerçekten kaliteli ve aktif takipçiler geldi. Fiyat performans açısından harika.",
        date: "2023-10-10",
        reply: "Zeynep Hanım, değerlendirmeniz için çok teşekkür ederiz. Kaliteli hizmet anlayışımızı sürdürmek için çalışıyoruz."
    }
];

// Uygulamayı başlat
function init() {
    // Splash ekranını gizle ve header'ı göster
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        mainHeader.classList.add('visible');
        showPage('home');
        loadReviewsFromStorage();
        displayAllReviews();
        checkAdminStatus();
    }, 2000);
    
    // Event listener'ları kur
    setupEventListeners();
}

// Event listener'ları ayarla
function setupEventListeners() {
    // Hamburger menu
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
    
    // Sidebar'ı kapat
    closeMenu.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
    
    // Navigasyon linkleri
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            
            // Sidebar'ı kapat
            sidebar.classList.remove('active');
            
            // Sayfayı göster
            showPage(pageId);
            
            // Aktif linki güncelle
            updateActiveNavLink(link);
        });
    });
    
    // Satın al butonları
    purchaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const service = button.getAttribute('data-service');
            const price = button.getAttribute('data-price');
            
            modalServiceTitle.textContent = `${service} - ${price}₺`;
            purchaseModal.classList.add('active');
        });
    });
    
    // Modal'ı kapat butonları
    closeModal.addEventListener('click', () => {
        purchaseModal.classList.remove('active');
    });
    
    closeModalButton.addEventListener('click', () => {
        purchaseModal.classList.remove('active');
    });
    
    // Modal dışına tıklayarak kapat
    purchaseModal.addEventListener('click', (e) => {
        if (e.target === purchaseModal) {
            purchaseModal.classList.remove('active');
        }
    });
    
    // Değerlendirme formu
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('reviewerName').value;
            const email = document.getElementById('reviewerEmail').value;
            const content = document.getElementById('reviewContent').value;
            
            // Yeni değerlendirme oluştur
            const newReview = {
                id: Date.now(),
                name: name,
                email: email,
                content: content,
                date: new Date().toLocaleDateString('tr-TR'),
                reply: ""
            };
            
            // Dizimize ekle
            reviews.push(newReview);
            
            // LocalStorage'a kaydet
            saveReviewsToStorage();
            
            // Formu temizle
            reviewForm.reset();
            
            // Mesaj göster
            showMessage('Değerlendirmeniz başarıyla gönderildi! Teşekkür ederiz.', 'success');
            
            // Kullanıcı değerlendirmelerini güncelle
            if (userEmailForReviews && userEmailForReviews.value === email) {
                displayUserReviews(email);
            }
            
            // Tüm değerlendirmeleri güncelle
            displayAllReviews();
        });
    }
    
    // Kullanıcı değerlendirmelerini yükle
    if (loadUserReviewsBtn) {
        loadUserReviewsBtn.addEventListener('click', () => {
            const email = userEmailForReviews.value;
            
            if (!email) {
                showMessage('Lütfen e-posta adresinizi girin.', 'warning');
                return;
            }
            
            displayUserReviews(email);
        });
    }
}

// Sayfa göster
function showPage(pageId) {
    // Tüm sayfaları gizle
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Seçilen sayfayı göster
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
}

// Aktif nav link güncelle
function updateActiveNavLink(clickedLink) {
    // Tüm linklerden active class'ını kaldır
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Tıklanan linke active class'ını ekle
    clickedLink.classList.add('active');
    
    // Sidebar'daki linki de güncelle
    const pageId = clickedLink.getAttribute('data-page');
    const sidebarLink = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
    if (sidebarLink) {
        sidebarLink.classList.add('active');
    }
}

// İsim formatla (Ahmet Y. şeklinde)
function formatNameForDisplay(fullName) {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
        return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return fullName;
}

// LocalStorage'dan değerlendirmeleri yükle
function loadReviewsFromStorage() {
    const storedReviews = localStorage.getItem('roxyStoreReviews');
    if (storedReviews) {
        reviews = JSON.parse(storedReviews);
    }
}

// LocalStorage'a değerlendirmeleri kaydet
function saveReviewsToStorage() {
    localStorage.setItem('roxyStoreReviews', JSON.stringify(reviews));
}

// Tüm değerlendirmeleri göster
function displayAllReviews() {
    if (!allReviewsList) return;
    
    allReviewsList.innerHTML = '';
    
    if (reviews.length === 0) {
        allReviewsList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Henüz değerlendirme bulunmamaktadır.</p>';
        return;
    }
    
    // En yeni değerlendirmeler önce gelsin
    const sortedReviews = [...reviews].sort((a, b) => b.id - a.id);
    
    sortedReviews.forEach(review => {
        const reviewElement = createReviewElement(review, true);
        allReviewsList.appendChild(reviewElement);
    });
}

// Kullanıcı değerlendirmelerini göster
function displayUserReviews(email) {
    if (!userReviewsList) return;
    
    userReviewsList.innerHTML = '';
    
    const userReviews = reviews.filter(review => review.email === email);
    
    if (userReviews.length === 0) {
        userReviewsList.innerHTML = '<p style="text-align: center;">Bu e-posta adresi ile yapılmış değerlendirme bulunamadı.</p>';
        return;
    }
    
    userReviews.forEach(review => {
        const reviewElement = createReviewElement(review, false);
        userReviewsList.appendChild(reviewElement);
    });
}

// Değerlendirme elementi oluştur
function createReviewElement(review, hideEmail = true) {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    const formattedName = hideEmail ? formatNameForDisplay(review.name) : review.name;
    
    reviewCard.innerHTML = `
        <div class="review-header">
            <div class="reviewer-name">${formattedName}</div>
            <div class="review-date">${review.date}</div>
        </div>
        <div class="review-content">${review.content}</div>
    `;
    
    if (review.reply) {
        const replyElement = document.createElement('div');
        replyElement.className = 'admin-reply';
        replyElement.innerHTML = `
            <div class="admin-reply-header">
                <i class="fas fa-reply"></i>
                <span>ROXY STORE Yanıtı</span>
            </div>
            <div>${review.reply}</div>
        `;
        reviewCard.appendChild(replyElement);
    }
    
    return reviewCard;
}

// Mesaj göster (bildirim)
function showMessage(message, type = 'info') {
    // Eski mesajı temizle
    const oldMessage = document.querySelector('.notification');
    if (oldMessage) oldMessage.remove();
    
    // Yeni mesaj oluştur
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Stil ekle
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        background-color: ${type === 'success' ? '#28a745' : 
                         type === 'warning' ? '#ffc107' : 
                         type === 'error' ? '#dc3545' : '#007bff'};
    `;
    
    // Animasyon için style ekle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Admin durumunu kontrol et
function checkAdminStatus() {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (adminLoggedIn && adminEmail === 'hamitcanaktas5@gmail.com') {
        const adminMenuItem = document.getElementById('adminMenuItem');
        if (adminMenuItem) {
            adminMenuItem.style.display = 'block';
        }
    }
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', init);