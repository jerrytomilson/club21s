(function () {
  function formatMoney(amount) {
    return "$" + amount.toFixed(2);
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderEmpty() {
    return (
      '<div class="wc-empty-cart-message">' +
      '<div class="cart-empty woocommerce-info" role="status">Your cart is currently empty.</div>' +
      "</div>" +
      '<p class="return-to-shop">' +
      '<a class="button wc-backward" href="shop.html">Return to shop</a>' +
      "</p>"
    );
  }

  function renderRow(item) {
    var productUrl = "product.html?state=" + encodeURIComponent(item.slug);
    var summary = window.Club21OrderFields.summary(item.options);

    return (
      '<tr class="woocommerce-cart-form__cart-item cart_item">' +
      '<td class="product-remove">' +
      '<a href="#" class="remove club21-remove-item" aria-label="Remove item" data-id="' + item.id + '">&times;</a>' +
      "</td>" +
      '<td class="product-thumbnail">' +
      '<a href="' + productUrl + '"><img src="' + escapeHtml(item.image) + '" width="60" height="60" alt="' + escapeHtml(item.name) + '"></a>' +
      "</td>" +
      '<td class="product-name" data-title="Product">' +
      '<a href="' + productUrl + '">' + escapeHtml(item.name) + "</a>" +
      (summary ? '<div class="club21-cart-item-meta">' + escapeHtml(summary) + "</div>" : "") +
      (!summary ? '<div class="club21-cart-item-meta club21-cart-item-warning">Open product page to fill in order details before placing order.</div>' : "") +
      "</td>" +
      '<td class="product-price" data-title="Price">' +
      '<span class="woocommerce-Price-amount amount">' + formatMoney(item.unitPrice) + "</span>" +
      "</td>" +
      '<td class="product-quantity" data-title="Quantity">' +
      '<div class="quantity buttons_added">' +
      '<input type="number" class="input-text qty text club21-qty-input" min="1" max="100" step="1" value="' + item.quantity + '" data-id="' + item.id + '">' +
      "</div></td>" +
      '<td class="product-subtotal" data-title="Subtotal">' +
      '<span class="woocommerce-Price-amount amount">' + formatMoney(item.lineTotal) + "</span>" +
      "</td></tr>"
    );
  }

  function renderCart(items) {
    var subtotal = window.Club21Cart.getSubtotal();
    var rows = items.map(renderRow).join("");

    return (
      '<div class="woocommerce-notices-wrapper" id="club21-cart-notices"></div>' +
      '<form class="woocommerce-cart-form" action="cart.html" method="post" onsubmit="return false;">' +
      '<table class="shop_table shop_table_responsive cart woocommerce-cart-form__contents" cellspacing="0">' +
      "<thead><tr>" +
      '<th class="product-remove"><span class="screen-reader-text">Remove item</span></th>' +
      '<th class="product-thumbnail"><span class="screen-reader-text">Thumbnail image</span></th>' +
      '<th class="product-name">Product</th>' +
      '<th class="product-price">Price</th>' +
      '<th class="product-quantity">Quantity</th>' +
      '<th class="product-subtotal">Subtotal</th>' +
      "</tr></thead><tbody>" + rows + "</tbody></table></form>" +
      '<div class="cart-collaterals"><div class="cart_totals calculated_shipping">' +
      "<h2>Cart totals</h2>" +
      '<table cellspacing="0" class="shop_table shop_table_responsive">' +
      "<tbody>" +
      '<tr class="cart-subtotal"><th>Subtotal</th><td data-title="Subtotal">' +
      '<span class="woocommerce-Price-amount amount">' + formatMoney(subtotal) + "</span></td></tr>" +
      '<tr class="order-total"><th>Total</th><td data-title="Total">' +
      '<strong><span class="woocommerce-Price-amount amount">' + formatMoney(subtotal) + "</span></strong></td></tr>" +
      "</tbody></table>" +
      '<div class="wc-proceed-to-checkout">' +
      '<a href="#" class="checkout-button button alt wc-forward club21-place-order-btn">Place order</a>' +
      "</div></div></div>"
    );
  }

  function showNotice(message, type) {
    var wrapper = document.getElementById("club21-cart-notices");
    if (!wrapper) return;
    var cls = type === "error" ? "woocommerce-error" : "woocommerce-message";
    wrapper.innerHTML = '<div class="' + cls + '" role="alert">' + escapeHtml(message) + "</div>";
    wrapper.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function showAddedNotice() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("added") !== "1") return;
    showNotice("Product added to your cart.");
    window.history.replaceState({}, document.title, "cart.html");
  }

  function wirePlaceOrder(root) {
    var btn = root.querySelector(".club21-place-order-btn");
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var items = window.Club21Cart.load();
      var incomplete = items.filter(function (item) {
        return !window.Club21OrderFields.isComplete(item.options);
      });

      if (incomplete.length) {
        showNotice(
          "Some items are missing order details. Open each product, fill in the form, then add to cart again: " +
          incomplete.map(function (i) { return i.name; }).join(", "),
          "error"
        );
        return;
      }

      btn.textContent = "Sending...";
      btn.style.pointerEvents = "none";

      window.Club21OrderSubmit.submitCartOrder(items)
        .then(function (result) {
          if (result && result.success === "true") {
            window.Club21Cart.clear();
            showNotice("Thank you! Your order has been sent. We will contact you shortly.");
            render();
          } else {
            showNotice("Could not send your order. Please try again or email contact@scannableidus.com directly.", "error");
          }
        })
        .catch(function () {
          showNotice("Could not send your order. Please check your connection and try again.", "error");
        })
        .finally(function () {
          btn.textContent = "Place order";
          btn.style.pointerEvents = "";
        });
    });
  }

  function wireEvents(root) {
    root.querySelectorAll(".club21-remove-item").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        window.Club21Cart.removeItem(link.getAttribute("data-id"));
        render();
      });
    });

    root.querySelectorAll(".club21-qty-input").forEach(function (input) {
      input.addEventListener("change", function () {
        window.Club21Cart.updateQuantity(
          input.getAttribute("data-id"),
          parseInt(input.value, 10) || 1
        );
        render();
      });
    });

    wirePlaceOrder(root);
  }

  function render() {
    var root = document.getElementById("club21-cart-root");
    if (!root || !window.Club21Cart) return;

    var items = window.Club21Cart.load();
    root.innerHTML = items.length ? renderCart(items) : renderEmpty();
    showAddedNotice();
    wireEvents(root);
    window.Club21Cart.updateHeaderBadge();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }

  window.addEventListener("club21-cart-updated", render);
})();
