 //click a button Save 
$(document).on("click", ".btnsave", function() {

  var title = $(this).attr("title");
  var link = $(this).attr("link");
  var snipe = $(this).attr("snipe");
  var newsid = $(this).attr("id");

// Now make an ajax call for the Article
  $.ajax({
    method: "POST",
    url: "/saved",
    data: {
      title: title,
      link: link,
      snipe: snipe,
      newsid: newsid
    }
  })
  .done(function(data){
    window.location = "/scrape";
  })
}); 


$(document).on("click", ".btnscrape", function() {
 // Now make an ajax call for Scraping
  $.ajax({
    method: "GET",
    url: "/scrape",
  })
  .done(function(data){
       window.location = "/scrape";
       $("#modala").modal('show');
  });
}); 


$(".btnmodal").click(function() {
 // $(document).on("click", ".btnmodal", function() {
     $('#NotesArt').empty();
     $('#NotesArt').append('<p>No Notes for this Article yet</p>');

     $('.modal-title').text($(this).data('whatever'));
     $('.imputid').attr('value',$(this).data('id'));
     var id = $(this).data('id');
     console.log(id);
     $.ajax({
       method: "GET",
       url: "/articles/"+id,
     })
     .done(function(data){
       console.log(data);
       if (data.note.title !== undefined){
           $('#NotesArt').empty();
           $('#NotesArt').append("<p>" + data.note.title + "</p>");
           $('#NotesArt').append('<form action="/notes/'+data._id+'" method="post"><button type= "submit" id="' + data._id + '" class="removenote">X</button></form>');
       }   
     })
     .fail(function(jqXHR){
        if(jqXHR.status == 404 || errorThrown == 'Not Found') {
           $('#NotesArt').empty();
           $('#NotesArt').append('<p>No Notes for this Article yet</p>');
        }
     });
     $('#exampleModal').modal('show');
});


$(".btnnote").click(function() {
 // $(document).on("click", ".btnmodal", function() {
     var id = $('.imputid').val();
     console.log(id);
     $.ajax({
       method: "POST",
       url: "/articles/"+id,
       data :{
          title: $('#message-text').val(),
          id: id,
       }
     })
     .done(function(data){
       console.log(data);
       window.location = "/saved"           
     })
     .fail(function(jqXHR){
        if(jqXHR.status == 404 || errorThrown == 'Not Found') {
           $('#NotesArt').append("<p>Error Adding record</p>");
        }
     });
});









