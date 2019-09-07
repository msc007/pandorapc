// subscribeButton Listener
$(document).ready(function () {
    $('#urlSaveButton').on('click', function (e) {
        // prevent page from refresh
        e.preventDefault();
        const url = $("#urlTextField").val();

        if (validator.isURL(url)) {
            console.log(url);
        } else {
            console.log("Not a valid URL");
        }
    });
});


