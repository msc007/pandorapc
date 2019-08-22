// subscribeButton Listener
$(document).ready(function () {
    // [id=subscribeButton] attribute value selector for handle multiple modal buttons
    $('[id=subscribeButton]').on('click', function (e) {
        // prevent page from refresh
        e.preventDefault();
        // Get clicked item name
        const itemClicked = $(this).closest('.modal-content').attr('id');
        // Get user email from input text
        const email = $(this).closest('.modal-content').find('input').val();
        // Get current modalID
        const modalID = '#' + $(this).closest('.modal').attr('id');

        // Validate email format
        if (validator.isEmail(email) && !validator.isEmpty(email)) {
            // AXIOS POST request to subscribe to a product
            const isSubscribed = subscribeRequest(itemClicked, email);
            // Close modal if subscribed successfully
            $(modalID).modal('hide');
        } else {
            alert("Invalid email. Please try again!");
        }
    });
});

subscribeRequest = async (itemClicked, email) => {
    // Make POST request to add a subscriber for currently clicked item
    const res = await axios.post('http://localhost:5000/subscribe', {
        itemName: itemClicked,
        email: email
    });

    // Alert message based on the status of subscribe
    if(res.data.isSubscribed) {
        alert(`Your email is already subscribed to ${itemClicked}.`);
    } else {
        alert(`Successfully subscribed to ${itemClicked}.`);
    }
}