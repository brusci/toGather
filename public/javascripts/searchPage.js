   
alert(<%- posts %>);
   /* var posts = <%- posts %>;
    var searchlatlng = <%- searchlatlng %>;
    var slatlng = searchlatlng.substring(1, searchlatlng.length-1);
    var searchArr = slatlng.split(", ");
    
    alert(slatlng);
    
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      //center: new google.maps.LatLng(43.6548988, -79.39661610000002),
      center: new google.maps.LatLng(searchArr[0], searchArr[1]),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    var infowindow = new google.maps.InfoWindow();

    var marker, i;

    for (i = 0; i < posts.length; i++) { 
        var latlng = posts[i].latlng.substring(1, posts[i].latlng.length-1);
        var arr = latlng.split(", ");
        var url = encodeURI('/u/' + posts[i].name + '/' + posts[i].time.day + '/' + posts[i].title + '/' + posts[i].loc + '/' + posts[i].partyDate);
 
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(arr[0], arr[1]),
            map: map
        });

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent("<a href='"+url+"'>"+posts[i].title+'</a><br/><p>'+posts[i].loc+'</p><br/><p>'+posts[i].partyDate+'</p><br/>'
            );

            infowindow.open(map, marker);
            }
        })(marker, i));
    }
   
  */
