
// tyo css matrai bhanda yo ramro lagyo dropdown ko lagi
function toggleMenu() {
      document.getElementById('menu').classList.toggle('active');
    }
   
  function closeAd() {
      document.getElementById("adPopup").style.display = "none";
    }

   
    window.onload = function() {
      document.getElementById("adPopup").style.display = "flex";
    };
    
var slideIndex = 0;

function carousel() {
  var i;
  var x = document.querySelectorAll("#slider img"); 
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > x.length) { slideIndex = 1; }
  x[slideIndex - 1].style.display = "block";
  setTimeout(carousel, 2000);
}
carousel();
