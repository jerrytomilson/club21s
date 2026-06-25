(function () {
  function wireProductLinks() {
    if (!window.CLUB21_PRODUCTS_BY_NAME) return;

    document.querySelectorAll("li.product").forEach(function (li) {
      var img = li.querySelector(".woo-entry-image-main");
      if (!img) return;

      var product = window.CLUB21_PRODUCTS_BY_NAME[img.alt];
      if (!product) return;

      var url = "product.html?state=" + encodeURIComponent(product.slug);

      li.querySelectorAll('a[href="order.html"]').forEach(function (a) {
        a.href = url;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireProductLinks);
  } else {
    wireProductLinks();
  }
})();
