// ROXY STORE - Admin Panel JavaScript

// Admin bilgileri
const ADMIN_EMAIL = "hamitcanaktas5@gmail.com";
const ADMIN_PASSWORD = "hamitcan3124";

// DOM Elementleri
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const announcementForm = document.getElementById('announcementForm');
const productForm = document.getElementById('productForm');
const announcementsTable = document.getElementById('announcementsTable');
const productsTable = document.getElementById('productsTable');
const adminReviewsList = document.getElementById('adminReviewsList');
const currentDateElement = document.getElementById('currentDate');

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Tarihi güncelle
    updateCurrentDate();
    
    // Giriş durumunu kontrol et
    checkLoginStatus();
    
    // Event listener'ları kur
    setupEventListeners();
});

// Tarihi güncelle
function updateCurrentDate() {
    if (currentDateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        currentDateElement.textContent = now.toLocaleDateString('tr-TR', options);
    }
}

// Giriş durumunu kontrol et
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (isLoggedIn && adminEmail === ADMIN_EMAIL) {
        showAdminPanel();
        loadAdminData();
    } else {
        showLoginPanel();
    }
}

// Event listener'ları kur
function setupEventListeners() {
    // Giriş formu
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                // Giriş başarılı
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminEmail', email);
                
                showAdminPanel();
                loadAdminData();
                showMessage('Başarılı giriş! Admin paneline hoş geldiniz.', 'success');
            } else {
                showMessage('Hatalı e-posta veya şifre!', 'error');
            }
        });
    }
    
    // Çıkış butonu
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminEmail');
            showLoginPanel();
            showMessage('Başarıyla çıkış yapıldı.', 'info');
        });
    }
    
    // Duyuru formu
    if (announcementForm) {
        announcementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('announcementTitle').value.trim();
            const content = document.getElementById('announcementContent').value.trim();
            const type = document.getElementById('announcementType').value;
            
            if (!title || !content) {
                showMessage('Lütfen tüm alanları doldurun!', 'error');
                return;
            }
            
            const announcement = {
                id: Date.now(),
                title: title,
                content: content,
                type: type,
                date: new Date().toLocaleDateString('tr-TR'),
                active: true
            };
            
            // Kaydet
            saveAnnouncement(announcement);
            
            // Formu temizle
            announcementForm.reset();
            
            // Listeyi yenile
            loadAnnouncements();
            updateStats();
            
            // Mesaj göster
            showMessage('Duyuru başarıyla eklendi!', 'success');
        });
    }
    
    // İlan formu
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('productName').value.trim();
            const category = document.getElementById('productCategory').value;
            const price = document.getElementById('productPrice').value;
            const status = document.getElementById('productStatus').value;
            const description = document.getElementById('productDescription').value.trim();
            
            if (!name || !category || !price) {
                showMessage('Lütfen zorunlu alanları doldurun!', 'error');
                return;
            }
            
            const product = {
                id: Date.now(),
                name: name,
                category: category,
                price: parseInt(price),
                status: status,
                description: description,
                features: []
            };
            
            // Kaydet
            saveProduct(product);
            
            // Formu temizle
            productForm.reset();
            
            // Listeyi yenile
            loadProducts();
            updateStats();
            
            // Mesaj göster
            showMessage('İlan başarıyla eklendi!', 'success');
        });
    }
}

// Giriş panelini göster
function showLoginPanel() {
    loginContainer.style.display = 'flex';
    adminContainer.style.display = 'none';
}

// Admin panelini göster
function showAdminPanel() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'flex';
}

// Tüm admin verilerini yükle
function loadAdminData() {
    loadAnnouncements();
    loadProducts();
    loadReviews();
    updateStats();
}

