var changesMade;
var expiringItems;
var expiredItems;

$( document ).ready(function() {
  updateStatisticCards();
});

//Selecting Items
var selectingItems = false;
var selectedItems = new Array();
$(document).ready(function() {
  $('#SelectItems').click(function(){
    if (selectingItems === false)
      selectingItems = true;
    else
      selectingItems = false;
    $(this).toggleClass('activeLink');
  });
  $('.grid-item').click(function(){
    if (selectingItems === true) {
      var selectedItem = $(this).attr('data-inv_id');
      if ($(this).attr('data-selected') === 'false') {
        $(this).attr('data-selected','true');
        selectedItems.push(selectedItem);
      }
      else {
          $(this).attr('data-selected','false');
          selectedItems = jQuery.grep(selectedItems, function(value) {
            return value != selectedItem;
          });
      }
      console.log($(this).attr('data-selected'));
      console.log(selectedItems);
    }
  });
});


window.onbeforeunload = confirmExit;
  function confirmExit()
  {
    if(changesMade === true) return "Do you want to leave this page without saving?";
  }

function updateStatisticCards () {
  expiringItems = 0;
  expiredItems = 0;
  $('.grid-item').each(function(i, obj) {
    var expiry = new Date($(this).attr('expirydate').split("-"));
    var date = new Date();
    var msPerDay = 1000 * 60 * 60 * 24;
    var msBetween = expiry.getTime() - date.getTime();
    var days = msBetween / msPerDay;

    //Round Down
    var days = Math.round((expiry-date)/(1000*60*60*24));
    if (days <= 7) {
      expiringItems++;
    }
    if (days < 0) {
      expiredItems++;
    }
  });
  $("#expiringItems").html(expiringItems);
  $("#expiredItems").html(expiredItems);
}

$('.grid').isotope({
  // options
  itemSelector: '.grid-item',
  layoutMode: 'fitRows'
});
