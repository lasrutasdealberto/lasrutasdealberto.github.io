---
---
window.dataLayer = window.dataLayer || [];

function gtag(){
  dataLayer.push(arguments);
}

function reordenarGrande(){
  $('body.ruta #visited-cities').detach().appendTo('body.ruta aside');
  $('body.ruta #external-links').detach().appendTo('body.ruta aside');
  $('body.ruta #social-networks').detach().appendTo('body.ruta aside');
  $('body.ruta #linked-webs').detach().appendTo('body.ruta aside');
}

function reordenarPequeno(){
  var comentarios = $('body.ruta #comments');
  if(comentarios.length){
    $('body.ruta #visited-cities').detach().insertBefore(comentarios);
    $('body.ruta #external-links').detach().insertBefore(comentarios);
  } else {
    $('body.ruta #visited-cities').detach().appendTo('body.ruta div.main');
    $('body.ruta #external-links').detach().appendTo('body.ruta div.main');
  }
  $('body.ruta #social-networks').detach().appendTo('body.ruta div.main');
  $('body.ruta #linked-webs').detach().appendTo('body.ruta div.main');
}

function listenerReordenarElementos(e){
  if (e.matches) {
    reordenarGrande();
  } else {
    reordenarPequeno();
  }
}

function reordenarElementos(){
  var mMedia = window.matchMedia('(min-width: 768px)');
  if(mMedia.matches) reordenarGrande();
  mMedia.addListener(listenerReordenarElementos);
}

/* Para el ajax de cargar el índice suponemos siempre que estamos en la primera página */
/* En otra página se mostrará el pagination y no habrá botón con el evento */
var actualPage = 1; // Esta variable se actualizará cada vez que se le de al botón de cargar
var lastPage = 0;

function loadIndexByAjax(){
  // Si no estamos en la primera página de índice no hacemos nada
  lastPage = $('body.index div.fila').data('last');
  if (lastPage === undefined) { console.log('No es la primera página de índice'); return; }
  
  // Sacamos la última página vista. Si no hay, será la primera.
  var visto = sessionStorage.getItem('visto');
  if (visto === null) { visto = 1; console.log('No habia ninguna sessionstorage. Visto = 1'); }
  else { visto = parseInt(visto); console.log('Si habia sessionstorage. Visto = ' + visto); }
  
  // Cargamos hasta la última página vista sin florituras
  for (var cont = 2; cont <= visto && cont <= lastPage; cont += 1){
    console.log('Estamos en el for de carga preliminar. Cont = ' + cont);
    $.get('page' + cont, function(data){
      var aux = $(data).find('div.fila');
      aux.insertBefore('body.index #ajax-load');
    });
    actualPage += 1;
  } console.log('Salimos del bucle preliminar con un actualPage = ' + actualPage + '. Aquí no es necesario actualizar el sessionstorage');
  
  // Si hemos llegado a la última página deshabilitamos el botón
  if (actualPage >= lastPage) {$('body.index #ajax-load button').attr('disabled', 'disabled').text('No quedan más rutas que mostrar'); console.log('Deshabilitamos el boton antes de ponerle el listener'); return; }
  
  // Si quedan más, ponemos el listener y cargamos los divs con florituras
  $('body.index #ajax-load button').on('click', function(event){
    console.log('Ahora mismo estamos en la pagina ' + actualPage + ' de ' + lastPage);
    console.log('Vamos a hacer el load');
    actualPage += 1;
    $.get('page' + actualPage, function(data){
      var aux = $(data).find('div.fila');
      aux.hide();
      aux.insertBefore('body.index #ajax-load');
      sessionStorage.setItem('visto', actualPage);
      if (actualPage >= lastPage) {$('body.index #ajax-load button').attr('disabled', 'disabled').text('Has llegado al final');console.log('Deshabilitamos el boton despues de ponerle el listener');}
      aux.slideDown('slow');
    });
  });
}

