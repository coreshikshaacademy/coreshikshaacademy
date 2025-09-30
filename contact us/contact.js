document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector(".contact-form");
    if (!contactForm) {
      console.error("Contact form NOT found on page");
      return;
    }

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitButton = contactForm.querySelector('input[type="submit"]');
      submitButton.disabled = true;
      submitButton.value = "Sending...";

      const formData = {
        name: contactForm.name.value.trim(),
        email: contactForm.email.value.trim(),
        phone: contactForm.phone.value.trim(),
        subject: contactForm.subject.value.trim(),
        message: contactForm.message.value.trim(),
      };

      try {
                const response = await fetch('api/contact.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.msg || 'Message sent successfully! We will get back to you soon.');
          contactForm.reset();
        } else {
          alert(result.msg || 'Failed to send message. Please try again.');
        }
      } catch (err) {
        console.error("Contact form submission error:", err);
        alert("A network error occurred. Please try again later.");
      } finally {
        submitButton.disabled = false;
        submitButton.value = "Send Message";
      }
    });
});