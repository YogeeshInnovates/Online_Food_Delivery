function filterRestaurants() {
    var input, filter, restaurants, restaurantCards, restaurantName, i, txtValue;
    input = document.getElementById('searchInput');
    filter = input.value.toUpperCase();
    restaurants = document.getElementById('restaurantList');
    restaurantCards = restaurants.getElementsByClassName('col-md-4');

    for (i = 0; i < restaurantCards.length; i++) {
        restaurantName = restaurantCards[i].getElementsByTagName('h3')[0];
        txtValue = restaurantName.textContent || restaurantName.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            restaurantCards[i].style.display = '';
        } else {
            restaurantCards[i].style.display = 'none';
        }
    }
}