function searchLocalidades(){
  var i;
  $('body.lugares #lugares-search').on('change', function(event){
    var datalist = document.getElementById('lugares-datalist');
    var options = datalist.children;
    for (i = 0; i < options.length; i++) {
      if (options[i].value == this.value) {
        $('body.lugares #grupo-input').removeClass('invalido');
        $('html, body').animate({scrollTop: $("#" + options[i].dataset.slug).offset().top}, 1000);
        return;
      }
    }
    $('body.lugares #grupo-input').addClass('invalido');
  });
}

function sec2text(s){
  var auxh = Math.floor(s/3600);
  var auxm = Math.floor((s-(auxh*3600))/60);
  var auxs = s-(auxh*3600)-(auxm*60);
  
  if (auxh == 0 && auxm == 0 && auxs == 0) return 'cero segundos';
  if (auxh == 0 && auxm == 0 && auxs == 1) return 'un segundo';
  if (auxh == 0 && auxm == 0)              return auxs + ' segundos';
  if (auxh == 0 && auxm == 1 && auxs == 0) return 'un minuto';
  if (auxh == 0 && auxm == 1 && auxs == 1) return 'un minuto y un segundo';
  if (auxh == 0 && auxm == 1)              return 'un minuto y ' + auxs + ' segundos';
  if (auxh == 0 && auxm < 10 && auxs == 0) return auxm + ' minutos';
  if (auxh == 0 && auxm < 10 && auxs == 1) return auxm + ' minutos y un segundo';
  if (auxh == 0 && auxm < 10)              return auxm + ' minutos y ' + auxs + ' segundos';
  if (auxh == 0)                           return auxm + ' minutos';
  if (auxh == 1 && auxm == 0)              return 'una hora';
  if (auxh == 1 && auxm == 1)              return 'una hora y un minuto';
  if (auxh == 1)                           return 'una hora y ' + auxm + ' minutos';
  if (auxm == 0)                           return auxh + ' horas';
  if (auxm == 1)                           return auxh + ' horas y un minuto';
                                           return auxh + ' horas y ' + auxm + ' minutos';
}

function getMapType(){
  var aux = localStorage.getItem("mapType");
  if (aux === null) return "roadmap";
  else return aux;
}

function setMapType(t){
  localStorage.setItem("mapType", t);
}

function getShowWaypoints(){
  if (localStorage.getItem("showWaypoints") == 'N') return false;
  else return true;
}

function setShowWaypoints(t){
  if(t) t='Y';
  else t='N';
  localStorage.setItem("showWaypoints", t);
}

function getMoverMapa(){
  if(localStorage.getItem("moverMapa") == 'N') return false;
  else return true;
}

function setMoverMapa(t){
  if(t) t='Y';
  else t='N';
  localStorage.setItem("moverMapa", t);
}

function getShowPausas(){
  if(localStorage.getItem("showPausas") == 'N') return false;
  else return true;
}

function setShowPausas(t){
  if(t) t='Y';
  else t='N';
  localStorage.setItem("showPausas", t);
}

function getColor(){
  var aux = localStorage.getItem("color");
  if (aux === null) return '#FF0000';
  else return aux;
}

function setColor(t){
  localStorage.setItem("color", t);
}

function getTrazo(){
  var aux = localStorage.getItem("trazo");
  if (aux === null) return 3;
  else return aux;
}

function setTrazo(t){
  localStorage.setItem("trazo", t);
}

