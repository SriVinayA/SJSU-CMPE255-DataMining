let currentPage = 1;  // Initializing a variable to keep track of the current page

document.getElementById('search-button').addEventListener('click', function() {
    currentPage = 1;  // Reset the page when doing a new search
    searchForRecipes();
});

document.getElementById('search-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        currentPage = 1;  // Reset the page when doing a new search
        searchForRecipes();
    }
});

document.getElementById('load-more').addEventListener('click', function() {
    currentPage++;  // Increment the page count
    searchForRecipes();
});

function sanitizeText(text) {
    const tempElement = document.createElement('div');
    tempElement.textContent = text;
    return tempElement.innerHTML;
}

function searchForRecipes() {
    const searchInputValue = document.getElementById('search-input').value.trim();
    const resultsGrid = document.getElementById('results-grid');
    const loader = document.getElementById('loader');
    const loadMoreButton = document.getElementById('load-more');

    resultsGrid.setAttribute('aria-live', 'polite');

    if (!searchInputValue) {
        resultsGrid.innerHTML = '<p>Please enter a recipe name.</p>';
        loadMoreButton.style.display = 'none';
        return;
    }

    const params = new URLSearchParams();
    params.append('s', searchInputValue);
    params.append('page', currentPage);  // Assuming the API accepts a "page" parameter
    const searchURL = 'https://www.themealdb.com/api/json/v1/1/search.php?' + params.toString();

    loader.removeAttribute('hidden');
    if (currentPage === 1) {
        resultsGrid.innerHTML = '';  // Only clear the results grid on the first page
    }

    fetch(searchURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            loader.setAttribute('hidden', true);

            if (!data.meals || !Array.isArray(data.meals) || !data.meals.length) {
                resultsGrid.innerHTML += '<p>No more recipes found for the given query.</p>';
                loadMoreButton.style.display = 'none';  // Hide the button if no more results
                return;
            }

            // Display the "Load More" button if there are results
            loadMoreButton.style.display = 'block';

            data.meals.forEach(meal => {
                if (meal.strMeal && meal.strMealThumb && meal.strInstructions && meal.strSourceURL) {
                    const gridItem = document.createElement('div');
                    gridItem.className = 'grid-item';

                    const img = document.createElement('img');
                    img.src = sanitizeText(meal.strMealThumb);
                    img.alt = `Image of ${sanitizeText(meal.strMeal)}`;
                    img.loading = "lazy";  // Lazy load images
                    gridItem.appendChild(img);

                    const h2 = document.createElement('h2');
                    h2.textContent = sanitizeText(meal.strMeal);
                    gridItem.appendChild(h2);

                    const p = document.createElement('p');
                    const instructions = sanitizeText(meal.strInstructions).substring(0, 100) + '...';  // Display the first 100 characters of the instructions
                    p.textContent = instructions;
                    gridItem.appendChild(p);

                    const a = document.createElement('a');
                    a.href = sanitizeText(meal.strSourceURL); // Use the original recipe URL here
                    a.textContent = 'Read More';
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer'; // for security reasons when using target="_blank"
                    gridItem.appendChild(a);

                    resultsGrid.appendChild(gridItem);
                }
            });
        })
        .catch(error => {
            loader.setAttribute('hidden', true);
            resultsGrid.innerHTML += '<p>An error occurred while fetching recipes. Please try again later.</p>';
            console.error('Error fetching recipes:', error);
            loadMoreButton.style.display = 'none';  // Hide the button if an error occurs
        });
}
