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
  //Show Add Item panel:
  $('#AddButton').click(function(){
    $('#AddItemPanel').css('display', 'block');
  });
  //Close Add Item panel
  $('.close').click(function(){
    $('#AddItemPanel').css('display', 'none');
    $('#EditItemPanel').css('display', 'none');
    $('#EditForm').trigger('reset');
  });
  //Select Items code:
  $('#SelectItems').click(function(){
    if (selectingItems === false) {
      selectingItems = true;
      $('.indicator').css('display', 'block');
    }
    else {
      selectingItems = false;
      $('.grid-item').each(function(i, obj) {
        $(this).attr('data-selected','false');
          $(this).removeClass('selected');
      });
      selectedItems = new Array();
      $('.indicator').css('display', 'none');
    }
    $(this).toggleClass('activeLink');
  });
  $('.grid-item').click(function(){
    if (selectingItems === true) {
      var selectedItem = $(this).attr('data-inv_id');
      if ($(this).attr('data-selected') === 'false') {
        $(this).toggleClass('selected');
        $(this).attr('data-selected','true');
        selectedItems.push(selectedItem);
      }
      else {
        $(this).toggleClass('selected');
        $(this).attr('data-selected','false');
        selectedItems = jQuery.grep(selectedItems, function(value) {
          return value != selectedItem;
        });
      }
      //console.log($(this).attr('data-selected')); //DEBUG PURPOSES
      //console.log(selectedItems); //DEBUG PURPOSES
    }
    else {
      var inv_id = $(this).attr('data-inv_id');
      var itemName = $(this).children('.name').text();
      var amount = $(this).children('.measurements').children('.amount').text();
      var measurement = $(this).children('.measurements').children('.measurement').text();
      var imageurl = $(this).children('img').attr('src');
      var expirydate = $(this).children('.expirydate').children('.date').text();
      $('[name="invID"]').val(inv_id);
      $('[name="itemName"]').val(itemName);
      $('[name="itemAmount"]').val(amount);
      $('[name="itemMeasurement"]').val(measurement);
      $('[name="itemImage"]').val(imageurl);
      $('[name="itemExpiryDate"]').val(expirydate);
      $('#EditItemPanel').css('display', 'block');
    }
  });
  //Remove items functions:
  $('#RemoveButton').click(function(){
    if (selectingItems === false) {
      alert('Use \'Select Items\' to select items before using this option.');
    }
    else {
      $.ajax({
        url: '/inventory/remove',
        type: 'POST',
        cache: false,
        data: {
          ids: selectedItems
        },
        success: function(data){
          if (data === true) {
            alert('Items successfully deleted. Refreshing page')
            goTo('/inventory/refresh');
          }
          else {
            alert('Something went wrong. Refresh and try again')
          }
        },
        error: function(jqXHR, textStatus, err){
               alert('text status '+textStatus+', err '+err)
             }
      });
    }
  });
  //Find Recipes with selected items:
  $('#FindRecipesButton').click(function(){
    if (selectingItems === false) {
      alert('Use \'Select Items\' to select items before using this option.');
    }
    else {
      $.ajax({
        url: '/recipes/find',
        type: 'POST',
        cache: false,
        data: {
          ids: selectedItems
        },
        success: function(data){
          if (data) {
            console.log('Respond received:');
            console.log(data);
            //goTo('/inventory/refresh');
          }
          else {
            alert('Something went wrong. Refresh and try again')
          }
        },
        error: function(jqXHR, textStatus, err){
               alert('text status '+textStatus+', err '+err)
             }
      });
    }
  });
  // init Isotope (used for filtering)
  var $grid = $('.inventory-grid').isotope({
    itemSelector: '.grid-item',
    layoutMode: 'fitRows'
  });

  $('.stat-block').click(function(){
    console.log('stat block clicked');
    if ($(this).hasClass('total')) {
      console.log('expiring block clicked');
      $grid.isotope({ filter: ''});
    }
    if ($(this).hasClass('expiring')) {
      console.log('expiring block clicked');
      $grid.isotope({ filter: '.expiring'});
    }
    if ($(this).hasClass('expired')) {
      console.log('expired block clicked');
      $grid.isotope({ filter: '.expired'});
    }
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onmousedown = function(event) {
    if (event.target == document.getElementById("AddItemPanel")) {
      $('#AddItemPanel').css('display', 'none');
      $('#AddForm').trigger('reset');
      $('#EditForm').trigger('reset');
    }
    if (event.target == document.getElementById("EditItemPanel")) {
      $('#EditItemPanel').css('display', 'none');
      $('#EditForm').trigger('reset');
      $('#AddForm').trigger('reset');
    }
  }
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
    if (days < 0) {
      expiredItems++;
      $(this).addClass('expired');
    }
    else if (days <= 7) {
      expiringItems++;
      $(this).addClass('expiring');
    }
  });
  $("#expiringItems").html(expiringItems);
  $("#expiredItems").html(expiredItems);
}
