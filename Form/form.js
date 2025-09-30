// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
    // Get the class dropdown and stream section elements
    const classSelect = document.getElementById("class");
    const streamSection = document.getElementById("stream-section");

    // Listen for changes in the class dropdown
    classSelect.addEventListener("change", () => {
        const selectedValue = classSelect.value;

        // Show the stream section if "11th" or "12th" is selected, otherwise hide it
        if (selectedValue === "11" || selectedValue === "12") {
            streamSection.style.display = "block";
        } else {
            streamSection.style.display = "none";
        }
    });

    // Optional: Initialize the stream section as hidden (in case of a refresh)
    streamSection.style.display = "none";
});
