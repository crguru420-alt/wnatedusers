/*
 * Script for the Username Marketplace website.
 *
 * This file defines the available product categories along with their
 * descriptions, prices and current stock levels. To adjust a price or
 * quantity, simply edit the corresponding value in the `products` array
 * below. Each entry consists of a category code, a human‑friendly
 * description, a numeric price (USD) and a stock count.
 *
 * The script populates the product table dynamically and binds the
 * appropriate Discord link to the purchase buttons and call‑to‑action.
 */

// Replace this with your actual Discord server invite link.
// Users will be directed to this Discord invite when clicking the checkout buttons
// or the call‑to‑action. Provide the full invite URL (including the channel if needed).
const discordLink = "https://discord.gg/EtP4Zbt4rQ";

// Product catalogue. Each entry represents a unique 4‑letter username along with its
// price and current stock level. Prices range from $5 to $10 depending on rarity.
// List of product entries. Each object defines the username, its price and
// how many are available (stock). To add more names, append another
// object to this array with the desired price and stock. Prices are
// rounded to two decimals and should fall between $5 and $10.
// Each product has a category and optional meaning. Categories include:
//  '3L'      - three-letter usernames (letters only)
//  '3L-semi' - three-letter usernames with a punctuation (dot or underscore)
//  '4L'      - four-letter usernames (letters only)
//  '4N'      - four-number usernames (digits only)
//  'mixed'   - usernames that do not fit the above patterns
//  'other'   - catch-all for any miscellaneous names
// The meaning field is used to annotate any usernames that resemble real words.
const products = [
  { username: 'apb4', price: 6.50, stock: 1, category: 'mixed', meaning: '' },
  { username: 'xuqg', price: 5.75, stock: 1, category: '4L', meaning: '' },
  { username: 'zdbv', price: 7.00, stock: 1, category: '4L', meaning: '' },
  { username: 'xqbu', price: 8.25, stock: 1, category: '4L', meaning: '' },
  { username: 'kbyb', price: 7.50, stock: 1, category: '4L', meaning: '' },
  { username: 'cqup', price: 6.25, stock: 1, category: '4L', meaning: '' },
  { username: 'oqhc', price: 9.00, stock: 1, category: '4L', meaning: '' },
  { username: 'zprw', price: 8.75, stock: 1, category: '4L', meaning: '' },
  { username: 'srsk', price: 9.50, stock: 1, category: '4L', meaning: '' },
  { username: 'unxr', price: 10.00, stock: 1, category: '4L', meaning: '' },
  { username: 'jnqd', price: 7.25, stock: 1, category: '4L', meaning: '' },
  // Additional names (previously added)
  { username: 'ammv', price: 6.50, stock: 1, category: '4L', meaning: '' },
  { username: 'at0t', price: 6.00, stock: 1, category: 'mixed', meaning: '' },
  { username: 'gmwv', price: 7.25, stock: 1, category: '4L', meaning: '' },
  { username: 'tcia', price: 5.75, stock: 1, category: '4L', meaning: '' },
  // New stock additions requested by the user. Prices reflect
  // relative rarity: 3‑letter names with punctuation are more expensive.
  { username: 'eanr', price: 7.50, stock: 1, category: '4L', meaning: '' },
  { username: 'pdrn', price: 6.75, stock: 1, category: '4L', meaning: '' },
  { username: 'ct_x', price: 7.25, stock: 1, category: '3L-semi', meaning: '' },
  { username: 'jmgs', price: 6.75, stock: 1, category: '4L', meaning: '' },
  { username: 'kwhz', price: 8.00, stock: 1, category: '4L', meaning: '' },
  { username: 'idft', price: 6.50, stock: 1, category: '4L', meaning: '' },
  { username: 'y.dh', price: 17.00, stock: 1, category: '3L-semi', meaning: '' },
  { username: 'xe.i', price: 18.50, stock: 1, category: '3L-semi', meaning: '' },
  // New names provided by the user (4‑letter usernames)
  { username: 'aenc', price: 7.25, stock: 1, category: '4L', meaning: '' },
  { username: 'hsst', price: 7.00, stock: 1, category: '4L', meaning: '' },
  // uoxe is an Old Lombard word meaning "voice" (alternative form of vox)【557108320010663†L107-L110】
  { username: 'uoxe', price: 6.75, stock: 1, category: '4L', meaning: 'voice (Old Lombard)' },
  { username: 'ebzv', price: 6.50, stock: 1, category: '4L', meaning: '' },
  { username: 'jbwa', price: 7.00, stock: 1, category: '4L', meaning: '' },
  { username: 'dtuw', price: 6.75, stock: 1, category: '4L', meaning: '' }
];

