// Fake Store API:n osoite, josta tuotteet haetaan.
const API_URL = "https://fakestoreapi.com/products";

// Haetaan sivun HTML-elementit talteen muuttujiksi.
const productGrid = document.querySelector("#productGrid");
const statusMessage = document.querySelector("#statusMessage");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const sortSelect = document.querySelector("#sortSelect");
const resultCount = document.querySelector("#resultCount");

// Tähän muuttujaan tallennetaan API:sta saatu tuotetaulukko.
let allProducts = [];

// Muutetaan API:n englanninkieliset kategoriat suomeksi.
const categoryNames = {
  "men's clothing": "Miesten vaatteet",
  "women's clothing": "Naisten vaatteet",
  jewelery: "Korut",
  electronics: "Elektroniikka",
};

// Haetaan tuotteet palvelimelta fetch()-toiminnolla.
async function fetchProducts() {
  statusMessage.hidden = false;
  statusMessage.classList.remove("error");
  statusMessage.textContent = "Haetaan tuotteita palvelimelta...";

  try {
    // fetch lähettää HTTP-pyynnön API-osoitteeseen.
    const response = await fetch(API_URL);

    // Tarkistetaan, onnistuiko palvelimen vastaus.
    if (!response.ok) {
      throw new Error("Palvelin palautti virheen: " + response.status);
    }

    // Muutetaan JSON-vastaus JavaScript-taulukoksi.
    allProducts = await response.json();

    // Luodaan kategoriavalikon vaihtoehdot saadun datan perusteella.
    populateCategories(allProducts);

    // Näytetään kaikki tuotteet ensimmäisellä latauskerralla.
    renderProducts(allProducts);
    statusMessage.hidden = true;
  } catch (error) {
    // Näytetään virheilmoitus, jos haku epäonnistuu.
    statusMessage.hidden = false;
    statusMessage.classList.add("error");
    statusMessage.textContent =
      "Tuotteiden hakeminen epäonnistui. Tarkista internet-yhteys ja yritä ladata sivu uudelleen. (" +
      error.message +
      ")";

    console.error("API-haku epäonnistui:", error);
  }
}

// Täytetään kategoriavalikko API:n palauttamilla kategorioilla.
function populateCategories(products) {
  const categories = [...new Set(products.map((product) => product.category))];

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = categoryNames[category] || category;
    categorySelect.appendChild(option);
  });
}

// Suodatetaan ja järjestetään tuotteet käyttäjän valintojen perusteella.
function filterAndSortProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categorySelect.value;
  const sortValue = sortSelect.value;

  // Suodatetaan tuotteet hakusanan ja kategorian perusteella.
  let filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Järjestetään tuotteet käyttäjän valinnan mukaan.
  if (sortValue === "low-high") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high-low") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "name") {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  }

  renderProducts(filteredProducts);
}

// Luodaan tuotekortit ja lisätään ne sivulle.
function renderProducts(products) {
  productGrid.replaceChildren();

  resultCount.textContent = "Näytetään " + products.length + " tuotetta";

  // Näytetään ilmoitus, jos tuotteita ei löydy.
  if (products.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent =
      "Hakuehdoilla ei löytynyt tuotteita. Kokeile toista hakusanaa tai kategoriaa.";

    productGrid.appendChild(emptyMessage);
    return;
  }

  products.forEach((product) => {
    // Luodaan jokaiselle tuotteelle oma kortti.
    const card = document.createElement("article");
    card.className = "product-card";

    // Luodaan tuotteen kuvan sisältävä alue.
    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image-wrap";

    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.image;
    image.alt = product.title;
    image.loading = "lazy";

    imageWrap.appendChild(image);

    // Luodaan tuotteen kategoria.
    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = categoryNames[product.category] || product.category;

    // Luodaan tuotteen nimi.
    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.title;

    // Luodaan tuotteen kuvaus.
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;

    // Luodaan tuotteen hinta ja arvostelu.
    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent =
      Number(product.price).toFixed(2).replace(".", ",") + " €";

    const rating = document.createElement("span");
    rating.className = "rating";
    rating.textContent =
      "★ " + product.rating.rate + " (" + product.rating.count + ")";

    bottom.append(price, rating);

    // Lisätään kaikki tuotteen osat tuotekorttiin.
    card.append(imageWrap, category, title, description, bottom);

    // Lisätään valmis tuotekortti sivulle.
    productGrid.appendChild(card);
  });
}

// Lisätään tapahtumankäsittelijät dynaamisesti JavaScriptillä.
// HTML-elementteihin ei tarvitse kirjoittaa onclick-attribuutteja.
searchInput.addEventListener("input", filterAndSortProducts);
categorySelect.addEventListener("change", filterAndSortProducts);
sortSelect.addEventListener("change", filterAndSortProducts);

// Käynnistetään API-haku, kun JavaScript-tiedosto suoritetaan.
fetchProducts();
