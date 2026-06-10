import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ADMIN_PASSWORD,
  DEFAULT_PRODUCTS,
  DEFAULT_UPI,
  DEFAULT_REVIEWS,
  PRODUCT_DESCRIPTIONS,
  buildQrCodeUrl,
  buildUpiHref,
  formatCurrency,
  parseBoolean,
  parseProductRows,
} from './data.js';

function Logo() {
  return (
    <span className="nexshop-logo">
      <span className="logo-nex">nex</span>
      <span className="logo-shop">shop</span>
    </span>
  );
}

function Header({ cartCount, onCartOpen }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="meesho-header">
      <div className="header-container">
        <div className="header-topRow">
          <div className="header-left">
            <button
              className="hamburger-btn"
              aria-label="Menu"
              onClick={() => setNavOpen((value) => !value)}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link to="/" className="brand-logo">
              <Logo />
            </Link>
          </div>

          <div className="header-right">
            <a href="#" className="header-icon" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#ED3843"
                  d="M22 9.174c0 3.724-1.87 7.227-9.67 12.38a.58.58 0 0 1-.66 0C3.87 16.401 2 12.898 2 9.174S4.59 3.67 7.26 3.66c3.22-.081 4.61 3.573 4.74 3.774.13-.201 1.52-3.855 4.74-3.774C19.41 3.669 22 5.45 22 9.174Z"
                />
              </svg>
            </a>

            <button className="header-icon cart-wrapper" aria-label="Cart" onClick={onCartOpen}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#9F2089"
                  d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
                />
              </svg>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        <div className="header-search">
          <div className="search-box">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="#94a3b8" strokeWidth="2" fill="none">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search for Sarees, Kurtis, Cosmetics, etc." />
          </div>
        </div>
      </div>
    </header>
  );
}

