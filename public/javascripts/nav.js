function goTo(page) {
  location.href= page;
}

const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('nav_links')[0]

$(document).ready(function() {
    $('.toggle-button').click(function(){
        $('.nav_links').toggleClass('active');
    });
});
