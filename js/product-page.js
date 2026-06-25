(function () {
  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("state") || "").toLowerCase().trim();
  }

  function formatMoney(amount) {
    return "$" + amount.toFixed(2);
  }

  function bulkPrice(base, discount) {
    return base * (1 - discount / 100);
  }

  function renderBulkTable(price) {
    var rows = [
      { qty: "1", discount: "-", price: price },
      { qty: "2 - 5", discount: "10%", price: bulkPrice(price, 10) },
      { qty: "6 - 9", discount: "20%", price: bulkPrice(price, 20) },
      { qty: "10 - 100", discount: "30%", price: bulkPrice(price, 30) }
    ];

    return rows
      .map(function (row) {
        return (
          "<tr>" +
          "<td>" + row.qty + "</td>" +
          "<td>" + row.discount + "</td>" +
          "<td>" + formatMoney(row.price) + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderRelatedProducts(currentSlug) {
    var related = window.CLUB21_PRODUCTS.filter(function (p) {
      return p.slug !== currentSlug;
    });

    for (var i = related.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = related[i];
      related[i] = related[j];
      related[j] = temp;
    }

    return related.slice(0, 3).map(function (p, i) {
      var url = "product.html?state=" + encodeURIComponent(p.slug);
      var posClass = i === 0 ? " first" : i === 2 ? " last" : "";
      var imgTag =
        '<img loading="lazy" width="300" height="300" src="' + p.image + '" class="woo-entry-image-main" alt="' + p.name + '">';

      return (
        '<li class="entry has-media wcpa_has_options has-product-nav col span_1_of_3 owp-content-center owp-thumbs-layout-horizontal owp-btn-normal owp-tabs-layout-horizontal has-no-thumbnails product type-product' + posClass + '">' +
        '<div class="product-inner clr">' +
        '<div class="woo-entry-image clr">' +
        '<a href="' + url + '" class="woocommerce-LoopProduct-link no-lightbox">' + imgTag + "</a>" +
        "</div>" +
        '<ul class="woo-entry-inner clr">' +
        '<li class="image-wrap"><div class="woo-entry-image clr">' +
        '<a href="' + url + '" class="woocommerce-LoopProduct-link no-lightbox">' + imgTag + "</a>" +
        "</div></li>" +
        '<li class="category"><a href="shop.html" rel="tag">America IDs</a></li>' +
        '<li class="title"><h2><a href="' + url + '">' + p.name + "</a></h2></li>" +
        '<li class="price-wrap"><span class="price"><span class="woocommerce-Price-amount amount">' +
        "<bdi><span class=\"woocommerce-Price-currencySymbol\">$</span>" + p.price.toFixed(2) + "</bdi></span></span></li>" +
        '<li class="rating"></li><li class="woo-desc"></li>' +
        '<li class="btn-wrap clr"><a href="' + url + '" class="button product_type_simple add_to_cart_button">Select options</a></li>' +
        "</ul></div></li>"
      );
    }).join("");
  }

  function renderProductNav(index) {
    var products = window.CLUB21_PRODUCTS;
    var prev = products[(index - 1 + products.length) % products.length];
    var next = products[(index + 1) % products.length];
    var prevUrl = "product.html?state=" + encodeURIComponent(prev.slug);
    var nextUrl = "product.html?state=" + encodeURIComponent(next.slug);

    return (
      '<ul class="owp-product-nav">' +
      '<li class="prev-li">' +
      '<a href="' + prevUrl + '" class="owp-nav-link prev" rel="nofollow" aria-label="View previous product">' +
      '<i class="fa fa-angle-left" aria-hidden="true"></i>' +
      '<span class="screen-reader-text">Previous Product</span></a></li>' +
      '<li class="next-li">' +
      '<a href="' + nextUrl + '" class="owp-nav-link next" rel="nofollow" aria-label="View next product">' +
      '<i class="fa fa-angle-right" aria-hidden="true"></i>' +
      '<span class="screen-reader-text">Next Product</span></a></li>' +
      "</ul>"
    );
  }

  function renderForm() {
    return (
      '<div class="wcpa_form_outer">' +
      '<form class="cart wcpa_form" id="product-order-form" enctype="multipart/form-data">' +
      window.Club21OrderFields.renderForm({}, "product") +
      '<div class="product-summary-actions">' +
      '<div class="quantity buttons_added">' +
      '<label class="screen-reader-text" for="quantity">Quantity</label>' +
      '<a href="#" class="minus" aria-label="Reduce quantity">-</a>' +
      '<input type="number" id="quantity" class="input-text qty text" step="1" min="1" max="100" name="quantity" value="1" title="Qty" inputmode="numeric">' +
      '<a href="#" class="plus" aria-label="Increase quantity">+</a>' +
      "</div>" +
      '<button type="submit" name="add-to-cart" class="single_add_to_cart_button button alt">Add to cart</button>' +
      '<button type="button" id="place-order-btn" class="single_place_order_button button">Place order</button>' +
      "</div>" +
      '<div id="product-order-notice" class="club21-order-notice" aria-live="polite"></div>' +
      "</form></div>"
    );
  }

  function showOrderNotice(message, type) {
    var notice = document.getElementById("product-order-notice");
    if (!notice) return;
    var cls = type === "error" ? "woocommerce-error" : "woocommerce-message";
    notice.innerHTML = '<div class="' + cls + '" role="alert">' + message + "</div>";
    notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function wireQuantityControls() {
    var qtyInput = document.getElementById("quantity");
    var barQty = document.getElementById("bar-quantity");
    if (!qtyInput) return;

    function syncQty(value) {
      var qty = Math.max(1, Math.min(100, value));
      qtyInput.value = qty;
      if (barQty) barQty.value = qty;
    }

    document.querySelectorAll(".plus").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        syncQty(parseInt(qtyInput.value, 10) + 1);
      });
    });

    document.querySelectorAll(".minus").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        syncQty(parseInt(qtyInput.value, 10) - 1);
      });
    });

    qtyInput.addEventListener("change", function () {
      syncQty(parseInt(qtyInput.value, 10) || 1);
    });

    if (barQty) {
      barQty.addEventListener("change", function () {
        syncQty(parseInt(barQty.value, 10) || 1);
      });
    }
  }

  function wireFileInput() {
    var form = document.getElementById("product-order-form");
    if (!form) return;

    var fileInput = form.querySelector('input[type="file"]');
    var browse = form.querySelector(".dnd-upload-browse");
    var dropZone = form.querySelector(".wcpa_file_drop");
    if (!fileInput || !dropZone) return;

    if (browse) {
      browse.addEventListener("click", function (e) {
        e.preventDefault();
        fileInput.click();
      });
    }

    fileInput.addEventListener("change", function () {
      if (fileInput.files.length) {
        var p = dropZone.querySelector("p");
        if (p) {
          p.innerHTML = "Selected: <strong>" + fileInput.files[0].name + "</strong>";
        }
      }
    });
  }

  function getFormOptions(form) {
    return window.Club21OrderFields.collectFromForm(form);
  }

  function validateForm(form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    var options = getFormOptions(form);
    var missing = window.Club21OrderFields.missingFields(options);
    if (missing.length) {
      showOrderNotice("Please complete all required fields: " + missing.join(", "), "error");
      return false;
    }

    return true;
  }

  function addProductToCart(product, qty, options, fileInput, callback) {
    function saveItem(opts) {
      window.Club21Cart.addItem({
        slug: product.slug,
        name: product.name,
        image: product.image,
        basePrice: product.price,
        quantity: qty,
        options: opts
      });
      window.location.href = "cart.html?added=1";
    }

    if (fileInput && fileInput.files && fileInput.files[0]) {
      var reader = new FileReader();
      reader.onload = function () {
        var opts = Object.assign({}, options, {
          signature_photo_data: reader.result,
          signature_photo_type: fileInput.files[0].type || "image/jpeg",
          signature_photo_name: fileInput.files[0].name
        });
        saveItem(opts);
      };
      reader.onerror = function () {
        saveItem(options);
      };
      reader.readAsDataURL(fileInput.files[0]);
      return;
    }

    saveItem(options);
  }

  function setButtonLoading(btn, loading, label) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Sending..." : label;
  }

  function wireFormSubmit(product) {
    var form = document.getElementById("product-order-form");
    if (!form) return;

    var addBtn = form.querySelector(".single_add_to_cart_button");
    var placeBtn = document.getElementById("place-order-btn");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;

      var qty = parseInt(document.getElementById("quantity").value, 10) || 1;
      var fileInput = form.querySelector('input[type="file"]');
      addProductToCart(product, qty, getFormOptions(form), fileInput);
    });

    if (placeBtn) {
      placeBtn.addEventListener("click", function () {
        if (!validateForm(form)) return;

        var qty = parseInt(document.getElementById("quantity").value, 10) || 1;
        var options = getFormOptions(form);
        var fileInput = form.querySelector('input[type="file"]');

        setButtonLoading(placeBtn, true, "Place order");

        window.Club21OrderSubmit.submitProductOrder(product, qty, options, fileInput)
          .then(function (result) {
            if (result && result.success === "true") {
              showOrderNotice("Thank you! Your order has been sent. We will contact you shortly.", "success");
              form.reset();
              var dropZone = form.querySelector(".wcpa_file_drop p");
              if (dropZone) {
                dropZone.innerHTML = 'Drag &amp; Drop Files Here or <span class="dnd-upload-browse">Browse Files</span>';
              }
            } else {
              showOrderNotice("Could not send your order. Please try again or email contact@scannableidus.com directly.", "error");
            }
          })
          .catch(function () {
            showOrderNotice("Could not send your order. Please check your connection and try again.", "error");
          })
          .finally(function () {
            setButtonLoading(placeBtn, false, "Place order");
          });
      });
    }

    if (addBtn) {
      addBtn.addEventListener("click", function () {
        /* submit handled by form */
      });
    }
  }

  function showNotFound() {
    document.title = "Product Not Found";
    document.getElementById("product-content").innerHTML =
      '<div class="woocommerce-notices-wrapper"><p class="woocommerce-info">Product not found. <a href="shop.html">Browse all IDs</a></p></div>';
  }

  function init() {
    var slug = getSlug();
    var product = window.CLUB21_PRODUCTS_BY_SLUG[slug];
    if (!product) {
      showNotFound();
      return;
    }

    var index = window.CLUB21_PRODUCTS.findIndex(function (p) { return p.slug === slug; });
    var tag = product.name.replace(/\([^)]*\)/g, "").trim();

    document.title = product.name + " - Buy Fake IDs online";
    document.getElementById("page-title").textContent = product.name;
    document.getElementById("breadcrumb-product").textContent = product.name;
    document.getElementById("bar-selected-name").textContent = product.name;
    document.getElementById("product-title").textContent = product.name;
    document.getElementById("product-price").innerHTML =
      '<span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>' +
      product.price.toFixed(2) + "</bdi></span>";
    document.getElementById("bar-price").textContent = formatMoney(product.price);
    var productImage = document.getElementById("product-image");
    var largeImage = product.image.replace("-300x300.", "-600x600.");
    productImage.src = largeImage;
    productImage.alt = product.name;
    productImage.onerror = function () {
      productImage.onerror = null;
      productImage.src = product.image;
    };
    document.getElementById("product-tags").textContent = tag;
    document.getElementById("bulk-table-body").innerHTML = renderBulkTable(product.price);
    document.getElementById("product-nav-wrap").innerHTML = renderProductNav(index);
    document.getElementById("product-form-wrap").innerHTML = renderForm();
    document.getElementById("related-products").innerHTML = renderRelatedProducts(slug);

    wireQuantityControls();
    wireFileInput();
    wireFormSubmit(product);

    var barAddBtn = document.getElementById("bar-select-options");
    if (barAddBtn) {
      barAddBtn.textContent = "Select options";
      barAddBtn.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("product-form-wrap").scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