function controlWPE(controlDiv, map, waypoints, pausas, linea, e){
  var titulo = document.createElement('strong');
  titulo.appendChild(document.createTextNode('Opciones'));
  controlDiv.appendChild(titulo);
  controlDiv.appendChild(document.createElement('br'));
  var divSinCentrar = document.createElement('div');
  controlDiv.appendChild(divSinCentrar);
  
  if(waypoints.length>0){
    var wl = document.createElement('label');
    var wc = document.createElement('input');
    wc.type = 'checkbox';
    wc.value = 'waypoints';
    if(getShowWaypoints()) wc.checked = 'checked';
    wl.appendChild(wc);
    wl.appendChild(document.createTextNode('Waypoints'));
    divSinCentrar.appendChild(wl);
    divSinCentrar.appendChild(document.createElement('br'));
    
    wc.addEventListener('change', function(){
    setShowWaypoints(wc.checked);
    for(var i=0; i<waypoints.length; i++) waypoints[i].setVisible(wc.checked);
    });
  }

  if(pausas.length>0){
    var pl = document.createElement('label');
    var pc = document.createElement('input');
    pc.type = 'checkbox';
    pc.value = 'pausas';
    if(getShowPausas()) pc.checked = 'checked';
    pl.appendChild(pc);
    pl.appendChild(document.createTextNode('Pausas'));
    divSinCentrar.appendChild(pl);
    divSinCentrar.appendChild(document.createElement('br'));
    
    pc.addEventListener('change', function(){
    setShowPausas(pc.checked);
    for(var i=0; i<pausas.length; i++) pausas[i].setVisible(pc.checked);
    });
  }

  if(e>0){
    var el = document.createElement('label');
    var ec = document.createElement('input');
    ec.type = 'checkbox';
    ec.value = 'autopan';
    if(getMoverMapa()) ec.checked = 'checked';
    el.appendChild(ec);
    el.appendChild(document.createTextNode('Autopan'));
    divSinCentrar.appendChild(el);
    divSinCentrar.appendChild(document.createElement('br'));
  }

  var cp = document.createElement('input');
  cp.type = 'color';
  cp.value = getColor();
  divSinCentrar.appendChild(cp);
  divSinCentrar.appendChild(document.createElement('br'));
  
  var ti = document.createElement('input');
  ti.type = 'range';
  ti.setAttribute('min', '1');
  ti.setAttribute('max', '5');
  ti.value = getTrazo();
  divSinCentrar.appendChild(ti);  
  
  cp.addEventListener('change', function(){
    setColor(cp.value);
    linea.setOptions({strokeColor: cp.value});
  });
  
  ti.addEventListener('change', function(){
    setTrazo(ti.value);
    linea.setOptions({strokeWeight: ti.value});
  });
}

function controlTipoMapa(controlDiv, map){
  var titulo = document.createElement('strong');
  titulo.appendChild(document.createTextNode('Tipo de mapa'));
  controlDiv.appendChild(titulo);
  controlDiv.appendChild(document.createElement('br'));
  
  var opciones = ['Carreteras','Ortofoto','Mixto','Elevación','MTN'];
  var values = ['roadmap','satellite','hybrid','terrain','mtn'];
  var activos = [true,true,true,true,false];
  
  var s = document.createElement('select');
  controlDiv.appendChild(s);
  
  for (var i = 0; i < opciones.length; i++){
    var o = document.createElement('option');
    o.value = values[i];
    if(!activos[i]) o.disabled = 'disabled';
    if(values[i] == getMapType()) o.selected = 'selected';
    o.appendChild(document.createTextNode(opciones[i]));
    s.appendChild(o);
  }
  
  s.addEventListener('change', function(){
    map.setMapTypeId(s.options[s.selectedIndex].value);
  });
}

function zoomToWaypoint(map, button){
  map.setCenter({lat: parseFloat(button.parentNode.dataset.lat), lng: parseFloat(button.parentNode.dataset.lon)});
  map.setZoom(16);
  $('html, body').animate({scrollTop: $("#map").offset().top}, 1000)
}

function shareHandlers(){
  // Estos botones pueden estar en cualquier página
  $('.boton-facebook').on('click', function(e){
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent($(this).parent().data('url')), '_blank', 'width=626,height=436');
  });
  $('.boton-twitter').on('click', function(e){
    window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent($(this).parent().data('url')) + '&text=' + encodeURIComponent($(this).parent().data('title')) + '&via=LasRutasAlberto', '_blank', 'width=550,height=420');
  });
}

function lazyCarousel(){
  // El visor solo está en páginas de ruta, así que añadimos la clase del body
  $('body.ruta #visor-canvas').on('slid.bs.carousel', function(e){
    var este, siguiente, anterior;
    este = $(e.relatedTarget).find('img[data-src]');
    siguiente = $(e.relatedTarget).next().find('img[data-src]');
    anterior = $(e.relatedTarget).prev().find('img[data-src]');
    if(este.length){
      este.attr('src', este.data('src'));
      este.removeAttr('data-src');
    };
    if(siguiente.length){
      siguiente.attr('src', siguiente.data('src'));
      siguiente.removeAttr("data-src");
    };
    if(anterior.length){
      anterior.attr('src', anterior.data('src'));
      anterior.removeAttr('data-src');
    };
  });
}

