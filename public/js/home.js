// JavaScript to handle form submission and redirect with roomId
document.getElementById("roomForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get the values of the inputs
    const roomName = document.getElementById("roomName").value;

    // Redirect to /chat.html with roomId as a query parameter
    window.location.href = `/room.html?roomId=${encodeURIComponent(roomName)}`;
  });