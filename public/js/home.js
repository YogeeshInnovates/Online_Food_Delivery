const masalaDosaData = [
  { name: "Plain Masala Dosa", price: "$5.99", image: "cow2.jpeg" },
  { name: "Onion Masala Dosa", price: "$6.99", image: "cow2.jpeg" },
  { name: "Paneer Masala Dosa", price: "$7.99", image: "dog1.jpeg" },
  { name: "Mysore Masala Dosa", price: "$8.99", image: "cow2.jpeg" },
  // Add more types as needed
];

// Function to display search results
function displayResults(results) {
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = ""; // Clear previous results
  if (results.length === 0) {
    resultsContainer.textContent = "No results found";
    return;
  }
  // Create a flex container for the search results
  const flexContainer = document.createElement("div");
  flexContainer.classList.add("results-container");
  results.forEach(item => {
    // Create a container for each item
    const resultElement = document.createElement("div");

    // Create an image element
    const imageElement = document.createElement("img");
    imageElement.src = item.image; // Set the src attribute to the image URL
    imageElement.alt = item.name; // Set the alt attribute to the item name
    imageElement.style.width = "100px"; // Set the width of the image (adjust as needed)
    resultElement.appendChild(imageElement); // Append the image to the container

    // Create a paragraph element for the name and price
    const infoElement = document.createElement("p");
    infoElement.textContent = `${item.name} - ${item.price}`;
    resultElement.appendChild(infoElement); // Append the name and price to the container

    // Append the container to the flex container
    flexContainer.appendChild(resultElement);
  });
  // Append the flex container to the results container
  resultsContainer.appendChild(flexContainer);
}
// Function to handle search
function handleSearch() {
  const searchTerm = document.getElementById("searchBar").value.toLowerCase();
  const filteredResults = masalaDosaData.filter(item => item.name.toLowerCase().includes(searchTerm));
  displayResults(filteredResults);
}

// Event listener for search bar
document.getElementById("searchBar").addEventListener("input", handleSearch);
