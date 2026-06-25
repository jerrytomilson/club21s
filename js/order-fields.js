window.Club21OrderFields = (function () {
  var REQUIRED = [
    "first_name", "last_name", "gender", "eye_color", "hair_color",
    "height", "weight", "birthday", "street_address", "city", "zip_code", "issue_date"
  ];

  var FIELDS = [
    { type: "file", name: "signature_photo", label: "Signature & Photo", accept: "image/*" },
    { type: "text", name: "first_name", label: "First Name", placeholder: "First Name", required: true },
    { type: "text", name: "middle_name", label: "Middle Name", placeholder: "Middle Name" },
    { type: "text", name: "last_name", label: "Last Name", placeholder: "Last Name", required: true },
    { type: "select", name: "gender", label: "Gender", options: ["Male", "Female"], required: true },
    { type: "text", name: "eye_color", label: "Eye Color", placeholder: "Eye Color", required: true },
    { type: "text", name: "hair_color", label: "Hair Color", placeholder: "Hair Color", required: true },
    { type: "text", name: "height", label: "Height", placeholder: "5-05 (for example)", required: true },
    { type: "text", name: "weight", label: "Weight", placeholder: "Weight", required: true },
    { type: "date", name: "birthday", label: "Birthday", required: true },
    { type: "text", name: "street_address", label: "Street Address", placeholder: "Address for your fake id", required: true },
    { type: "text", name: "city", label: "City", placeholder: "City", required: true },
    { type: "text", name: "zip_code", label: "Zip Code", placeholder: "Zip Code", required: true },
    { type: "date", name: "issue_date", label: "Issue Date", required: true },
    { type: "text", name: "driver_license", label: "Driver License", placeholder: "Leave blank for us to format" },
    { type: "select", name: "restrictions", label: "Restrictions (Corrective Lenses)", options: ["Yes", "No"] },
    { type: "select", name: "organ_donor", label: "Organ Donor (Corrective Lenses)", options: ["Yes", "No"] }
  ];

  function escapeAttr(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function val(options, name) {
    return options && options[name] ? String(options[name]) : "";
  }

  function renderField(field, options, idPrefix) {
    var id = idPrefix + "-" + field.name;
    var value = val(options, field.name);
    var req = field.required ? ' <span class="wcpa_required_ast">*</span>' : "";
    var reqAttr = field.required ? " required" : "";

    if (field.type === "file") {
      var fileName = val(options, "signature_photo_name");
      return (
        '<div class="wcpa_field_wrap">' +
        '<label class="wcpa_field_label">' + field.label + ' <span class="wcpa_required_ast">*</span></label>' +
        '<div class="wcpa_file_drop codedropz-upload-handler">' +
        "<p>" + (fileName ? "Selected: <strong>" + escapeAttr(fileName) + "</strong>" : 'Drag &amp; Drop Files Here or <span class="dnd-upload-browse">Browse Files</span>') + "</p>" +
        '<input type="file" id="' + id + '" name="' + field.name + '" accept="' + (field.accept || "image/*") + '" required>' +
        "</div></div>"
      );
    }

    if (field.type === "select") {
      var opts = '<option value="">select</option>' +
        field.options.map(function (o) {
          return '<option value="' + o + '"' + (value === o ? " selected" : "") + ">" + o + "</option>";
        }).join("");
      return (
        '<div class="wcpa_field_wrap">' +
        '<label for="' + id + '" class="wcpa_field_label">' + field.label + req + "</label>" +
        '<select class="wcpa_field" id="' + id + '" name="' + field.name + '"' + reqAttr + ">" + opts + "</select>" +
        "</div>"
      );
    }

    var inputType = field.type === "date" ? "date" : "text";
    return (
      '<div class="wcpa_field_wrap">' +
      '<label for="' + id + '" class="wcpa_field_label">' + field.label + req + "</label>" +
      '<input type="' + inputType + '" class="wcpa_field" id="' + id + '" name="' + field.name + '"' +
      ' value="' + escapeAttr(value) + '"' +
      (field.placeholder ? ' placeholder="' + escapeAttr(field.placeholder) + '"' : "") +
      reqAttr + ">" +
      "</div>"
    );
  }

  function renderForm(options, idPrefix) {
    return (
      '<div class="wcpa_wrap club21-order-fields">' +
      FIELDS.map(function (field) { return renderField(field, options || {}, idPrefix); }).join("") +
      "</div>"
    );
  }

  function collectFromForm(form) {
    var data = {};
    FIELDS.forEach(function (field) {
      if (field.type === "file") return;
      var el = form.elements.namedItem(field.name);
      data[field.name] = el ? el.value : "";
    });

    var fileInput = form.querySelector('input[type="file"]');
    if (fileInput && fileInput.files.length) {
      data.signature_photo_name = fileInput.files[0].name;
    } else if (form.dataset.photoName) {
      data.signature_photo_name = form.dataset.photoName;
    } else {
      data.signature_photo_name = "";
    }

    return data;
  }

  function missingFields(options) {
    var missing = [];
    if (!options || !options.signature_photo_name) {
      missing.push("Signature & Photo");
    }
    REQUIRED.forEach(function (name) {
      if (!options || !String(options[name] || "").trim()) {
        var field = FIELDS.find(function (f) { return f.name === name; });
        missing.push(field ? field.label : name);
      }
    });
    return missing;
  }

  function isComplete(options) {
    return missingFields(options).length === 0;
  }

  function summary(options) {
    if (!options) return "";
    var parts = [];
    if (options.first_name || options.last_name) {
      parts.push([options.first_name, options.last_name].filter(Boolean).join(" "));
    }
    if (options.city) parts.push(options.city);
    if (options.signature_photo_name) parts.push("Photo: " + options.signature_photo_name);
    return parts.join(" · ");
  }

  return {
    FIELDS: FIELDS,
    renderForm: renderForm,
    collectFromForm: collectFromForm,
    missingFields: missingFields,
    isComplete: isComplete,
    summary: summary
  };
})();
