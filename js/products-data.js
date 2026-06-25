(function () {
  function img(file) {
    if (file.indexOf("NE-D100") >= 0) {
      return "https://club21sid.com/wp-content/uploads/2026/03/" + file;
    }
    if (file.indexOf("Oklahoma") >= 0) {
      return "https://club21sid.com/wp-content/uploads/2026/02/" + file;
    }
    return "https://club21sid.com/wp-content/uploads/2024/07/" + file;
  }

  window.CLUB21_PRODUCTS = [
    { slug: "arizona", name: "Arizona", price: 90, image: img("AZ-new-300x300.jpg") },
    { slug: "arizona-premium", name: "Arizona (Premium)", price: 160, image: img("AZP-300x300.jpg") },
    { slug: "california", name: "California", price: 100, image: img("ca-r-300x300.png") },
    { slug: "colorado-premium", name: "Colorado (Premium)", price: 164, image: img("COP-300x300.jpg") },
    { slug: "connecticut", name: "Connecticut", price: 90, image: img("CT-300x300.jpg") },
    { slug: "delaware", name: "Delaware", price: 100, image: img("DE1-300x300.jpg") },
    { slug: "florida", name: "Florida", price: 100, image: img("FLnew-300x300.jpg") },
    { slug: "georgia-premium", name: "Georgia (Premium)", price: 180, image: img("GAP-300x300.jpg") },
    { slug: "illinois", name: "Illinois", price: 90, image: img("IL-Star-300x300.jpg") },
    { slug: "indiana", name: "Indiana", price: 90, image: img("IN1-300x300.jpg") },
    { slug: "kansas", name: "Kansas", price: 100, image: img("KS-cut-300x300.jpg") },
    { slug: "louisiana", name: "Louisiana", price: 100, image: img("LA-300x300.jpg") },
    { slug: "maine", name: "Maine", price: 120, image: img("ME-300x300.jpg") },
    { slug: "maryland", name: "Maryland", price: 120, image: img("MD-edit-300x300.png") },
    { slug: "michigan", name: "Michigan", price: 100, image: img("MI12-300x300.jpg") },
    { slug: "minnesota", name: "Minnesota", price: 90, image: img("MN1-300x300.jpg") },
    { slug: "missouri", name: "Missouri", price: 100, image: img("MO-new-300x300.jpg") },
    { slug: "montana", name: "Montana", price: 100, image: img("MT-300x300.png") },
    { slug: "nebraska-id", name: "Nebraska ID", price: 120, image: img("NE-D100-PR_ADULT_ID_300dpi-300x300.avif") },
    { slug: "new-jersey", name: "New Jersey", price: 100, image: img("nNJ-300x300.jpg") },
    { slug: "new-mexico", name: "New Mexico", price: 100, image: img("NM-300x300.jpg") },
    { slug: "new-york-premium", name: "New York (Premium)", price: 170, image: img("NYP-300x300.jpg") },
    { slug: "north-carolina", name: "North Carolina", price: 120, image: img("NC-1-300x300.jpg") },
    { slug: "ohio", name: "Ohio", price: 90, image: img("OH-Edit-300x300.jpg") },
    { slug: "oregon", name: "Oregon", price: 100, image: img("OR-Pic-300x300.jpg") },
    { slug: "pennsylvania", name: "Pennsylvania", price: 120, image: img("nPA-300x300.jpg") },
    { slug: "rhode-island", name: "Rhode Island", price: 100, image: img("RI-300x300.jpg") },
    { slug: "south-carolina", name: "South Carolina", price: 100, image: img("SC-1-300x300.jpg") },
    { slug: "tennessee", name: "Tennessee", price: 90, image: img("TN-300x300.jpg") },
    { slug: "texas", name: "Texas", price: 120, image: img("TX-Pic-300x300.jpg") },
    { slug: "utah", name: "Utah", price: 100, image: img("UT-edit-300x300.png") },
    { slug: "washington", name: "Washington", price: 120, image: img("nwa3-300x300.jpg") },
    { slug: "wisconsin-premium", name: "Wisconsin (Premium)", price: 160, image: img("WIP-300x300.jpg") },
    { slug: "wyoming-premium", name: "Wyoming (Premium)", price: 160, image: img("WYP-300x300.jpg") },
    { slug: "new-oklahoma-fake-id", name: "[New] Oklahoma Fake ID", price: 110, image: img("cropped-Oklahoma_cp-300x300.jpg") }
  ];

  window.CLUB21_PRODUCTS_BY_SLUG = Object.fromEntries(
    window.CLUB21_PRODUCTS.map(function (p) { return [p.slug, p]; })
  );

  window.CLUB21_PRODUCTS_BY_NAME = Object.fromEntries(
    window.CLUB21_PRODUCTS.map(function (p) { return [p.name, p]; })
  );
})();