function CartDrawer({ isOpen, onClose, items, onUpdateQty }) {
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => {
    const value = parseFloat(item.sellPrice.replace(/[₹,]/g, '')) || 0;
    return sum + value * item.qty;
  }, 0);

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`cart-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3>
            My Cart (<span>{items.reduce((sum, item) => sum + item.qty, 0)}</span>)
          </h3>
          <button onClick={onClose} aria-label="Close cart">×</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.imgUrl} alt={item.name} />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">{item.sellPrice}</p>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => onUpdateQty(item.id, item.qty - 1)}>-</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="total-row">
            <span>Total Value:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button
            className="checkout-btn"
            onClick={() => {
              onClose();
              navigate('/cart');
            }}
          >
            Proceed to Buy
          </button>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, onAddToCart, onView }) {
  return (
    <div className="product-card" onClick={onView}>
      <div className="product-img">
        <img src={product.imgUrl} alt={product.name} loading="lazy" />
      </div>
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          <span className="sell-price">{product.sellPrice}</span>
          <span className="mrp-price">{product.mrpPrice}</span>
          <span className="off-percentage">{product.offPercent}</span>
        </div>
        {product.freeDelivery && <p className="free-delivery">Free Delivery</p>}
        <div className="ratings-row">
          <div className="rating-section">
            <div className="rating-chip">
              <span className="rating-num">{product.rating}</span>
              <span className="rating-star">★</span>
            </div>
            <span className="review-count">({product.reviewCount})</span>
          </div>
        </div>
        <button
          className="add-to-cart-btn"
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart(product);
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function PromoSection() {
  const [timer, setTimer] = useState('00h : 00m : 00s');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimer(`${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="home-promo">
      <img src="https://cdn.shopify.com/s/files/1/0981/2262/9416/files/2f53o_1.gif?v=1773923883" alt="Biggest Brand Bash" className="full-width-img" />
      <img src="https://cdn.shopify.com/s/files/1/0786/1610/1096/files/1.webp?v=1774803568" alt="Maha Sale" className="full-width-img" />
      <div style={{ background: 'linear-gradient(90deg,#e53935,#b71c1c)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>⏰</span>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.3px', textAlign: 'center' }}>
          Offer Valid for Only 24 Hours — Hurry, Limited Stock!
        </span>
        <span style={{ fontSize: '18px' }}>🔥</span>
      </div>
      <img src="https://cdn.shopify.com/s/files/1/0981/2262/9416/files/xwgyl_800_1.webp?v=1773923882" alt="Benefits" className="full-width-img" />
      <div className="deals-section">
        <div className="deals-container">
          <p className="deals-label">
            Meesho Daily Deals
            <span style={{ color: '#e42526', fontSize: '1.2rem', transform: 'translateY(-1px)' }}>⚡</span>
          </p>
          <div className="timer-box">
            <span style={{ fontSize: '1rem' }}>💣</span>
            <span className="timer-text">{timer}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductList({ products, onAddToCart }) {
  return (
    <main>
      <PromoSection />
      <section className="products-section">
        <h4 className="section-title">Products For You</h4>
        <div className="product-list">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onView={() => {
                navigate(`/product/${product.id}`);
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="mf-wrap">
      <div className="mf-brand">
        <Logo />
        <p className="mf-tagline">India's #1 Social Commerce Platform</p>
        <p className="mf-tagline-sub">Har Ghar Meesho</p>
      </div>
      <div className="mf-app">
        <p className="mf-section-label">Download the App</p>
        <div className="mf-app-badges">
          <a href="https://play.google.com/store/apps/details?id=com.meesho.supply" target="_blank" rel="noreferrer" className="mf-badge-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l15 8.5-15 8.5c-.5.33-1.5.33-1.5-.5z" />
            </svg>
            Google Play
          </a>
          <a href="https://apps.apple.com/in/app/meesho-online-shopping-app/id1457958492" target="_blank" rel="noreferrer" className="mf-badge-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            App Store
          </a>
        </div>
      </div>
      <div className="mf-divider" />
      <div className="mf-links-grid">
        <div className="mf-col">
          <p className="mf-col-title">Company</p>
          <a href="#" className="mf-link">About Us</a>
          <a href="#" className="mf-link">Careers</a>
          <a href="#" className="mf-link">Press</a>
          <a href="#" className="mf-link">Meesho Tech Blog</a>
          <a href="#" className="mf-link">Become a Supplier</a>
        </div>
        <div className="mf-col">
          <p className="mf-col-title">Help</p>
          <a href="#" className="mf-link">Help Center</a>
          <a href="#" className="mf-link">How Meesho Works</a>
          <a href="#" className="mf-link">Contact Us</a>
          <a href="#" className="mf-link">Track Your Order</a>
          <a href="#" className="mf-link">Report Infringement</a>
        </div>
      </div>
      <div className="mf-divider" />
      <div className="mf-policies">
        <p className="mf-col-title" style={{ marginBottom: '10px' }}>Policies</p>
        <div className="mf-policy-row">
          <a href="#" className="mf-link">Privacy Policy</a>
          <a href="#" className="mf-link">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

function ToastList({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.msg}
        </div>
      ))}
    </div>
  );
}

function HomePage({ products, onAddToCart, cartCount, onCartOpen, cartOpen, onCloseCart, cartItems, onUpdateQty, toasts }) {
  return (
    <>
      <Header cartCount={cartCount} onCartOpen={onCartOpen} />
      <CartDrawer isOpen={cartOpen} onClose={onCloseCart} items={cartItems} onUpdateQty={onUpdateQty} />
      <ProductList products={products} onAddToCart={onAddToCart} />
      <Footer />
      <ToastList toasts={toasts} />
    </>
  );
}

function ProductPage({ products, onAddToCart, cartItems, onCartOpen }) {
  const navigate = useNavigate();
  const params = useParams();
  const product = products.find((item) => item.id === Number(params.id));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [params.id]);

  if (!product) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Product not found.</p>
        <button className="add-to-cart-btn" onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  const quantity = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const description = PRODUCT_DESCRIPTIONS[product.id] || PRODUCT_DESCRIPTIONS.default;

  return (
    <>
      <header className="product-header">
        <div className="product-header-inner">
          <div className="ph-left">
            <button className="ph-back-btn" onClick={() => navigate('/')} aria-label="Back">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M13.746 2.314C13.569 2.113 13.328 2 13.077 2c-.252 0-.492.113-.67.314L6.278 9.243a1.076 1.076 0 0 0 0 1.514l6.13 6.929c.37.419.969.419 1.339 0 .37-.419.304-1.17 0-1.514L8.292 10l5.454-6.172c.223-.25.362-1.105 0-1.514Z" fill="#666" />
              </svg>
            </button>
            <Link to="/" className="brand-logo">
              <Logo />
            </Link>
          </div>

          <div className="ph-right">
            <a href="#" className="header-icon" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="#ED3843" d="M22 9.174c0 3.724-1.87 7.227-9.67 12.38a.58.58 0 0 1-.66 0C3.87 16.401 2 12.898 2 9.174S4.59 3.67 7.26 3.66c3.22-.081 4.61 3.573 4.74 3.774.13-.201 1.52-3.855 4.74-3.774C19.41 3.669 22 5.45 22 9.174Z" />
              </svg>
            </a>
            <button className="header-icon cart-wrapper" onClick={onCartOpen} aria-label="Cart">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="#9F2089" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              {quantity > 0 && <span className="badge">{quantity}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="product-page-main">
        <div className="product-gallery">
          <div className="main-image-container">
            <img id="mainImage" src={product.imgUrl} alt={product.name} />
            <div className="image-indicator">
              <span className="dot active" />
            </div>
          </div>
          <div className="similar-products-section">
            <p className="section-title-sm">1 Similar Products</p>
            <div className="thumbnail-list">
              <div className="thumb-item active">
                <img src={product.imgUrl} alt={product.name} />
              </div>
            </div>
          </div>
        </div>

        <div className="product-info-card">
          <h1 className="product-title">{product.name}</h1>
          <div className="pricing-row">
            <span className="current-price">{product.sellPrice}</span>
            <span className="mrp-price-pd">{product.mrpPrice}</span>
            <span className="discount-pill">{product.offPercent}</span>
          </div>
          {product.freeDelivery && <div className="free-delivery-tag">Free Delivery</div>}
          <p style={{ marginTop: '1rem', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{description}</p>
          <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>Add to Cart</button>
        </div>
      </div>
    </>
  );
}

function CartPage({ cartItems, onUpdateQty }) {
  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.sellPrice.replace(/[₹,]/g, '')) || 0) * item.qty, 0);
  const shipping = 0;
  const orderTotal = total + shipping;

  return (
    <>
      <header className="product-header">
        <div className="product-header-inner">
          <div className="ph-left">
            <button className="ph-back-btn" onClick={() => navigate(-1)} aria-label="Back">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M13.746 2.314C13.569 2.113 13.328 2 13.077 2c-.252 0-.492.113-.67.314L6.278 9.243a1.076 1.076 0 0 0 0 1.514l6.13 6.929c.37.419.969.419 1.339 0 .37-.419.304-1.17 0-1.514L8.292 10l5.454-6.172c.223-.25.362-1.105 0-1.514Z" fill="#666" />
              </svg>
            </button>
            <Logo size="sm" />
          </div>
          <div className="ph-right">
            <a href="#" className="header-icon" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="#ED3843" d="M22 9.174c0 3.724-1.87 7.227-9.67 12.38a.58.58 0 0 1-.66 0C3.87 16.401 2 12.898 2 9.174S4.59 3.67 7.26 3.66c3.22-.081 4.61 3.573 4.74 3.774.13-.201 1.52-3.855 4.74-3.774C19.41 3.669 22 5.45 22 9.174Z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="cart-page-main">
        <div className="step-bar">
          {['Cart', 'Address', 'Payment', 'Summary'].map((label, index) => (
            <div key={label} className={`step ${index === 0 ? 'active' : ''}`}>
              <div className="step-dot">{index + 1}</div>
              <span className="step-lbl">{label}</span>
            </div>
          ))}
        </div>

        <div className="cp-section-card">
          <div className="cp-cart-title">Cart</div>
          {cartItems.length === 0 ? (
            <div className="empty-wrap">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <h2>Your cart is empty!</h2>
              <p>Add some products to continue.</p>
              <button className="empty-shop-btn" onClick={() => navigate('/')}>Start Shopping</button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={item.id} className="cp-item-row-wrap" style={{ borderBottom: idx < cartItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="cp-item-row">
                  <img className="cp-item-img" src={item.imgUrl} alt={item.name} />
                  <div className="cp-item-details">
                    <div className="cp-item-top">
                      <div className="cp-item-name">{item.name}</div>
                      <button className="cp-delete-btn" onClick={() => onUpdateQty(item.id, 0)} title="Remove">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                    <div className="cp-price-row">
                      <span className="cp-price-now">{item.sellPrice}</span>
                    </div>
                    <div className="cp-qty-row">
                      <button className="cp-qty-btn" onClick={() => onUpdateQty(item.id, item.qty - 1)}>-</button>
                      <span className="cp-qty-val">{item.qty}</span>
                      <button className="cp-qty-btn" onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="cp-section-card">
              <div className={`cp-delivery-option selected`}>
                <div className="cp-radio-circle"><div className="cp-radio-dot" /></div>
                <div className="cp-delivery-info">
                  <div className="cp-delivery-name">Standard Delivery</div>
                  <div className="cp-delivery-sub">Delivery in 4 to 5 days</div>
                </div>
                <div className="cp-delivery-price cp-free-val">FREE</div>
              </div>
              <div className="cp-delivery-option">
                <div className="cp-radio-circle" />
                <div className="cp-delivery-info">
                  <div className="cp-delivery-name">Next Day Delivery</div>
                  <div className="cp-delivery-sub">Fast delivery by tomorrow</div>
                </div>
                <div className="cp-delivery-price">₹49</div>
              </div>
            </div>
            <div className="cp-section-card">
              <div className="cp-summary-row">
                <span className="cp-sum-label">Total Product Price:</span>
                <span className="cp-sum-val">{formatCurrency(total)}</span>
              </div>
              <div className="cp-summary-divider" />
              <div className="cp-summary-row">
                <span className="cp-sum-label">Shipping:</span>
                <span className="cp-free-val cp-sum-val">FREE</span>
              </div>
              <div className="cp-summary-divider" />
              <div className="cp-summary-row cp-summary-total">
                <span className="cp-sum-label">Order Total :</span>
                <span className="cp-sum-val">{formatCurrency(orderTotal)}</span>
              </div>
            </div>
            <div className="cp-safety-card">
              <img className="cp-safety-img" src="https://cdn.shopify.com/s/files/1/0987/4102/7106/files/WhatsApp_Image_2026-02-13_at_1.19.12_PM.jpg?v=1770980679" alt="Safety Priority" />
            </div>
          </>
        )}
        {cartItems.length > 0 && <div style={{ height: '80px' }} />}
      </main>

      {cartItems.length > 0 && (
        <div className="cp-sticky-footer">
          <div className="cp-footer-price">{formatCurrency(orderTotal)}</div>
          <button className="cp-continue-btn" onClick={() => navigate('/checkout')}>Continue</button>
        </div>
      )}
    </>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    name: '',
    mobile: '',
    pincode: '',
    city: '',
    state: '',
    house: '',
    area: '',
  });
  const [errors, setErrors] = useState({});

  const updateField = (field) => (event) => {
    setAddress((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!address.name.trim()) next.name = 'Required';
    if (!/^[0-9]{10}$/.test(address.mobile.trim())) next.mobile = 'Enter valid 10-digit mobile';
    if (!/^[0-9]{6}$/.test(address.pincode.trim())) next.pincode = 'Enter valid 6-digit pincode';
    if (!address.city.trim()) next.city = 'Required';
    if (!address.state.trim()) next.state = 'Required';
    if (!address.house.trim()) next.house = 'Required';
    if (!address.area.trim()) next.area = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    sessionStorage.setItem('address', JSON.stringify(address));
    navigate('/payment');
  };

  return (
    <>
      <header className="product-header">
        <div className="product-header-inner">
          <div className="ph-left">
            <button className="ph-back-btn" onClick={() => navigate('/cart')} aria-label="Back">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M13.746 2.314C13.569 2.113 13.328 2 13.077 2c-.252 0-.492.113-.67.314L6.278 9.243a1.076 1.076 0 0 0 0 1.514l6.13 6.929c.37.419.969.419 1.339 0 .37-.419.304-1.17 0-1.514L8.292 10l5.454-6.172c.223-.25.362-1.105 0-1.514Z" fill="#666" />
              </svg>
            </button>
            <Logo />
          </div>
          <div className="ph-right">
            <a href="#" className="header-icon" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="#ED3843" d="M22 9.174c0 3.724-1.87 7.227-9.67 12.38a.58.58 0 0 1-.66 0C3.87 16.401 2 12.898 2 9.174S4.59 3.67 7.26 3.66c3.22-.081 4.61 3.573 4.74 3.774.13-.201 1.52-3.855 4.74-3.774C19.41 3.669 22 5.45 22 9.174Z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="co-main">
        <div className="step-bar">
          {[{ label: 'Cart', state: 'done' }, { label: 'Address', state: 'active' }, { label: 'Payment', state: '' }, { label: 'Summary', state: '' }].map((step) => (
            <div key={step.label} className={`step ${step.state}`}>
              <div className="step-dot">{step.state === 'done' ? '✓' : ''}</div>
              <span className="step-lbl">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="co-page-heading">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#e91e8c" />
            <circle cx="12" cy="9" r="2.5" fill="#fff" />
          </svg>
          Address
        </div>

        <div className="co-form-card">
          <form id="addressForm" onSubmit={handleSubmit} noValidate>
            <Field label="Full Name" error={errors.name}>
              <input type="text" value={address.name} onChange={updateField('name')} autoComplete="name" />
            </Field>
            <Field label="Mobile number" error={errors.mobile}>
              <input type="tel" value={address.mobile} onChange={updateField('mobile')} autoComplete="tel" maxLength={10} inputMode="numeric" />
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              <input type="text" value={address.pincode} onChange={updateField('pincode')} maxLength={6} inputMode="numeric" />
            </Field>
            <div className="co-row-2">
              <Field label="City" error={errors.city} noMargin>
                <input type="text" value={address.city} onChange={updateField('city')} autoComplete="address-level2" />
              </Field>
              <Field label="State" error={errors.state} noMargin>
                <input type="text" value={address.state} onChange={updateField('state')} autoComplete="address-level1" />
              </Field>
            </div>
            <div style={{ marginBottom: '18px' }} />
            <Field label="House No., Building Name" error={errors.house}>
              <input type="text" value={address.house} onChange={updateField('house')} autoComplete="address-line1" />
            </Field>
            <Field label="Road name, Area, Colony" error={errors.area} noMargin>
              <input type="text" value={address.area} onChange={updateField('area')} autoComplete="address-line2" />
            </Field>
          </form>
        </div>

        <div className="co-trust-banner">
          <img src="https://cdn.shopify.com/s/files/1/0987/4102/7106/files/WhatsApp_Image_2026-02-13_at_1.19.11_PM.jpg?v=1770981110" alt="Secure Payments" />
        </div>
        <div style={{ height: '90px' }} />
      </main>

      <div className="co-sticky-cta">
        <button onClick={handleSubmit}>Save Address and Continue</button>
      </div>
    </>
  );
}

function Field({ label, error, children, noMargin }) {
  return (
    <div className={`co-field-wrap${error ? ' co-field-error' : ''}${noMargin ? ' co-no-margin' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="co-error-msg">{error}</span>}
    </div>
  );
}

function PaymentPage({ cartItems }) {
  const navigate = useNavigate();
  const [method, setMethod] = useState('gpay');
  const [showQr, setShowQr] = useState(false);
  const [upiId, setUpiId] = useState(() => localStorage.getItem('nexshop_upi') || DEFAULT_UPI);

  useEffect(() => {
    const stored = localStorage.getItem('nexshop_upi');
    if (stored) setUpiId(stored);
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.sellPrice.replace(/[₹,]/g, '')) || 0) * item.qty, 0);
  const totalString = total.toFixed(2);

  const options = [
    { id: 'gpay', label: 'G Pay', img: 'https://cdn.shopify.com/s/files/1/0987/4102/7106/files/Untitled_design_7.png?v=1770983193' },
    { id: 'phonepe', label: 'PhonePe', img: 'https://cdn.shopify.com/s/files/1/0988/1590/1975/files/Untitled_design_10.png?v=1771233121' },
    { id: 'paytm', label: 'Paytm', img: 'https://cdn.shopify.com/s/files/1/0988/1590/1975/files/Untitled_design_8.png?v=1771233121' },
    { id: 'bhim', label: 'BHIM UPI', img: 'https://cdn.shopify.com/s/files/1/0987/4102/7106/files/Untitled_design_6.png?v=1770983191' },
    { id: 'whatsapp', label: 'WhatsApp Pay', img: 'https://cdn.shopify.com/s/files/1/0988/1590/1975/files/Untitled_design_9.png?v=1771233121' },
  ];

  const handlePay = () => {
    const href = buildUpiHref(method, upiId, totalString);
    window.location.href = href;
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: "'Outfit',Arial,sans-serif", paddingBottom: '90px' }}>
      <header style={{ background: '#9f2089', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', height: '54px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/checkout')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', marginTop: '2px' }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M13.746 2.314a1.576 1.576 0 0 0-2.34 0L5.278 9.243a1.576 1.576 0 0 0 0 2.514l6.129 6.929c.37.419.969.419 1.339 0 .37-.42.304-1.17 0-1.514L7.29 10l5.456-6.182c.222-.25.36-1.105 0-1.504Z" fill="#fff" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 156 36" fill="none" xmlns="http://www.w3.org/2000/svg" height="22" width="80">
              <rect width="156" height="36" fill="#9f2089" />
              <text x="8" y="27" fill="#fff" fontSize="22" fontWeight="900" fontFamily="Outfit,Arial,sans-serif" letterSpacing="-0.5">meesho</text>
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
            <path d="M22 9.174c0 3.724-1.87 7.227-9.67 12.38a.58.58 0 0 1-.66 0C3.87 16.401 2 12.898 2 9.174S4.59 3.67 7.26 3.66c3.22-.081 4.61 3.573 4.74 3.774.13-.201 1.52-3.855 4.74-3.774C19.41 3.669 22 5.45 22 9.174Z" />
          </svg>
          <div style={{ position: 'relative' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path fill="#fff" d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 0M1 2v2h2l3.6 7.59-1.35 2.45A2 2 0 0 0 7 17h12v-2H7.42a.25.25 0 0 1-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.44 4H5.21L4.27 2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span style={{ position: 'absolute', top: '-5px', right: '-6px', background: '#fff', color: '#9f2089', borderRadius: '50%', fontSize: '9px', fontWeight: 800, width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cartItems.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          </div>
        </div>
      </header>

      <div style={{ background: '#fff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 24px 10px', position: 'relative', borderBottom: '1px solid #eee' }}>
        <div style={{ position: 'absolute', top: '28px', left: '12%', width: '76%', height: '1.5px', background: '#e0e0e0', zIndex: 0 }} />
        {['Cart', 'Address', 'Payment', 'Summary'].map((step, index) => (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#fff', border: `${step === 'Payment' ? '2.5' : '2'}px solid ${step ? '#9f2089' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: step ? '#9f2089' : '#bbb' }}>
              {step === 'Cart' ? '1' : step === 'Address' ? '2' : step === 'Payment' ? '3' : '4'}
            </div>
            <span style={{ fontSize: '11px', fontWeight: step === 'Payment' ? 700 : 600, color: step === 'Payment' ? '#9f2089' : '#aaa' }}>{step}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', marginTop: '6px', padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#111' }}>Select Payment Method</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#555', fontWeight: 700, textAlign: 'right', lineHeight: '1.3' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1d4ed8" style={{ flexShrink: 0 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          100% SAFE<br />PAYMENTS
        </div>
      </div>

      <div style={{ background: '#fff', marginTop: '8px' }}>
        <div style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 800, color: '#222', letterSpacing: '.5px', borderBottom: '1px solid #f0f0f0' }}>PAY ONLINE</div>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ background: '#16a34a', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>UPI</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#222' }}>UPI (GPay/PhonePe/Paytm)</span>
        </div>
        {options.map((option) => (
          <div key={option.id} onClick={() => setMethod(option.id)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: method === option.id ? '#fdf7ff' : '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${method === option.id ? '#9f2089' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {method === option.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#9f2089' }} />}
              </div>
              <span style={{ fontSize: '0.9rem', color: '#333' }}>{option.label}</span>
            </div>
            <img src={option.img} alt={option.label} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
        ))}
        <div onClick={() => setShowQr(true)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9f2089" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="14" width="3" height="3" />
            <rect x="14" y="18" width="7" height="3" />
          </svg>
          <span style={{ fontSize: '13px', color: '#9f2089', fontWeight: 600 }}>Scan QR Code to Pay</span>
        </div>
      </div>

      <div style={{ background: '#fff', marginTop: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', fontSize: '0.88rem' }}>
          <span style={{ fontWeight: 600, color: '#555' }}>Total Product Price:</span>
          <span style={{ color: '#111' }}>{formatCurrency(total)}</span>
        </div>
        <div style={{ height: '1px', background: '#efefef' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', fontSize: '0.88rem' }}>
          <span style={{ fontWeight: 600, color: '#555' }}>Shipping:</span>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
        </div>
        <div style={{ height: '1px', background: '#efefef' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', fontSize: '0.92rem' }}>
          <span style={{ fontWeight: 800, color: '#111' }}>Order Total:</span>
          <span style={{ fontWeight: 800, color: '#111' }}>{formatCurrency(total)}</span>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999, background: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', lineHeight: '1.2' }}>{formatCurrency(total)}</div>
          <div style={{ fontSize: '10px', color: '#9f2089', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px', cursor: 'pointer' }}>VIEW PRICE DETAILS</div>
        </div>
        <button onClick={handlePay} style={{ background: '#9f2089', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px 28px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}>PayNow</button>
      </div>

      {showQr && (
        <div onClick={() => setShowQr(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(event) => event.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '24px 20px', width: '85%', maxWidth: '340px', textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#111', marginBottom: '4px' }}>Scan & Pay</div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Open any UPI app and scan to pay <strong>{formatCurrency(total)}</strong></div>
            <img src={buildQrCodeUrl(upiId, totalString)} alt="UPI QR" style={{ width: '200px', height: '200px', borderRadius: '8px', border: '1px solid #eee' }} />
            <div style={{ margin: '10px 0 4px', fontSize: '12px', color: '#888' }}>UPI ID</div>
            <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontWeight: 700, color: '#111', wordBreak: 'break-all', marginBottom: '16px' }}>{upiId}</div>
            <button onClick={() => setShowQr(false)} style={{ width: '100%', background: '#9f2089', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPage({ products, onProductsChange, showToast }) {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('adm_auth') === '1');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [upiId, setUpiId] = useState(() => localStorage.getItem('nexshop_upi') || DEFAULT_UPI);
  const [pixelIds, setPixelIds] = useState(() => localStorage.getItem('nexshop_pixel') || '');
  const [gaId, setGaId] = useState(() => localStorage.getItem('nexshop_ga') || '');
  const [savedMessage, setSavedMessage] = useState('');
  const [formProduct, setFormProduct] = useState({ name: '', sellPrice: '', mrpPrice: '', offPercent: '', imgUrl: '', rating: '4.2', reviewCount: '500', freeDelivery: true });
  const [csvError, setCsvError] = useState('');
  const [importPreview, setImportPreview] = useState([]);
  const [dropHover, setDropHover] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogin = (event) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adm_auth', '1');
      setIsAuthed(true);
      setLoginError('');
      setPassword('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const saveUpi = () => {
    localStorage.setItem('nexshop_upi', upiId.trim() || DEFAULT_UPI);
    setUpiId(upiId.trim() || DEFAULT_UPI);
    setSavedMessage(`✓ UPI Saved: ${upiId.trim() || DEFAULT_UPI}`);
    showToast(`✓ UPI Saved: ${upiId.trim() || DEFAULT_UPI}`);
    setTimeout(() => setSavedMessage(''), 2400);
  };

  const savePixel = () => {
    localStorage.setItem('nexshop_pixel', pixelIds.trim());
    setSavedMessage('Facebook Pixel saved — reload store to activate');
    showToast('Facebook Pixel saved — reload store to activate');
    setTimeout(() => setSavedMessage(''), 2400);
  };

  const saveGaId = () => {
    localStorage.setItem('nexshop_ga', gaId.trim());
    setSavedMessage(gaId.trim() ? 'Google Analytics saved — reload store to activate' : 'Google Analytics cleared');
    showToast(gaId.trim() ? 'Google Analytics saved — reload store to activate' : 'Google Analytics cleared');
    setTimeout(() => setSavedMessage(''), 2400);
  };

  const addProduct = () => {
    if (!formProduct.name.trim()) {
      setSavedMessage('Product name is required.');
      setTimeout(() => setSavedMessage(''), 2400);
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: formProduct.name.trim(),
      sellPrice: formatCurrency(formProduct.sellPrice || '199'),
      mrpPrice: formatCurrency(formProduct.mrpPrice || '999'),
      offPercent: formProduct.offPercent || '97% off',
      imgUrl: formProduct.imgUrl.trim(),
      rating: formProduct.rating || '4.2',
      reviewCount: formProduct.reviewCount || '500',
      freeDelivery: parseBoolean(formProduct.freeDelivery),
    };
    const nextProducts = [newProduct, ...products];
    localStorage.setItem('nexshop_products', JSON.stringify(nextProducts));
    onProductsChange(nextProducts);
    setFormProduct({ name: '', sellPrice: '', mrpPrice: '', offPercent: '', imgUrl: '', rating: '4.2', reviewCount: '500', freeDelivery: true });
    showToast(`✓ "${newProduct.name}" added!`);
  };

  const deleteProduct = (id) => {
    const nextProducts = products.filter((item) => item.id !== id);
    localStorage.setItem('nexshop_products', JSON.stringify(nextProducts));
    onProductsChange(nextProducts);
    showToast('Product deleted.');
  };

  const resetProducts = () => {
    localStorage.removeItem('nexshop_products');
    onProductsChange(DEFAULT_PRODUCTS);
    showToast('Products reset to defaults.');
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseProductRows(text);
      if (!parsed.length) {
        setCsvError('No valid products found. Ensure your file contains a name field.');
        return;
      }
      setImportPreview(parsed);
      setCsvError('');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const importProducts = () => {
    const nextProducts = [...products.filter((item) => !importPreview.some((preview) => preview.id === item.id)), ...importPreview];
    localStorage.setItem('nexshop_products', JSON.stringify(nextProducts));
    onProductsChange(nextProducts);
    setImportPreview([]);
    showToast(`${importPreview.length} product(s) imported!`);
  };

  if (!isAuthed) {
    return (
      <div className="adm-login-wrap">
        <div className="adm-login-card">
          <div className="adm-login-logo">
            <Logo />
          </div>
          <p className="adm-login-sub">Admin Panel</p>
          <form onSubmit={handleLogin}>
            <input
              className={`adm-pass-input ${loginError ? 'adm-pass-err' : ''}`}
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
            {loginError && <p className="adm-err-msg">{loginError}</p>}
            <button type="submit" className="adm-login-btn">Login</button>
          </form>
          <button className="adm-back-link" onClick={() => navigate('/')}>← Back to store</button>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-wrap">
      <div className="adm-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Logo />
          <span className="adm-header-label">Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="adm-store-btn" onClick={() => navigate('/')}>← Store</button>
          <button className="adm-logout-btn" onClick={() => { sessionStorage.removeItem('adm_auth'); setIsAuthed(false); }}>Logout</button>
        </div>
      </div>
      <div className="adm-content">
        <Section title="💳 Merchant UPI ID">
          <p className="adm-hint">Customer payments go to this UPI ID. Type the new ID below and press <strong>Save UPI</strong>.</p>
          <div className="adm-input-row">
            <input
              className="adm-input"
              type="text"
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && saveUpi()}
              placeholder="yourname@upi"
            />
            <button className={`adm-save-btn ${savedMessage ? 'adm-saved' : ''}`} onClick={saveUpi}>{savedMessage ? '✓ Saved!' : 'Save UPI'}</button>
          </div>
          <div style={{ marginTop: '10px', background: savedMessage ? '#f0faf0' : '#fdf7ff', border: `1.5px solid ${savedMessage ? '#86efac' : '#d8b4fe'}`, borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={savedMessage ? '#16a34a' : '#9f2089'}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.4px' }}>{savedMessage ? '✓ Active in store' : 'Currently active in store'}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c', wordBreak: 'break-all' }}>{upiId}</div>
            </div>
          </div>
        </Section>

        <Section title="📘 Facebook Pixel IDs">
          <p className="adm-hint">Enter one or more Meta Pixel IDs (comma-separated). Events: <strong>PageView, AddToCart, InitiateCheckout, Purchase</strong>.</p>
          <div className="adm-input-row">
            <input className="adm-input" type="text" value={pixelIds} onChange={(event) => setPixelIds(event.target.value)} placeholder="e.g. 982539807479128, 112233445566778" />
            <button className={`adm-save-btn ${savedMessage ? 'adm-saved' : ''}`} onClick={savePixel}>{savedMessage ? '✓ Saved' : 'Save'}</button>
          </div>
          {pixelIds.trim() && (
            <div className="adm-pixel-tags">
              {pixelIds.split(',').map((id, index) => (
                <span key={index} className="adm-pixel-tag">
                  <span className="adm-pixel-dot" />
                  {id.trim()}
                  <button className="adm-pixel-remove" onClick={() => {
                    const next = pixelIds.split(',').filter((_, idx) => idx !== index).join(', ');
                    setPixelIds(next);
                    localStorage.setItem('nexshop_pixel', next);
                    showToast('Pixel removed.');
                  }}>×</button>
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="📊 Google Analytics (GA4)">
          <p className="adm-hint">Enter your GA4 Measurement ID (e.g. <code className="adm-code">G-XXXXXXXXXX</code>). Reload the store after saving to activate.</p>
          <div className="adm-input-row">
            <input className="adm-input" type="text" value={gaId} onChange={(event) => setGaId(event.target.value)} placeholder="G-XXXXXXXXXX" />
            <button className={`adm-save-btn ${savedMessage ? 'adm-saved' : ''}`} onClick={saveGaId}>{savedMessage ? '✓ Saved' : 'Save'}</button>
          </div>
          {gaId.trim() && (
            <p className="adm-hint" style={{ marginTop: '6px' }}>
              Active ID: <code className="adm-code">{gaId.trim()}</code>
              <button onClick={() => { setGaId(''); localStorage.removeItem('nexshop_ga'); showToast('GA removed.'); }} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
            </p>
          )}
        </Section>

        <Section title="➕ Add Single Product">
          <p className="adm-hint">Fill in details to add one product manually to your store.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label className="adm-form-label">Product Name *</label>
            <input className="adm-input" type="text" placeholder="e.g. Organic Honey 1KG" value={formProduct.name} onChange={(event) => setFormProduct((current) => ({ ...current, name: event.target.value }))} />
            <div className="adm-form-2col">
              <div>
                <label className="adm-form-label">Sell Price (₹)</label>
                <input className="adm-input" type="text" placeholder="199" value={formProduct.sellPrice} onChange={(event) => setFormProduct((current) => ({ ...current, sellPrice: event.target.value }))} />
              </div>
              <div>
                <label className="adm-form-label">MRP Price (₹)</label>
                <input className="adm-input" type="text" placeholder="1999" value={formProduct.mrpPrice} onChange={(event) => setFormProduct((current) => ({ ...current, mrpPrice: event.target.value }))} />
              </div>
            </div>
            <div className="adm-form-2col">
              <div>
                <label className="adm-form-label">Discount %</label>
                <input className="adm-input" type="text" placeholder="90% off" value={formProduct.offPercent} onChange={(event) => setFormProduct((current) => ({ ...current, offPercent: event.target.value }))} />
              </div>
              <div>
                <label className="adm-form-label">Rating</label>
                <input className="adm-input" type="text" placeholder="4.2" value={formProduct.rating} onChange={(event) => setFormProduct((current) => ({ ...current, rating: event.target.value }))} />
              </div>
            </div>
            <div>
              <label className="adm-form-label">Image URL</label>
              <input className="adm-input" type="text" placeholder="https://example.com/image.jpg" value={formProduct.imgUrl} onChange={(event) => setFormProduct((current) => ({ ...current, imgUrl: event.target.value }))} />
            </div>
            <div className="adm-form-2col">
              <div>
                <label className="adm-form-label">Review Count</label>
                <input className="adm-input" type="text" placeholder="500" value={formProduct.reviewCount} onChange={(event) => setFormProduct((current) => ({ ...current, reviewCount: event.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '22px' }}>
                <input id="freeDelivery" type="checkbox" checked={formProduct.freeDelivery} onChange={(event) => setFormProduct((current) => ({ ...current, freeDelivery: event.target.checked }))} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#9f2089' }} />
                <label htmlFor="freeDelivery" className="adm-form-label" style={{ margin: 0, cursor: 'pointer' }}>Free Delivery</label>
              </div>
            </div>
            <button onClick={addProduct} style={{ background: '#9f2089', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 0', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}>+ Add Product to Store</button>
          </div>
          {savedMessage && <p style={{ color: '#059669', marginTop: '10px' }}>{savedMessage}</p>}
        </Section>

        <Section title="📤 Bulk Upload via CSV">
          <p className="adm-hint">Required column: <code className="adm-code">name</code>. Optional: <code className="adm-code">id, sellPrice, mrpPrice, offPercent, imgUrl, rating, reviewCount, freeDelivery</code>.</p>
          <div
            className={`adm-dropzone ${dropHover ? 'adm-dropzone-hover' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDropHover(true); }}
            onDragLeave={() => setDropHover(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDropHover(false);
              const file = event.dataTransfer.files[0];
              file && parseFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ margin: '8px 0 2px', color: '#555', fontWeight: 600 }}>Drop CSV here or <span className="adm-link">click to browse</span></p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#aaa' }}>Supports .csv · .tsv · .txt</p>
            <input ref={fileInputRef} type="file" accept=".csv,.tsv,.txt" style={{ display: 'none' }} onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) parseFile(file);
              event.target.value = '';
            }} />
          </div>
          {csvError && <p className="adm-csv-error">{csvError}</p>}
          {importPreview.length > 0 && (
            <div className="adm-preview-box">
              <div className="adm-preview-header">
                <span>{importPreview.length} product(s) ready</span>
                <button className="adm-import-btn" onClick={importProducts}>Import All</button>
              </div>
              {importPreview.map((item) => (
                <div key={item.id} className="adm-product-row">
                  <img src={item.imgUrl || 'https://placehold.co/48x48/f5f5f5/999?text=?'} alt="preview" className="adm-thumb" onError={(event) => { event.target.src = 'https://placehold.co/48x48/f5f5f5/999?text=?'; }} />
                  <div className="adm-product-info">
                    <div className="adm-product-name">{item.name}</div>
                    <div className="adm-product-meta">{item.sellPrice} · {item.mrpPrice} · {item.offPercent}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="adm-csv-example-wrap">
            <p className="adm-hint" style={{ marginBottom: '6px' }}>CSV format example:</p>
            <pre className="adm-csv-example">
name,sellPrice,mrpPrice,offPercent,imgUrl,rating,reviewCount,freeDelivery
Organic Honey 1KG,199,1999,90% off,https://example.com/honey.jpg,4.5,320,true
Basmati Rice 5KG,299,2499,88% off,https://example.com/rice.jpg,4.3,150,true
            </pre>
          </div>
        </Section>

        <Section title={`🛒 Current Products (${products.length})`}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button className="adm-reset-btn" onClick={resetProducts}>↺ Reset to Defaults</button>
          </div>
          <div className="adm-product-list">
            {products.map((item) => (
              <div key={item.id} className="adm-product-row">
                <img src={item.imgUrl || 'https://placehold.co/48x48/f5f5f5/999?text=?'} alt={item.name} className="adm-thumb" onError={(event) => { event.target.src = 'https://placehold.co/48x48/f5f5f5/999?text=?'; }} />
                <div className="adm-product-info">
                  <div className="adm-product-name">{item.name}</div>
                  <div className="adm-product-meta">{item.sellPrice} · {item.offPercent} · ID #{item.id}</div>
                </div>
                <button className="adm-del-btn" onClick={() => deleteProduct(item.id)} title="Delete">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="adm-section">
      <div className="adm-section-title">{title}</div>
      <div className="adm-section-body">{children}</div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('nexshop_products');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_PRODUCTS;
  });
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('nexshop_cart');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('nexshop_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('nexshop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [cartOpen]);

  useEffect(() => {
    const pixelIds = (localStorage.getItem('nexshop_pixel') || '').split(',').map((id) => id.trim()).filter(Boolean);
    if (pixelIds.length && !document.getElementById('fb-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'fb-pixel-script';
      script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');${pixelIds.map((id) => `fbq('init','${id}');`).join('')}fbq('track','PageView');window.__fbqReady=true;`;
      document.head.appendChild(script);
    }
    const gaId = (localStorage.getItem('nexshop_ga') || '').trim();
    if (gaId && !document.getElementById('ga-script')) {
      const gaScript = document.createElement('script');
      gaScript.id = 'ga-script';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(gaScript);
      const gaInline = document.createElement('script');
      gaInline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');window.__gtagReady=true;`;
      document.head.appendChild(gaInline);
    }
  }, []);

  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, msg: message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2400);
  }, []);

  const addToCart = useCallback((product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...current, { ...product, qty: 1 }];
    });
    showToast('Added to cart!');
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        value: parseFloat(product.sellPrice.replace(/[₹,]/g, '')) || 0,
        currency: 'INR',
      });
    }
  }, [showToast]);

  const updateQty = useCallback((id, qty) => {
    setCartItems((current) => current.filter((item) => {
      if (item.id !== id) return true;
      if (qty <= 0) return false;
      return true;
    }).map((item) => (item.id === id ? { ...item, qty } : item)));
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const homeItems = useMemo(() => products, [products]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={homeItems}
              onAddToCart={addToCart}
              cartCount={cartCount}
              onCartOpen={() => setCartOpen(true)}
              cartOpen={cartOpen}
              onCloseCart={() => setCartOpen(false)}
              cartItems={cartItems}
              onUpdateQty={updateQty}
              toasts={toasts}
            />
          }
        />
        <Route path="/product/:id" element={<ProductPage products={products} onAddToCart={addToCart} cartItems={cartItems} onCartOpen={() => setCartOpen(true)} />} />
        <Route path="/cart" element={<CartPage cartItems={cartItems} onUpdateQty={updateQty} />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage cartItems={cartItems} />} />
        <Route path="/admin" element={<AdminPage products={products} onProductsChange={setProducts} showToast={showToast} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
