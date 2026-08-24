document.addEventListener('DOMContentLoaded', () => {

  const state = {
    theme: localStorage.getItem('flora_theme') || 'light',
    cart: [],
    products: [
      { id: 1, name: 'Velvet Peony', category: 'floral', price: 42.00, image: 'images/V Peony.jfif' },
      { id: 2, name: 'Amber & Cedar', category: 'woody', price: 45.00, image: 'images/Amber & Cedar.webp' },
      { id: 3, name: 'Wild Sage', category: 'fresh', price: 38.00, image: 'images/Wild Sage.webp' },
      { id: 4, name: 'Midnight Jasmine', category: 'floral', price: 42.00, image: 'images/M Jasmine.webp' },
      { id: 5, name: 'Sandalwood Sanctum', category: 'woody', price: 48.00, image: 'images/Sandalwood Sanctum.avif' },
      { id: 6, name: 'Bergamot Breeze', category: 'fresh', price: 40.00, image: 'images/Bergamot Breeze.webp' }
    ]
  };

  const themeToggleBtn = document.querySelector('.js-theme-toggle');
  const themeIcon = document.querySelector('.js-theme-icon');
  const themeText = document.querySelector('.js-theme-text');
  
  const navItems = document.querySelectorAll('.js-nav-item');
  const pageViews = document.querySelectorAll('.js-page-view');
  
  const productGrid = document.querySelector('.js-product-grid');
  const filterBtns = document.querySelectorAll('.js-filter-btn');
  
  const cartTrigger = document.querySelector('.js-cart-trigger');
  const cartDrawer = document.querySelector('.js-cart-drawer');
  const cartOverlay = document.querySelector('.js-cart-overlay');
  const cartClose = document.querySelector('.js-cart-close');
  const cartCount = document.querySelector('.js-cart-count');
  const cartItemsContainer = document.querySelector('.js-cart-items');
  const cartTotal = document.querySelector('.js-cart-total');
  const checkoutBtn = document.querySelector('.js-checkout-btn');
  
  const accordionHeaders = document.querySelectorAll('.js-accordion-header');
  const contactForm = document.querySelector('.js-contact-form');
  const toast = document.querySelector('.js-toast');
  const toastMsg = document.querySelector('.js-toast-msg');

  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeUI();
  }

  function updateThemeUI() {
    if (state.theme === 'dark') {
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Light Mode';
    } else {
      themeIcon.textContent = '🌙';
      themeText.textContent = 'Dark Mode';
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('flora_theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeUI();
  });

  function handleNavigation(targetId) {
    const targetHash = targetId.startsWith('#') ? targetId : `#${targetId}`;
    
    pageViews.forEach(view => {
      if (`#${view.id}` === targetHash) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    navItems.forEach(item => {
      if (item.getAttribute('href') === targetHash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href');
      handleNavigation(targetId);
    });
  });

  function renderProducts(categoryFilter = 'all') {
    if (!productGrid) return;
    productGrid.innerHTML = '';

    const filtered = categoryFilter === 'all' 
      ? state.products 
      : state.products.filter(p => p.category === categoryFilter);

    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-visual">
          <img src="${product.image}" alt="${product.name}" class="product-card-img">
        </div>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <button class="add-to-cart-btn js-add-cart" data-id="${product.id}">Add to Bag</button>
      `;
      productGrid.appendChild(card);
    });

    document.querySelectorAll('.js-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        addToCart(id);
      });
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderProducts(e.target.dataset.category);
    });
  });

  function toggleCart(open) {
    if (open) {
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
    } else {
      cartDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
    }
  }

  function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      state.cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    showToast(`Added ${product.name} to your bag.`);
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    updateCartUI();
  }

  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your bag is currently empty.</p>';
      checkoutBtn.disabled = true;
      cartTotal.textContent = '$0.00';
      return;
    }

    checkoutBtn.disabled = false;
    cartItemsContainer.innerHTML = '';
    let grandTotal = 0;

    state.cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      grandTotal += itemTotal;

      const row = document.createElement('div');
      row.className = 'cart-item-single';
      row.innerHTML = `
        <div>
          <h4>${item.name}</h4>
          <p class="text-muted">${item.quantity} x $${item.price.toFixed(2)}</p>
        </div>
        <div>
          <span>$${itemTotal.toFixed(2)}</span>
          <button class="js-remove-item" data-id="${item.id}" style="color:red; margin-left:8px;">&times;</button>
        </div>
      `;
      cartItemsContainer.appendChild(row);
    });

    cartTotal.textContent = `$${grandTotal.toFixed(2)}`;

    document.querySelectorAll('.js-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        removeFromCart(parseInt(e.target.dataset.id));
      });
    });
  }

  checkoutBtn.addEventListener('click', () => {
    if (state.cart.length === 0) return;

    state.cart = [];
    cartCount.textContent = '0';
    cartTotal.textContent = '$0.00';
    checkoutBtn.disabled = true;

    cartItemsContainer.innerHTML = `
      <div class="checkout-success-msg">
        <h4>Order Placed Successfully!</h4>
        <p>Thank you for your purchase. We have received your order and are preparing it for shipment.</p>
      </div>
    `;
  });

  cartTrigger.addEventListener('click', () => toggleCart(true));
  cartClose.addEventListener('click', () => toggleCart(false));
  cartOverlay.addEventListener('click', () => toggleCart(false));

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      const statusDiv = document.querySelector('.js-form-status');

      let isValid = true;

      if (nameInput.value.trim() === '') {
        document.querySelector('.js-error-name').textContent = 'Name is required.';
        isValid = false;
      } else {
        document.querySelector('.js-error-name').textContent = '';
      }

      if (!emailInput.value.includes('@')) {
        document.querySelector('.js-error-email').textContent = 'Valid email required.';
        isValid = false;
      } else {
        document.querySelector('.js-error-email').textContent = '';
      }

      if (messageInput.value.trim() === '') {
        document.querySelector('.js-error-message').textContent = 'Message cannot be empty.';
        isValid = false;
      } else {
        document.querySelector('.js-error-message').textContent = '';
      }

      if (isValid) {
        statusDiv.style.color = 'green';
        statusDiv.textContent = 'Thank you for your message. We will respond shortly.';
        contactForm.reset();
      }
    });
  }

  function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }

  initTheme();
  renderProducts();
});