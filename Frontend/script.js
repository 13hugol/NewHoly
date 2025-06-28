
function toggleMenu() {
      document.getElementById('menu').classList.toggle('active');
    }
  function closeAd() {
      document.getElementById("adPopup").style.display = "none";
    }

    // Auto show popup on page load
    window.onload = function() {
      document.getElementById("adPopup").style.display = "flex";
    };