// Key used for storing cart items in localStorage. Cart items are stored
// as an array of product usernames; duplicates indicate quantity.
const CART_KEY = 'cart_items';

// Stripe integration settings.
// When deployed on Vercel, the site fetches the publishable key from /api/public-config
// and sends cart items to /api/create-stripe-session, which creates a Checkout Session
// on the server using your Stripe secret key.
const stripeSessionEndpoint = '/api/create-stripe-session';
let stripePublicKeyCache = null;

/**
 * Load the current cart from local storage. If no cart exists, returns an empty array.
 * @returns {Array} An array of usernames currently in the cart.
 */
function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Could not parse cart from localStorage', err);
    return [];
  }
}

/**
 * Save a cart array back to local storage.
 * @param {Array} cartArray An array of usernames to persist.
 */
function saveCart(cartArray) {
  localStorage.setItem(CART_KEY, JSON.stringify(cartArray));
}

/**
 * Add a product to the cart. If the product is already present, another
 * instance will be added (quantity increases). After updating the cart,
 * the cart count indicator is refreshed.
 * @param {string} username The username of the product to add.
 */
function addToCart(username) {
  const cart = loadCart();
  cart.push(username);
  saveCart(cart);
  updateCartCount();
  // Provide simple feedback to the user
  alert(`${username} has been added to your cart.`);
}

/**
 * Remove a product from the cart. Only one instance of the product is removed.
 * @param {string} username The username to remove.
 */
function removeFromCart(username) {
  let cart = loadCart();
  const index = cart.indexOf(username);
  if (index > -1) {
    cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
  }
}

/**
 * Update the cart count indicator in the navigation. If a span with the
 * id "cart-count" exists, its text content is set to the number of items
 * in the cart. This helps users keep track of how many items they have.
 */
function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  const cart = loadCart();
  countEl.textContent = cart.length;
}

/**
 * Look up a product object by its username. Returns undefined if not found.
 * @param {string} username The username to find.
 */
function findProduct(username) {
  return products.find((p) => p.username === username);
}

/**
 * Render the cart on the cart page. This function should be called on
 * cart.html to build a table of cart items, show quantities and total price,
 * and provide remove buttons and a checkout link to Discord.
 */
function renderCart() {
  const cartTableBody = document.querySelector('#cart-table tbody');
  if (!cartTableBody) return;
  cartTableBody.innerHTML = '';
  const cart = loadCart();
  if (cart.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="5">Your cart is empty.</td>`;
    cartTableBody.appendChild(row);
    return;
  }
  // Calculate quantities: {username: count}
  const counts = {};
  cart.forEach((u) => {
    counts[u] = (counts[u] || 0) + 1;
  });
  let total = 0;
  Object.keys(counts).forEach((username) => {
    const product = findProduct(username);
    if (!product) return;
    const quantity = counts[username];
    const subtotal = product.price * quantity;
    total += subtotal;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.username}</td>
      <td>${product.meaning ? product.meaning : ''}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${quantity}</td>
      <td>$${subtotal.toFixed(2)}</td>
      <td><button class="btn remove-item" data-username="${product.username}">Remove</button></td>
    `;
    cartTableBody.appendChild(row);
    // Attach event listener to remove button
    const removeBtn = row.querySelector('.remove-item');
    removeBtn.addEventListener('click', () => {
      removeFromCart(product.username);
      // Re-render the cart after removing
      renderCart();
    });
  });
  // Render total in a final row
  const totalRow = document.createElement('tr');
  totalRow.innerHTML = `
    <td colspan="4" style="text-align:right;font-weight:600;">Total:</td>
    <td>$${total.toFixed(2)}</td>
    <td></td>
  `;
  cartTableBody.appendChild(totalRow);
  // Bind checkout button
  const checkoutBtn = document.getElementById('checkout-button');
  if (checkoutBtn) {
    checkoutBtn.onclick = function () {
      // Redirect to Discord for checkout with cart details appended in the query
      // Compose a query string with the cart contents for reference
      const details = encodeURIComponent(cart.join(','));
      window.location.href = `${discordLink}?cart=${details}`;
    };
  }

  initPaymentButtons();
}

