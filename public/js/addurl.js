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
                alert(res.data.errorMessage);
            } else if (res.data.duplicateMessage) {
                alert(res.data.duplicateMessage);
            } else {
                $('#floatingButtonModal').modal('hide');
            }
        } else {
            alert("Not a valid URL. Please try again!");
        }
        // Reset button and input
        $(this).prop('disabled', false);
        $("#urlTextField").val('');

    });
});


