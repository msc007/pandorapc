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
            // AXIOS POST REQUEST to subscribe to a product
            subscribeRequest(itemClicked, email);
            // Close modal if subscribed successfully
            $(modalID).modal('hide');
            alert(`Successfully subscirbed to ${itemClicked}`)
        } else {
            alert("Invalid email. Please try again!");
            /*
            console.log("EMAIL IS INVALID");
            $(this).parent().parent().find('.input-group').append('<div class="invalid-feedback">Please fill out this field.</div>');
            */
        }
    });
});

subscribeRequest = async (itemClicked, email) => {
    const res = await axios.post('http://localhost:5000/subscribe', {
        itemName: itemClicked,
        email: email
    });
    console.log(res.status);
    console.log(res.data);
}