/**
 * Initialise Stripe and PayPal payment buttons on the cart page. This
 * function binds click handlers to the Stripe button and renders the
 * PayPal button. It should be called after the cart table has been
 * rendered and the corresponding elements are available in the DOM.
 */

function initPaymentButtons() {
  const stripeBtn = document.getElementById('stripe-button');
  if (stripeBtn) {
    stripeBtn.onclick = async () => {
      try {
        const cart = loadCart();
        if (!cart.length) {
          alert('Your cart is empty.');
          return;
        }

        if (!stripePublicKeyCache) {
          const configRes = await fetch('/api/public-config');
          if (!configRes.ok) {
            throw new Error('Could not load Stripe config.');
          }
          const config = await configRes.json();
          stripePublicKeyCache = config.publishableKey;
        }

        const response = await fetch(stripeSessionEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Could not create Stripe checkout session.');
        }

        const data = await response.json();
        const stripe = Stripe(stripePublicKeyCache);
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (result && result.error) {
          throw new Error(result.error.message);
        }
      } catch (error) {
        console.error('Stripe checkout failed', error);
        alert(error.message || 'Stripe checkout failed. Please try again or contact support.');
      }
    };
  }
}


/**
 * Renders the product table using the global `products` array.
 */
/**
 * Renders a list of product objects into the product table. Each object
 * may include a meaning property. If the list is empty, a single
 * row with an "Out of stock" message will be displayed.
 *
 * @param {Array} items - List of product objects to display.
 */
function renderTable(items) {
  const tbody = document.querySelector('#product-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!items || items.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="5" class="out-of-stock">Out of stock</td>
    `;
    tbody.appendChild(row);
    return;
  }
  items.forEach((item) => {
    const row = document.createElement('tr');
    const meaningText = item.meaning ? item.meaning : '';
    const stockText = item.stock > 0 ? item.stock : 'Out of stock';
    row.innerHTML = `
      <td>${item.username}</td>
      <td>${meaningText}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${stockText}</td>
      <td><button class="btn add-to-cart" data-username="${item.username}">Add to Cart</button></td>
    `;
    tbody.appendChild(row);
    // Attach an event listener to the Add to Cart button
    const addBtn = row.querySelector('.add-to-cart');
    addBtn.addEventListener('click', () => {
      addToCart(item.username);
    });
  });
}

/**
 * Renders all products in the default table. Used for the general stock page.
 */
function renderProducts() {
  renderTable(products);
}

/**
 * Renders products filtered by a specific category. If no items
 * match the category, an out‑of‑stock row will be shown.
 * @param {string} category - The category identifier (e.g., '3L', '3L-semi').
 */
function renderCategory(category) {
  const filtered = products.filter((item) => item.category === category);
  renderTable(filtered);
}

/**
 * Assigns the Discord link to the call‑to‑action anchor and updates the
 * copyright year.
 */
function init() {
  // Set Discord link on CTA
  const ctaLink = document.getElementById('discord-link');
  if (ctaLink) {
    ctaLink.href = discordLink;
  }
  // Populate the current year in the footer
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  // Render the product table
  renderProducts();

  // Update the cart count indicator in the navigation (if present)
  updateCartCount();
}

// Initialise after DOM content is fully loaded
document.addEventListener('DOMContentLoaded', init);