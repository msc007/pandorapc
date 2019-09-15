// subscribeButton Listener
$(document).ready(function () {
    $('#urlSaveButton').on('click', async function (e) {
        // prevent multiple submit
        $(this).prop('disabled', true);
        // prevent page from refresh
        e.preventDefault();

        const url = $("#urlTextField").val();

        if (validator.isURL(url)) {
            const res = await axios.post('http://localhost:5000/items/addURL', {
                url: url
            });

            if (res.data.errorMessage) {
                // Alert error message
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: res.data.errorMessage,
                    heightAuto: false
                });
            } else if (res.data.duplicateMessage) {
                // Alert duplicate error message
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: res.data.duplicateMessage,
                    heightAuto: false
                });
            } else {
                Swal.fire({
                    type: 'success',
                    title: 'Successfully added the URL!',
                    heightAuto: false
                });
                $('#floatingButtonModal').modal('hide');
            }
        } else {
            // Alert invalid URL error message
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Not a vlid URL. Please try again!',
                heightAuto: false
            });
        }
        // Reset button and input
        $(this).prop('disabled', false);
        $("#urlTextField").val('');

    });
});
