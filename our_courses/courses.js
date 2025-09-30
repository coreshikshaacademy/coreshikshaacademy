// Function to show/hide extra content
function toggleContent(id) {
  var content = document.getElementById(id);

  if (content.style.display === "block") {
    content.style.display = "none";
  } else {
    content.style.display = "block";
  }
}