function thumbsToSlide(){
  $('body.ruta #photo-thumbs img, body.ruta #photos img, body.ruta .waypoint > img').on('click', function(e){
    $("#visor-canvas").carousel($(this).data("slide-to"));
    $('html, body').animate({scrollTop: parseInt($('#visor').offset().top)}, 1000);
  });
}

function linksJournalToWaypoint(){
  $('body.ruta #journal a').on('click', function(e){
    $('html, body').animate({scrollTop: $($(this).attr('href')).offset().top}, 1000);
    e.preventDefault()
  });
}
  

function friendsSoftTransition(){
  $('body.companeros #amigos img').on('click', function(e){
    $('html, body').animate({scrollTop: parseInt($('#' + $(this).data('slug')).offset().top)}, 1000);
  });
}

function activitySoftTransition(){
  $('body.actividades #tipos img').on('click', function(e){
    $('html, body').animate({scrollTop: parseInt($('#cat-' + $(this).data('code')).offset().top)}, 1000);
  });
}

function initMap() {
  var mapid = document.getElementById('map-canvas');
  if (mapid === null) return false;
  
  var head = document.getElementsByTagName('head')[0];
  var insertBefore = head.insertBefore;
  head.insertBefore = function (newElement, referenceElement) {
    if (newElement.href && newElement.href.indexOf('https://fonts.googleapis.com/css?family=Roboto') === 0) {
        console.info('Prevented Roboto from loading!');
        return;
    }
    insertBefore.call(head, newElement, referenceElement);
  };
  
  var map = new google.maps.Map( mapid,
                                { zoom: 0,
                                  center: {lat: 0.0, lng: 0.0},
                                  mapTypeId: getMapType(),
                                  backgroundColor: 'white',
                                  mapTypeControl: false
                                });
  
  //head.insertBefore = insertBefore;
  
  var decodificado = google.maps.geometry.encoding.decodePath(mapid.dataset.linea);
  if (mapid.dataset.circular == "true") decodificado.push(decodificado[0]);
  
  var polilinea = new google.maps.Polyline({
                       path: decodificado,
                       strokeColor: getColor(),
                       strokeOpacity: 1.0,
                       strokeWeight: getTrazo(),
                       clickable: false,
                       map: map });
   
  var limites = new google.maps.LatLngBounds();
  
  for (var n = 0; n < decodificado.length ; n++)
    limites.extend(decodificado[n]);

  if (mapid.dataset.circular == "true"){
    var marcadorInicioFinal = new google.maps.Marker({
                              position: decodificado[0],
                              map: map,
                              zIndex: 5,
                              title: 'Inicio de ' + mapid.dataset.nombre,
                              icon: { url: '/imagenes/markers/sprites.png',
                                      origin: new google.maps.Point(0, Math.floor(26.5 * 72)),
                                      size: new google.maps.Size(22, 26),
                                      scaledSize: new google.maps.Size(22, 1935)} });
  } else {
    var marcadorInicio = new google.maps.Marker({
                              position: decodificado[0],
                              map: map,
                              zIndex: 5,
                              title: 'Inicio de ' + mapid.dataset.nombre,
                              icon: { url: '/imagenes/markers/sprites.png',
                                      origin: new google.maps.Point(0, Math.floor(26.5 * 69)),
                                      size: new google.maps.Size(22, 26),
                                      scaledSize: new google.maps.Size(22, 1935)} });
    
    var marcadorFinal = new google.maps.Marker({
                            position: decodificado[decodificado.length - 1],
                            map: map,
                            zIndex: 4,
                            title: 'Fin de ' + mapid.dataset.nombre,
                            icon: { url: '/imagenes/markers/sprites.png',
                                    origin: new google.maps.Point(0, Math.floor(26.5 * 70)),
                                    size: new google.maps.Size(22, 26),
                                    scaledSize: new google.maps.Size(22, 1935)} });
  }
    
  var mpausas = [];
  var datapausas = JSON.parse(mapid.dataset.pausas);
  for (var p = 0; p < datapausas.n; p++){
    var pausa = new google.maps.Marker({
                           position: { lat: datapausas.lat[p], lng: datapausas.lon[p] },
                           map: map,
                           visible: getShowPausas(),
                           zIndex: 2,
                           title: 'Pausa de ' + sec2text(datapausas.sec[p]),
                           icon: { url: '/imagenes/markers/sprites.png',
                                   origin: new google.maps.Point(0, Math.floor(26.5 * 71)),
                                   size: new google.maps.Size(22, 26),
                                   scaledSize: new google.maps.Size(22, 1935)} });
    pausa.addListener('click', function(){
      var infowindow = new google.maps.InfoWindow({content: this.getTitle()});
      infowindow.open(map, this);
    });
    mpausas.push(pausa);
  }
 
  var mwaypoints = [];
  var waypoints = document.getElementsByClassName('waypoint');
  for (var w = 0; w < waypoints.length; w++) {
    var latlon = {lat: parseFloat(waypoints[w].dataset.lat), lng: parseFloat(waypoints[w].dataset.lon)};
    waypoints[w].getElementsByTagName('button')[0].addEventListener('click', function(){ zoomToWaypoint(map, this); });
    limites.extend(latlon);
    var waypoint = new google.maps.Marker({
                    position: latlon,
                    map: map,
                    visible: getShowWaypoints(),
                    zIndex: 3,
                    title: waypoints[w].dataset.nombre,
                    icon: { url: '/imagenes/markers/sprites.png',
                            origin: new google.maps.Point(0, Math.floor(26.5 * parseInt(waypoints[w].dataset.type))),
                            size: new google.maps.Size(22, 26),
                            scaledSize: new google.maps.Size(22, 1935)} });
    waypoint.orden = w;
    waypoint.addListener('click', function(){
      $('html, body').animate({scrollTop: $("#waypoint-" + this.orden).offset().top}, 1000);
    });
    mwaypoints.push(waypoint);
  }
  
  map.fitBounds(limites);
  
  var dControlWPE = document.createElement('div');
  dControlWPE.className = 'gcontrol';
  var vControlWPE = new controlWPE(dControlWPE, map, mwaypoints, mpausas, polilinea, 0);
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(dControlWPE);
  var dControlTipoMapa = document.createElement('div');
  dControlTipoMapa.className = 'gcontrol';
  var vControlTipoMapa = new controlTipoMapa(dControlTipoMapa, map);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(dControlTipoMapa);

  map.addListener('maptypeid_changed', function(){ setMapType(map.getMapTypeId().toString()); });
}

