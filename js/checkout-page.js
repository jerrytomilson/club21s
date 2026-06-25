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
      '<div class="woocommerce-info">Your cart is empty. <a href="shop.html">Browse products</a></div>'
    );
  }

  function renderSuccess() {
    return (
      '<div class="woocommerce-order-received">' +
      '<p class="woocommerce-notice woocommerce-notice--success">Thank you. Your order has been received.</p>' +
      "<p>We will review your order details and contact you with payment and shipping instructions.</p>" +
      '<p><a class="button" href="shop.html">Continue shopping</a></p>' +
      "</div>"
    );
  }

  function renderCheckout(items) {
    var subtotal = window.Club21Cart.getSubtotal();
    var rows = items.map(function (item) {
      return (
        "<tr>" +
        "<td>" + escapeHtml(item.name) + " &times; " + item.quantity + "</td>" +
        "<td>" + formatMoney(item.lineTotal) + "</td>" +
        "</tr>"
      );
    }).join("");

    return (
      '<div id="checkout-notices"></div>' +
      '<div class="checkout-layout">' +
      '<div class="checkout-order-review">' +
      "<h2>Your order</h2>" +
      '<table class="shop_table shop_table_responsive">' +
      "<tbody>" + rows + "</tbody>" +
      "<tfoot>" +
      '<tr><th>Total</th><td><strong>' + formatMoney(subtotal) + "</strong></td></tr>" +
      "</tfoot></table>" +
      "</div>" +
      '<form id="checkout-form" class="checkout-form">' +
      "<h2>Contact details</h2>" +
      '<p class="form-row">' +
      '<label for="checkout-email">Email <span class="required">*</span></label>' +
      '<input type="email" id="checkout-email" name="email" required>' +
      "</p>" +
      '<p class="form-row">' +
      '<label for="checkout-phone">Phone</label>' +
      '<input type="tel" id="checkout-phone" name="phone">' +
      "</p>" +
      '<p class="form-row">' +
      '<label for="checkout-notes">Additional notes</label>' +
      '<textarea id="checkout-notes" name="notes" rows="4"></textarea>' +
      "</p>" +
      '<button type="submit" class="button alt place-order-button">Place order</button>' +
      "</form></div>"
    );
  }

  function render() {
    var root = document.getElementById("club21-checkout-root");
    if (!root || !window.Club21Cart) return;

    var params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      root.innerHTML = renderSuccess();
      return;
    }

    var items = window.Club21Cart.load();
    if (!items.length) {
      root.innerHTML = renderEmpty();
      return;
    }

    root.innerHTML = renderCheckout(items);

    var form = document.getElementById("checkout-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      window.Club21Cart.clear();
      window.location.href = "checkout.html?success=1";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
