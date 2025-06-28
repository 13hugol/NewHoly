
// tyo css matrai bhanda yo ramro lagyo dropdown ko lagi
function toggleMenu() {
      document.getElementById('menu').classList.toggle('active');
    }
    // ad banda garne cross button
  function closeAd() {
      document.getElementById("adPopup").style.display = "none";
    }

    // page load hune bitekai popup aauxa
    window.onload = function() {
      document.getElementById("adPopup").style.display = "flex";
    };