// Duyuruları yükle
function loadAnnouncements() {
    if (!announcementsTable) return;
    
    const announcements = getAnnouncements();
    announcementsTable.innerHTML = '';
    
    if (announcements.length === 0) {
        announcementsTable.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #666;">
                    <i class="fas fa-bullhorn" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    Henüz duyuru eklenmemiş.
                </td>
            </tr>
        `;
        return;
    }
    
    // En yeni duyurular önce gelsin
    announcements.sort((a, b) => b.id - a.id);
    
    announcements.forEach(announcement => {
        const row = document.createElement('tr');
        
        // Tür ikonu
        let typeIcon = '📢';
        let typeClass = 'badge-info';
        switch(announcement.type) {
            case 'warning': typeIcon = '⚠️'; typeClass = 'badge-warning'; break;
            case 'success': typeIcon = '🎉'; typeClass = 'badge-success'; break;
            case 'danger': typeIcon = '🚨'; typeClass = 'badge-danger'; break;
        }
        
        row.innerHTML = `
            <td>
                <strong>${announcement.title}</strong>
                <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">${announcement.content.substring(0, 80)}...</div>
            </td>
            <td><span class="badge ${typeClass}">${typeIcon} ${announcement.type}</span></td>
            <td>${announcement.date}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editAnnouncement(${announcement.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteAnnouncement(${announcement.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        announcementsTable.appendChild(row);
    });
}

// İlanları yükle
function loadProducts() {
    if (!productsTable) return;
    
    const products = getProducts();
    productsTable.innerHTML = '';
    
    if (products.length === 0) {
        productsTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #666;">
                    <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    Henüz ilan eklenmemiş.
                </td>
            </tr>
        `;
        return;
    }
    
    // En yeni ilanlar önce gelsin
    products.sort((a, b) => b.id - a.id);
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Kategori metni
        let categoryText = '';
        let categoryIcon = '';
        switch(product.category) {
            case 'virtual-numbers': 
                categoryText = 'Sanal Numaralar';
                categoryIcon = '📞';
                break;
            case 'social-media': 
                categoryText = 'Sosyal Medya';
                categoryIcon = '📱';
                break;
        }
        
        // Durum badge
        let statusBadge = '';
        let statusIcon = '';
        switch(product.status) {
            case 'active': 
                statusBadge = 'badge-success';
                statusIcon = '✅';
                break;
            case 'inactive': 
                statusBadge = 'badge-warning';
                statusIcon = '⏸️';
                break;
            case 'out-of-stock': 
                statusBadge = 'badge-danger';
                statusIcon = '❌';
                break;
        }
        
        row.innerHTML = `
            <td>
                <strong>${product.name}</strong>
                ${product.description ? `<div style="font-size: 0.85rem; color: #666; margin-top: 5px;">${product.description}</div>` : ''}
            </td>
            <td>${categoryIcon} ${categoryText}</td>
            <td><strong>${product.price}₺</strong></td>
            <td><span class="badge ${statusBadge}">${statusIcon} ${product.status}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        productsTable.appendChild(row);
    });
}

// Değerlendirmeleri yükle
function loadReviews() {
    if (!adminReviewsList) return;
    
    const reviews = getReviews();
    adminReviewsList.innerHTML = '';
    
    if (reviews.length === 0) {
        adminReviewsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 15px; display: block; opacity: 0.5;"></i>
                <p>Henüz değerlendirme bulunmamaktadır.</p>
            </div>
        `;
        return;
    }
    
    // En yeni değerlendirmeler önce gelsin
    reviews.sort((a, b) => b.id - a.id);
    
    reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        // Yanıt var mı?
        const hasReply = review.reply && review.reply.trim() !== '';
        
        // Yanıt bölümü
        let replySection = '';
        if (hasReply) {
            replySection = `
                <div class="review-reply">
                    <div class="review-reply-header">
                        <i class="fas fa-reply"></i>
                        <span>Sizin Yanıtınız</span>
                    </div>
                    <div>${review.reply}</div>
                </div>
            `;
        }
        
        reviewItem.innerHTML = `
            <div class="review-header">
                <div>
                    <div class="reviewer-name">${review.name}</div>
                    <div class="reviewer-email">${review.email}</div>
                </div>
                <div class="review-date">${review.date}</div>
            </div>
            <div class="review-content">${review.content}</div>
            
            ${!hasReply ? `
                <div class="review-actions">
                    <button class="btn-action btn-reply" onclick="replyToReview(${review.id})">
                        <i class="fas fa-reply"></i> Yanıtla
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteReview(${review.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            ` : `
                <div class="review-actions">
                    <button class="btn-action btn-reply" onclick="replyToReview(${review.id})">
                        <i class="fas fa-edit"></i> Yanıtı Düzenle
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteReview(${review.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
                ${replySection}
            `}
        `;
        
        adminReviewsList.appendChild(reviewItem);
    });
}

// İstatistikleri güncelle
function updateStats() {
    const products = getProducts().length;
    const reviews = getReviews().length;
    const announcements = getAnnouncements().filter(a => a.active).length;
    const pendingReplies = getReviews().filter(r => !r.reply || r.reply.trim() === '').length;
    
    document.getElementById('totalProducts').textContent = products;
    document.getElementById('totalReviews').textContent = reviews;
    document.getElementById('activeAnnouncements').textContent = announcements;
    document.getElementById('pendingReplies').textContent = pendingReplies;
}

// Mesaj göster (bildirim)
function showMessage(message, type = 'info') {
    // Eski mesajı temizle
    const oldMessage = document.querySelector('.admin-notification');
    if (oldMessage) oldMessage.remove();
    
    // Yeni mesaj oluştur
    const notification = document.createElement('div');
    notification.className = `admin-notification admin-notification-${type}`;
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

// ========== VERİ YÖNETİMİ FONKSİYONLARI ==========

// Duyuruları al
function getAnnouncements() {
    try {
        return JSON.parse(localStorage.getItem('roxyAnnouncements')) || [];
    } catch (e) {
        console.error('Duyurular yüklenirken hata:', e);
        return [];
    }
}

// Duyuru kaydet
function saveAnnouncement(announcement) {
    try {
        const announcements = getAnnouncements();
        announcements.push(announcement);
        localStorage.setItem('roxyAnnouncements', JSON.stringify(announcements));
        return true;
    } catch (e) {
        console.error('Duyuru kaydedilirken hata:', e);
        return false;
    }
}

// İlanları al
function getProducts() {
    try {
        return JSON.parse(localStorage.getItem('roxyProducts')) || [];
    } catch (e) {
        console.error('İlanlar yüklenirken hata:', e);
        return [];
    }
}

// İlan kaydet
function saveProduct(product) {
    try {
        const products = getProducts();
        products.push(product);
        localStorage.setItem('roxyProducts', JSON.stringify(products));
        return true;
    } catch (e) {
        console.error('İlan kaydedilirken hata:', e);
        return false;
    }
}

// Değerlendirmeleri al
function getReviews() {
    try {
        return JSON.parse(localStorage.getItem('roxyStoreReviews')) || [];
    } catch (e) {
        console.error('Değerlendirmeler yüklenirken hata:', e);
        return [];
    }
}

// Değerlendirme kaydet
function saveReview(review) {
    try {
        const reviews = getReviews();
        reviews.push(review);
        localStorage.setItem('roxyStoreReviews', JSON.stringify(reviews));
        return true;
    } catch (e) {
        console.error('Değerlendirme kaydedilirken hata:', e);
        return false;
    }
}

// ========== GLOBAL FONKSİYONLAR ==========

// Duyuruyu düzenle
window.editAnnouncement = function(id) {
    const announcements = getAnnouncements();
    const announcement = announcements.find(a => a.id === id);
    
    if (!announcement) {
        showMessage('Duyuru bulunamadı!', 'error');
        return;
    }
    
    const newTitle = prompt('Duyuru başlığını düzenleyin:', announcement.title);
    if (newTitle === null) return;
    
    const newContent = prompt('Duyuru içeriğini düzenleyin:', announcement.content);
    if (newContent === null) return;
    
    // Güncelle
    announcement.title = newTitle.trim();
    announcement.content = newContent.trim();
    
    // Kaydet
    localStorage.setItem('roxyAnnouncements', JSON.stringify(announcements));
    
    // Listeyi yenile
    loadAnnouncements();
    showMessage('Duyuru başarıyla güncellendi!', 'success');
};

// Duyuruyu sil
window.deleteAnnouncement = function(id) {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
        return;
    }
    
    const announcements = getAnnouncements();
    const filteredAnnouncements = announcements.filter(a => a.id !== id);
    
    localStorage.setItem('roxyAnnouncements', JSON.stringify(filteredAnnouncements));
    
    loadAnnouncements();
    updateStats();
    showMessage('Duyuru başarıyla silindi!', 'success');
};

// İlanı düzenle
window.editProduct = function(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
        showMessage('İlan bulunamadı!', 'error');
        return;
    }
    
    const newName = prompt('İlan adını düzenleyin:', product.name);
    if (newName === null) return;
    
    const newPrice = prompt('Yeni fiyatı girin (₺):', product.price);
    if (newPrice === null) return;
    
    // Güncelle
    product.name = newName.trim();
    product.price = parseInt(newPrice) || product.price;
    
    // Kaydet
    localStorage.setItem('roxyProducts', JSON.stringify(products));
    
    // Listeyi yenile
    loadProducts();
    showMessage('İlan başarıyla güncellendi!', 'success');
};

// İlanı sil
window.deleteProduct = function(id) {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
        return;
    }
    
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    localStorage.setItem('roxyProducts', JSON.stringify(filteredProducts));
    
    loadProducts();
    updateStats();
    showMessage('İlan başarıyla silindi!', 'success');
};

// Değerlendirmeye yanıt ver
window.replyToReview = function(id) {
    const review