window.Club21Cart = (function () {
  var STORAGE_KEY = "club21_cart";

  function getDiscountPercent(qty) {
    if (qty >= 10) return 30;
    if (qty >= 6) return 20;
    if (qty >= 2) return 10;
    return 0;
  }

  function unitPrice(basePrice, qty) {
    return basePrice * (1 - getDiscountPercent(qty) / 100);
  }

  function recalcItem(item) {
    var qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    item.quantity = qty;
    item.unitPrice = unitPrice(item.basePrice, qty);
    item.lineTotal = item.unitPrice * qty;
    return item;
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateHeaderBadge();
    window.dispatchEvent(new CustomEvent("club21-cart-updated"));
  }

  function addItem(item) {
    var items = load();
    item.id = item.id || Date.now() + "-" + Math.random().toString(36).slice(2, 9);
    item.addedAt = new Date().toISOString();
    items.push(recalcItem(item));
    save(items);
    return item;
  }

  function removeItem(id) {
    save(load().filter(function (item) { return item.id !== id; }));
  }

  function updateQuantity(id, qty) {
    var items = load().map(function (item) {
      if (item.id === id) {
        item.quantity = qty;
        recalcItem(item);
      }
      return item;
    });
    save(items);
  }

  function updateOptions(id, options) {
    var items = load().map(function (item) {
      if (item.id === id) {
        item.options = options || {};
      }
      return item;
    });
    save(items);
  }

  function getItem(id) {
    return load().find(function (item) { return item.id === id; });
  }

  function getCount() {
    return load().reduce(function (sum, item) {
      return sum + (parseInt(item.quantity, 10) || 1);
    }, 0);
  }

  function getSubtotal() {
    return load().reduce(function (sum, item) {
      return sum + (item.lineTotal || 0);
    }, 0);
  }

  function clear() {
    save([]);
  }

  function updateHeaderBadge() {
    var count = getCount();
    document.querySelectorAll(".wcmenucart-details.count").forEach(function (el) {
      el.textContent = String(count);
    });
  }

  function initBadge() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", updateHeaderBadge);
    } else {
      updateHeaderBadge();
    }
  }

  initBadge();

  return {
    load: load,
    addItem: addItem,
    removeItem: removeItem,
    updateQuantity: updateQuantity,
    updateOptions: updateOptions,
    getItem: getItem,
    getCount: getCount,
    getSubtotal: getSubtotal,
    unitPrice: unitPrice,
    getDiscountPercent: getDiscountPercent,
    clear: clear,
    updateHeaderBadge: updateHeaderBadge
  };
})();
