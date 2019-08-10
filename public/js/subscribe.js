// subscribeButton Listener
$(document).ready(function () {
    // [id=subscribeButton] attribute value selector for handle multiple modal buttons
    $('[id=subscribeButton]').on('click', function (e) {
        // prevent page from refresh
        e.preventDefault();


        // Get clicked item name
        const itemClicked = $(this).closest('.modal-content').attr('id');
        // Get user email from input text
        const email = $(this).parent().parent().find('input').val();

        //TODO: Email Validation need to be perform before axios request

        // AXIOS POST REQUEST to subscribe to a product
        subscribeRequest(itemClicked, email);


        // Close modal if subscribed successfully
        let modalID = '#' + $(this).closest('.modal').attr('id');
        $(modalID).modal('hide');
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