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
    $('#UseItemPanel').css('display', 'none');
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
      var selectedItem = $(this).attr('data-recipe_id');
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
      console.log($(this).attr('data-selected')); //DEBUG PURPOSES
      console.log(selectedItems); //DEBUG PURPOSES
    }
    else {
      var recipe_id = $(this).attr('data-recipe_id');
      var user_id = $(this).attr('data-author_id');
      var title = $(this).attr('data-name');
      var source = $(this).children('.source').text();
      var url = $(this).attr('data-url');
      var imageurl = $(this).children('img').attr('src');
      var ingredients = $(this).children('.ingredients');
      $('.recipeTitle').text(title);
      $('.recipeSource').text(source);
      $('.recipeLink').attr('href', url);
      $('.recipeImage').attr('src', imageurl);
      $('#UseItemPanel').css('display', 'block');

      $.ajax({
      url: '/recipes/use',
      type: 'POST',
      cache: false,
      data: {
        recipe_id: recipe_id,
        user_id: user_id
      },
      success: function(data){
        if (ingredients) {
          for(ingredient in ingredients) {
            
          }
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
  //Remove items functions:
  $('#RemoveButton').click(function(){
    if (selectingItems === false) {
      alert('Use \'Select Items\' to select items before using this option.');
    }
    else {
      $.ajax({
        url: '/recipes/remove',
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

  //Add Recipe FORM:
  $('.addIngredient').click(function(){
    var input = $('#addItemTemplate').html();
    jQuery('.ingredients').append(input);
    $('.removeIngredient').bind("click", function(e) {
      $(e.target).closest(".ingredient").remove();
    });
  });

  //Use Recipe FORM:
  $('.addIngredient').click(function(){
    var input = $('#addItemTemplate').html();
    jQuery('.ingredients').append(input);
    $('.removeIngredient').bind("click", function(e) {
      $(e.target).closest(".ingredient").remove();
    });
  });




  // init Isotope (used for filtering)
  var $grid = $('.recipe-grid').isotope({
    itemSelector: '.grid-item',
    layoutMode: 'fitRows'
  });

  $('.stat-block').click(function(){
    console.log('stat block clicked');
    if ($(this).hasClass('total')) {
      console.log('expiring block clicked');
      $grid.isotope({ filter: ''});
    }
    if ($(this).hasClass('myRecipes')) {
      console.log('expiring block clicked');
      $grid.isotope({ filter: '.myRecipe'});
    }
    if ($(this).hasClass('officialRecipes')) {
      console.log('expired block clicked');
      $grid.isotope({ filter: '.officialRecipe'});
    }
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onmousedown = function(event) {
    if (event.target == document.getElementById("AddItemPanel")) {
      $('#AddItemPanel').css('display', 'none');
      $('#AddForm').trigger('reset');
    }
    if (event.target == document.getElementById("EditItemPanel")) {
      $('#UseItemPanel').css('display', 'none');
      $('#AddForm').trigger('reset');
    }
  }
});

function inputIngredients(recipe_id, user_id) {
  $.ajax({
  url: '/recipes/use',
  type: 'POST',
  cache: false,
  data: {
    recipe_id: recipe_id,
    user_id: user_id
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

window.onbeforeunload = confirmExit;
  function confirmExit()
  {
    if(changesMade === true) return "Do you want to leave this page without saving?";
  }

function updateStatisticCards () {
  myRecipes = 0;
  officialRecipes = 0;
  $('.grid-item').each(function(i, obj) {
    var author_id = $(this).attr('data-author_id');
    if (author_id == 1) {
      officialRecipes++;
      $(this).addClass('officialRecipe');
    }
    else {
      myRecipes++;
      $(this).addClass('myRecipe');
    }
  });
  $("#officialRecipes").html(officialRecipes);
  $("#myRecipes").html(myRecipes);
}
