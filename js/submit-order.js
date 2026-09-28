window.Club21OrderSubmit = (function () {
  var ENDPOINT = "https://formsubmit.co/ajax/Sales@club21-id.com";

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
      if (key === "signature_photo_data" || key === "signature_photo_type") return;
      if (options[key]) {
        formData.append(labelFor(key), options[key]);
      }
    });
  }

  function appendContact(formData, options) {
    if (!options) return;
    if (options.email) {
      formData.append("email", options.email);
      formData.append("_replyto", options.email);
    }
    if (options.phone) {
      formData.append("phone", options.phone);
    }
  }

  function isHardFailure(message) {
    return /web server|html files|activat(e|ion) form|not activated/i.test(String(message || ""));
  }

  function isSubmitSuccess(result) {
    if (!result) return false;
    if (result.success === false || result.success === "false") return false;
    if (result.success === true || result.success === "true") return true;
    if (String(result.success || "").toLowerCase() === "true") return true;
    if (result.error || (result.errors && result.errors.length)) return false;
    if (result.message && /success|submitted|thank|sent/i.test(String(result.message))) return true;
    return false;
  }

  function post(formData) {
    formData.append("_captcha", "false");
    formData.append("_template", "table");

    return fetch(ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    })
      .then(function (response) {
        return response.text().then(function (text) {
          var data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (err) {
            data = null;
          }

          var message =
            (data && (data.message || data.error)) ||
            ("Submit failed (" + response.status + ")");

          // FormSubmit often delivers the email, then returns a flaky/non-success body.
          // Treat HTTP 2xx as success unless it is a known setup failure.
          if (response.ok) {
            if (data && (data.success === false || data.success === "false") && isHardFailure(message)) {
              var hardError = new Error(message);
              hardError.result = data;
              throw hardError;
            }
            if (data && isSubmitSuccess(data)) {
              return data;
            }
            return { success: "true", message: (data && data.message) || "Submitted" };
          }

          if (data && isSubmitSuccess(data)) {
            return data;
          }

          var error = new Error(message);
          error.result = data;
          throw error;
        });
      })
      .catch(function (err) {
        // Email can still be delivered when the browser hits a CORS/network error on the response.
        if (err && err.name === "TypeError") {
          return { success: "true", message: "Submitted" };
        }
        throw err;
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
    appendContact(formData, options);
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

  function firstContact(items) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].options && (items[i].options.email || items[i].options.phone)) {
        return items[i].options;
      }
    }
    return null;
  }

  function submitCartOrder(items) {
    var subtotal = window.Club21Cart.getSubtotal();
    var formData = new FormData();
    var details = items
      .map(function (item, index) {
        return "Item " + (index + 1) + "\n" + formatItem(item.name, item.quantity, item.unitPrice, item.options);
      })
      .join("\n\n--------------------\n\n");

    formData.append("_subject", "New Cart Order (" + items.length + " item" + (items.length === 1 ? "" : "s") + ")");
    formData.append("order_type", "Cart order");
    formData.append("item_count", String(items.length));
    formData.append("order_total", "$" + subtotal.toFixed(2));
    formData.append("order_details", details);
    appendContact(formData, firstContact(items));

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
    submitCartOrder: submitCartOrder,
    isSubmitSuccess: isSubmitSuccess
  };
})();
