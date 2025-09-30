// Toggle details on circle or content click
document.addEventListener('DOMContentLoaded', function () {
  var circles = document.querySelectorAll('.step-circle');
  circles.forEach(function(circle) {
    circle.addEventListener('click', function (e) {
      var item = circle.closest('.timeline-item');
      if (!item) return;
      var detail = item.querySelector('.detail');
      if (!detail) return;

      // close other details
      document.querySelectorAll('.detail.open').forEach(function(d) {
        if (d !== detail) d.classList.remove('open');
      });

      // toggle this
      detail.classList.toggle('open');
    });
  });

  // Also allow clicking the content header to toggle
  var heads = document.querySelectorAll('.step-head');
  heads.forEach(function(h) {
    h.addEventListener('click', function () {
      var detail = h.closest('.content').querySelector('.detail');
      if (!detail) return;
      document.querySelectorAll('.detail.open').forEach(function(d) {
        if (d !== detail) d.classList.remove('open');
      });
      detail.classList.toggle('open');
    });
  });
});
