// subscribeButton Listener
$(document).ready(function () {
    $('#subscribeButton').on('click', function (e) {
        // prevent page from refresh
        e.preventDefault();

        // AXIOS POST REQUEST
        subscribeRequest();

        // Close modal if subscribed successfully
        $('#subscribeModal').modal('hide');
    });
});


subscribeRequest = async () => {
    const res = await axios.post('http://localhost:5000/subscribe');
    console.log(res.status);
    console.log(res.data);
}