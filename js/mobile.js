$('.fa.fa-bars').click(function(){
  if($(".mobile_main_nav").css("display") == "block"){
    $(".mobile_main_nav").slideUp("slow");
  }
  else if($(".mobile_main_nav").css("display") == "none"){
    $(".mobile_main_nav").slideDown("slow");
  }
});
