// subscribeButton Listener
$(document).ready(function () {
    // [id=subscribeButton] attribute value selector for handle multiple modal buttons
    $('[id=subscribeButton]').on('click', function (e) {
        // prevent multiple submit
        $(this).prop('disabled', true);
        // prevent page from refresh
        e.preventDefault();
        // Get clicked item name
        const itemClicked = $(this).data('item');
        // Get user email from input text
        const email = $(this).closest('.modal-content').find('input').val();
        // Get current modalID
        const modalID = '#' + $(this).closest('.modal').attr('id');

        // Validate email format
        if (validator.isEmail(email) && !validator.isEmpty(email)) {
            // AXIOS POST request to subscribe to a product
            subscribeRequest(itemClicked, email).catch(err => { console.log(err) });
            // Close modal if subscribed successfully
            $(modalID).modal('hide');
        } else {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Invalid email. Please try again!',
                heightAuto: false
            });
        }
        // Reset button and input
        $(this).prop('disabled', false);
        $(this).closest('.modal-content').find('input').val('');
    });


    // Subscribe handler for loggedin user
    $('[id=loggedinSubscribeButton]').on('click', function (e) {
        console.log("LOGGEDIN SUBSCRIBE BUTTON CLICKED");
        // prevent multiple submit
        $(this).prop('disabled', true);
        // prevent page from refresh
        e.preventDefault();
        // Get clicked item name
        const itemClicked = $(this).data('item');
        // Get user email from input text
        const email = $(this).data('email');
        // Post subscribe request
        subscribeRequest(itemClicked, email).catch(err => { console.log(err) });
        // Reset button and input
        $(this).prop('disabled', false);
    });
});

subscribeRequest = async (itemClicked, email) => {
    // Make POST request to add a subscriber for currently clicked item
    const res = await axios.post('http://localhost:5000/items/subscribe', {
        itemName: itemClicked,
        email: email
    }).catch(err => console.log(err));

    // Alert message based on the status of subscribe
    if (res.data.isSubscribed) {
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: `Your email is already subscribed to ${itemClicked}.`,
            heightAuto: false
        });
    } else {
        Swal.fire({
            type: 'success',
            title: `Successfully subscribed to ${itemClicked}.`,
            heightAuto: false
        });
    }
}