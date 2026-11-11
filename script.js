// Fake Store API:n osoite.
const API_URL = "https://fakestoreapi.com/products";

// Haetaan sivun HTML-elementit.
const productGrid = document.querySelector("#productGrid");
const statusMessage = document.querySelector("#statusMessage");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const sortSelect = document.querySelector("#sortSelect");
const resultCount = document.querySelector("#resultCount");

// Tänne tallennetaan API:sta haetut ja sivulla käytettävät tuotteet.
let allProducts = [];

// Lemmikkikaupan esimerkkituotteet.
// Tuotenimet, kuvaukset ja kuvat ovat itse määriteltyjä.
// Hinnat ja arvostelut saadaan Fake Store API:sta.
const petProducts = [
  {
    name: "Premium koiran kuivaruoka",
    category: "koirat",
    description: "Laadukasta täysravintoa koirasi päivittäiseen ruokintaan.",
    image: "images/dog-food.jpg",
    icon: "🐶",
  },
  {
    name: "Koiran herkulliset makupalat",
    category: "koirat",
    description: "Maukkaita palkitsemisherkkuja yhteisiin hetkiin.",
    image: "images/dog-food.jpg",
    icon: "🦴",
  },
  {
    name: "Hauska koiran lelu",
    category: "lelut",
    description: "Leikkimiseen ja aktivointiin sopiva koiran lelu.",
    image: "images/dog-toy.jpg",
    icon: "🎾",
  },
  {
    name: "Kissan täysravinto",
    category: "kissat",
    description: "Maukas ruoka kissan päivittäiseen ruokintaan.",
    image: "images/cat-food.jpg",
    icon: "🐱",
  },
  {
    name: "Kissan herkkupalat",
    category: "kissat",
    description: "Pieni herkku kissan hemmotteluhetkiin.",
    image: "images/cat-food.jpg",
    icon: "🐟",
  },
  {
    name: "Kissan leikkipallo",
    category: "lelut",
    description: "Hauskaa tekemistä ja liikuntaa kissalle.",
    image: "images/cat-toy.jpg",
    icon: "🧶",
  },
  {
    name: "Pehmeä lemmikin peti",
    category: "tarvikkeet",
    description: "Mukava ja pehmeä paikka lemmikin lepohetkiin.",
    image: "images/pet-bed.jpg",
    icon: "🛏️",
  },
  {
    name: "Lemmikin ruokakuppi",
    category: "tarvikkeet",
    description: "Käytännöllinen ruokakuppi jokapäiväiseen käyttöön.",
    image: "images/pet-bed.jpg",
    icon: "🥣",
  },
];

// Suomenkieliset kategoriat.
const categoryNames = {
  koirat: "Koirille",
  kissat: "Kissoille",
  lelut: "Lelut",
  tarvikkeet: "Tarvikkeet",
};

// Haetaan tuotteet API:sta.
async function fetchProducts() {
  statusMessage.textContent = "Haetaan tuotteita...";
  statusMessage.classList.remove("error");

  try {
    // AJAX-pyyntö Fake Store API:lle.
    const response = await fetch(API_URL);

    // Tarkistetaan, onnistuiko pyyntö.
    if (!response.ok) {
      throw new Error("API-pyyntö epäonnistui: " + response.status);
    }

    // Muutetaan vastaus JSON-muotoon.
    const apiProducts = await response.json();

    // Yhdistetään omat esimerkkituotteet API:n hintoihin ja arvosteluihin.
    allProducts = petProducts.map((product, index) => {
      return {
        ...product,
        price: apiProducts[index].price,
        rating: apiProducts[index].rating,
      };
    });

    statusMessage.textContent = "";

    // Näytetään tuotteet.
    filterAndSortProducts();
  } catch (error) {
    statusMessage.textContent =
      "Tuotteiden lataaminen epäonnistui. Yritä myöhemmin uudelleen.";

    statusMessage.classList.add("error");

    console.error("Tuotteiden haussa tapahtui virhe:", error);
  }
}

// Suodatetaan ja järjestetään tuotteet käyttäjän valintojen mukaan.
function filterAndSortProducts() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categorySelect.value;
  const sortValue = sortSelect.value;

  // Suodatetaan tuotteet hakusanan ja kategorian perusteella.
  let filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Järjestetään tuotteet valitun vaihtoehdon mukaan.
  if (sortValue === "low-high") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high-low") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "name") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name, "fi"));
  }

  renderProducts(filteredProducts);
}

// Näytetään tuotteet HTML-sivulla.
function renderProducts(products) {
  productGrid.replaceChildren();

  resultCount.textContent = `Näytetään ${products.length} tuotetta`;

  // Jos hakutuloksia ei löydy.
  if (products.length === 0) {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent = "Tuotteita ei löytynyt. Kokeile toista hakusanaa.";

    productGrid.appendChild(message);
    return;
  }

  // Luodaan jokaisesta tuotteesta oma tuotekortti.
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    // Tuotekuva.
    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image-wrap";

    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";

    // Näytetään emoji, jos käyttäjän lisäämää kuvaa ei löydy.
    image.addEventListener("error", () => {
      image.remove();
      imageWrap.classList.add("image-fallback");

      const fallback = document.createElement("span");
      fallback.className = "fallback-emoji";
      fallback.textContent = product.icon;
      fallback.setAttribute("aria-hidden", "true");

      imageWrap.appendChild(fallback);
    });

    imageWrap.appendChild(image);

    // Tuotteen kategoria.
    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = categoryNames[product.category];

    // Tuotteen nimi.
    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.name;

    // Tuotteen kuvaus.
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;

    // Tuotteen hinta.
    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent =
      Number(product.price).toFixed(2).replace(".", ",") + " €";

    // API:sta saatu arvostelu.
    const rating = document.createElement("span");
    rating.className = "rating";
    rating.textContent = `★ ${product.rating.rate}`;

    bottom.append(price, rating);

    // Lisätään kaikki osat tuotekorttiin.
    card.append(imageWrap, category, title, description, bottom);

    productGrid.appendChild(card);
  });
}

// Tapahtumankäsittelijät lisätään JavaScriptillä.
searchInput.addEventListener("input", filterAndSortProducts);
categorySelect.addEventListener("change", filterAndSortProducts);
sortSelect.addEventListener("change", filterAndSortProducts);

// Käynnistetään API-haku, kun JavaScript latautuu.
fetchProducts();
