/* registration-submit.js
   Standalone JS to submit the form #registrationForm via FormSubmit AJAX.
   Put this file at the end of <body> or wrap in <script>...</script>.
*/

(function () {
  // ==== EDIT THIS: replace with your real email endpoint ====
  const FORM_ENDPOINT = "https://formsubmit.co/coreshikshaacademi21@gmail.com";
  // Example: "https://formsubmit.co/ajax/youremail@example.com"
  // =========================================================

  // Find form and create status element (if not present)
  const form = document.getElementById("registrationForm");
  if (!form) {
    console.error("registration-submit.js: No form with id 'registrationForm' found.");
    return;
  }

  // status div: create if not present
  let statusDiv = document.getElementById("registration-status");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "registration-status";
    // basic inline style so it shows even if CSS isn't present
    statusDiv.style.display = "none";
    statusDiv.style.padding = "10px 12px";
    statusDiv.style.borderRadius = "8px";
    statusDiv.style.marginTop = "12px";
    statusDiv.style.fontWeight = "600";
    form.appendChild(statusDiv);
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.style.display = "block";
    if (type === "success") {
      statusDiv.style.background = "rgba(16,185,129,0.12)";
      statusDiv.style.color = "#0f5132";
      statusDiv.style.border = "1px solid rgba(16,185,129,0.18)";
    } else if (type === "error") {
      statusDiv.style.background = "rgba(239,68,68,0.08)";
      statusDiv.style.color = "#6b021b";
      statusDiv.style.border = "1px solid rgba(239,68,68,0.12)";
    } else { // neutral / info
      statusDiv.style.background = "rgba(255,255,255,0.02)";
      statusDiv.style.color = "#e6eef8";
      statusDiv.style.border = "1px solid rgba(255,255,255,0.03)";
    }
  }

  function hideStatusLater(delay = 8000) {
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, delay);
  }

  // Basic client-side validations (can be extended)
  function validateForm() {
    const fullName = (form.fullName && form.fullName.value || "").trim();
    const mobile = (form.mobile && form.mobile.value || "").trim();
    const course = (form.course && form.course.value) || "";
    const highestQual = (form.highestQualification && form.highestQualification.value) || "";
    const duration = (form.duration && form.duration.value) || "";
    const mode = (form.mode && form.mode.value) || "";
    const photoInput = form.photo;

    if (!fullName) return { ok: false, msg: "Please enter Full Name." };
    if (!/^[0-9]{10}$/.test(mobile)) return { ok: false, msg: "Please enter a valid 10-digit mobile number." };
    if (!course) return { ok: false, msg: "Please select a course." };
    if (!highestQual) return { ok: false, msg: "Please select your highest qualification." };
    if (!duration) return { ok: false, msg: "Please select preferred duration." };
    if (!mode) return { ok: false, msg: "Please select preferred mode (Online/Offline)." };
    if (!photoInput || !photoInput.files || photoInput.files.length === 0) return { ok: false, msg: "Please upload a passport-size photo." };

    return { ok: true };
  }

  // Attach submit handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // validate
    const v = validateForm();
    if (!v.ok) {
      showStatus(v.msg, "error");
      hideStatusLater(6000);
      return;
    }

    // Build FormData (includes files automatically)
    const fd = new FormData(form);

    // Optional: append some meta fields
    fd.append("submissionTime", new Date().toISOString());
    // If you want to include a friendly subject line for email you can:
    // fd.append("_subject", "New Registration: " + (form.fullName.value || "No name"));

    // Show loading
    showStatus("Sending registration — please wait...", "info");

    // Send via fetch to FormSubmit AJAX endpoint
    fetch(FORM_ENDPOINT, {
      method: "POST",
      body: fd,
      headers: {
        "Accept": "application/json"
      }
    })
      .then(async (res) => {
        // parse JSON if possible
        let data = {};
        try { data = await res.json(); } catch (err) { /* ignore parse error */ }

        if (res.ok) {
          // FormSubmit typically returns { success: "..." } on success
          if (data && (data.success || data.message || Object.keys(data).length > 0)) {
            showStatus("Registration submitted successfully! Check your email for confirmation.", "success");
            form.reset();
          } else {
            // `res.ok` but unexpected payload — treat as success but show message
            showStatus("Submitted. If you don't receive email, verify your FormSubmit setup.", "success");
            form.reset();
          }
        } else {
          // Non-2xx
          // Many 4xx/405 errors will be caught here
          let serverMsg = data && (data.message || data.error || JSON.stringify(data)) || res.statusText || ("HTTP " + res.status);
          showStatus("Submission failed: " + serverMsg, "error");
        }
      })
      .catch((err) => {
        console.error("Form submit error:", err);
        showStatus("Submission failed due to network or CORS error. See console for details.", "error");
      })
      .finally(() => {
        hideStatusLater(10000);
      });
  });

  // Helpful console warning if user forgot to set endpoint
  if (FORM_ENDPOINT.includes("YOUR_EMAIL_HERE") || FORM_ENDPOINT.includes("youremail")) {
    console.warn("registration-submit.js: Replace FORM_ENDPOINT with your real FormSubmit AJAX endpoint (https://formsubmit.co/ajax/youremail@example.com).");
    showStatus("⚠️ Set your email in the JS (FORM_ENDPOINT) before using — check console for details.", "error");
    hideStatusLater(8000);
  }
})();
