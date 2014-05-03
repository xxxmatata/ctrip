$(function() {
    $(".comlist h2").click(function(){
    	$(this).toggleClass("showol");
    	$(this).next("ol").toggleClass("olshow");
    });
});