// cart.js
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');

// Initialize cart count
let itemCount = 0;

// Function to update cart count
function updateCartCount(count) {
  itemCount = count;
  cartCount.textContent = itemCount;
}

// Example function to add an item to the cart
function addItemToCart() {
  // Here you would add logic to add an item to the cart
  // For demonstration purposes, we'll just increase the count by 1
  itemCount++;
  updateCartCount(itemCount);
}

// Example usage: Call addItemToCart() whenever an item is added to the cart