$(function(){
  loadIndexByAjax(); console.log('loadIndexByAjax');
  
  /* Lanzamos una petición de envío de evento que cuando se cargue la librería de analytics se enviará */
  gtag('js', new Date());
  gtag('config', '{{ site.google.analytics }}'); console.log('gtag');
  
  /* Ponemos el listener de compartir a los botones de twitter y facebook */
  shareHandlers(); console.log('shareHandlers');
  
  /* Ponemos el listener al input de buscar localidades */
  searchLocalidades(); console.log('searchLocalidades');

  /* Hacemos que el visor cargue las fotos antes de verse en vez de cargarlas de golpe */
  lazyCarousel(); console.log('lazyCarousel');
  
  /* Hacemos que pulsar las fotos te lleve directamente al slide que toca */
  thumbsToSlide(); console.log('thumbsToSlide');
  
  /* Hacemos que si en las crónicas hay enlaces a waypoints de esa ruta, la transicion sea suave */
  linksJournalToWaypoint(); console.log('linksJournalToWaypoint');
  
  /* Hacemos que en la foto de amigos, al tocar las imágenes las transiciones sean suaves */
  friendsSoftTransition(); console.log('friendsSoftTransition');
  
  /* Hacemos que en los iconos de actividades, al tocar las imágenes las transiciones sean suaves */
  activitySoftTransition(); console.log('activitySoftTransition');
  
  /* Reordenamos las rutas en caso de que no sea un móvil. ¡SIEMPRE MOBILE FIRST! */
  reordenarElementos(); console.log('reordenarElementos');
  
});
