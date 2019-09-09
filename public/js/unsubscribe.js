// subscribeButton Listener
$(document).ready(function () {
    // [id=subscribeButton] attribute value selector for handle multiple modal buttons
    $('[id=unsubscribeButton]').on('click', function (e) {
        // prevent multiple submit
        $(this).prop('disabled', true);
        // prevent page from refresh
        e.preventDefault();
        // Get clicked item name
        const itemClicked = $(this).closest('.modal-content').attr('id');
        // Get user email from input text
        const email = $(this).data('email');
        // Get current modalID
        const modalID = '#' + $(this).closest('.modal').attr('id');
        // POST unsubscirbe request
        unsubscribeRequest(itemClicked, email).catch(err => { console.log(err) });
        // Reset button and input
        $(this).prop('disabled', false);
        $(modalID).modal('hide');

    });
});


unsubscribeRequest = async (itemClicked, email) => {
    // Make POST request to add a subscriber for currently clicked item
    const res = await axios.post('http://localhost:5000/items/unsubscribe', {
        itemName: itemClicked,
        email: email
    });
    // Alert message based on the status of subscribe
    if (res.data.isUnsubscribed === false) {
        Swal.fire({
            type: 'success',
            title: `Successfully unsubscribed!`
        });
        // refresh page after successful unsubscribe
        location.reload();
    } else {
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: `Unexpected error occured during unsubscribe: ${itemClicked}.`
        });
    }
}