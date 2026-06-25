window.Club21OrderSubmit = (function () {
  var EMAIL = "contact@scannableidus.com";
  var ENDPOINT = "https://formsubmit.co/ajax/contact@scannableidus.com";

  function labelFor(name) {
    var field = window.Club21OrderFields.FIELDS.find(function (f) {
      return f.name === name;
    });
    return field ? field.label : name;
  }

  function formatItem(productName, qty, price, options) {
    var lines = [
      "Product: " + productName,
      "Quantity: " + qty,
      "Unit price: $" + Number(price).toFixed(2),
      ""
    ];

    window.Club21OrderFields.FIELDS.forEach(function (field) {
      if (field.type === "file") {
        if (options && options.signature_photo_name) {
          lines.push(field.label + ": " + options.signature_photo_name);
        }
        return;
      }
      if (options && options[field.name]) {
        lines.push(field.label + ": " + options[field.name]);
      }
    });

    return lines.join("\n");
  }

  function appendFields(formData, options) {
    if (!options) return;
    Object.keys(options).forEach(function (key) {
      if (options[key]) {
        formData.append(labelFor(key), options[key]);
      }
    });
  }

  function post(formData) {
    formData.append("_captcha", "false");
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    }).then(function (response) {
      return response.json();
    });
  }

  function submitProductOrder(product, qty, options, fileInput) {
    var formData = new FormData();
    formData.append("_subject", "New ID Order - " + product.name);
    formData.append("order_type", "Single product order");
    formData.append("product", product.name);
    formData.append("quantity", String(qty));
    formData.append("unit_price", "$" + product.price.toFixed(2));
    formData.append("order_details", formatItem(product.name, qty, product.price, options));
    appendFields(formData, options);

    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append("signature_photo", fileInput.files[0]);
    }

    return post(formData);
  }

  function dataUrlToFile(dataUrl, fileName, mimeType) {
    if (!dataUrl || dataUrl.indexOf("data:") !== 0) return null;
    var parts = dataUrl.split(",");
    var mime = mimeType || (parts[0].match(/:(.*?);/) || [])[1] || "image/jpeg";
    var binary = atob(parts[1]);
    var len = binary.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], fileName || "signature-photo.jpg", { type: mime });
  }

  function submitCartOrder(items) {
    var subtotal = window.Club21Cart.getSubtotal();
    var formData = new FormData();
    var details = items.map(function (item, index) {
      return "Item " + (index + 1) + "\n" + formatItem(item.name, item.quantity, item.unitPrice, item.options);
    }).join("\n\n--------------------\n\n");

    formData.append("_subject", "New Cart Order (" + items.length + " item" + (items.length === 1 ? "" : "s") + ")");
    formData.append("order_type", "Cart order");
    formData.append("item_count", String(items.length));
    formData.append("order_total", "$" + subtotal.toFixed(2));
    formData.append("order_details", details);

    items.forEach(function (item, index) {
      var prefix = "item_" + (index + 1) + "_";
      formData.append(prefix + "product", item.name);
      formData.append(prefix + "quantity", String(item.quantity));
      formData.append(prefix + "unit_price", "$" + item.unitPrice.toFixed(2));
      if (item.options) {
        Object.keys(item.options).forEach(function (key) {
          if (!item.options[key] || key === "signature_photo_data" || key === "signature_photo_type") return;
          formData.append(prefix + key, item.options[key]);
        });

        if (item.options.signature_photo_data) {
          var photoFile = dataUrlToFile(
            item.options.signature_photo_data,
            item.options.signature_photo_name || "signature-photo-" + (index + 1) + ".jpg",
            item.options.signature_photo_type
          );
          if (photoFile) {
            formData.append("signature_photo_item_" + (index + 1), photoFile);
          }
        }
      }
    });

    return post(formData);
  }

  return {
    submitProductOrder: submitProductOrder,
    submitCartOrder: submitCartOrder
  };
})();
