/*
 * Variables globales
 * Válidas para guardar valores de búsqueda en el mapa general, paginaciones, posiciones en el mapa y cosillas del Google Tag Manager
 */

  // El prefijo de los nodos SVG 
var ns = 'http://www.w3.org/2000/svg';

  // Variables del Tag Manager
window.dataLayer = window.dataLayer || [];

  // Variables de paginación del ínidice
var actualPage = 1;
var lastPage = 0;

//var map; // Vamos a suponer que no se ven más de un mapa a la vez...
         // Esto es una gorrinada. Pero más sencillo que ponerse a hacer closures
         // para pasarlo como parámetro a los eventos.

  // Variables de filtro del mapa general
var autopan;
var valencia;
var polilineas;
var g_anyomin, g_anyomax, g_ibpmin, g_ibpmax, g_desnivelmin, g_desnivelmax, g_tiempomin, g_tiempomax;
     

     



/*
 * Crear un SVG para el mapa global y las páginas de rutas
 * Funciones generales y auxiliares
 */

/* 
 * Para hacer el SVG se necesita
 * 
 * En primer lugar, saber el punto de máxima altitud, y el punto de mínima altitud.
 * Si están los cuatrocientos puntos, la elevación será completa, si no, tendremos que hacer medias.
 * lo malo será mostrar el punto en el mapa cuando visualicemos la ruta. Más adelante miraremos.
 * Para empezar, solo mostrar una línea nos vale. Ya veremos de poner metros.
 */

function puntoMinimoyMaximo(alturas){
  var min, max, i;
  min = max = alturas[0];
  for (i = 0; i < alturas.length; i++){
    if (alturas[i] < min) min = alturas[i];
    if (alturas[i] > max) max = alturas[i];
  }
  return [min, max];
}

/* Esta función está en obras */

function crearElevacion(donde, datos, alto, ancho, extra){
  var minmax;
  var listapuntos = ancho + ","+ alto + " 0," + alto + " ";
  minmax = puntoMinimoyMaximo(datos);
  
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttributeNS(null, 'height', "100%");
  svg.setAttributeNS(null, 'width', "100%");
  svg.setAttributeNS(null, 'viewBox', "0 0 " + ancho + " " + alto);
  svg.setAttributeNS(null, 'preserveAspectRatio', "none");
  donde.appendChild(svg);
  
  var r = document.createElementNS(ns, 'rect');
  r.setAttributeNS(null, 'x', '0');
  r.setAttributeNS(null, 'y', '0');
  r.setAttributeNS(null, 'width', ancho);
  r.setAttributeNS(null, 'height', alto);
  r.setAttributeNS(null, 'style', 'fill:blue;');
  svg.appendChild(r);
  
  var p = document.createElementNS(ns, 'polygon');
  
  var rango = minmax[1]-minmax[0];
   
  for( var i = 0; i<datos.length; i++){
    listapuntos += i+","+  Math.floor(((datos[i]-minmax[0])*alto)/rango)  +" ";
  }
  
  p.setAttributeNS(null, 'points', listapuntos);
  svg.appendChild(p);
  return svg;
}





/*
 * Esta función se encarga de llamar a la que crea el SVG con los parámetros adecuados,
 * porque para mostrarla en el mapa global se llamará desde el handler de clicar la polilinea.
 */

function mostrarElevacion(){
  var datos = document.getElementById('map-canvas');
  if(datos == null) {console.log("No es una ruta"); return;}
  var lista = JSON.parse(datos.dataset.ele);
  crearElevacion('elevation-canvas', lista.ele, 150, lista.ele.length, 0);
}





/*
 * Esta función será el handler que verá los onmouse sobre el div del perfil y sacaremos las
 * coordenadas hacia donde se moverá el mapa.
 */


function handlerMoverMapaSegunPerfil(div, datos, mapa, marker) {
  div.addEventListener('mousemove', function(e) {
    if(e.offsetX >= 400) return false;
    var movera = new google.maps.LatLng(datos.lat[e.offsetX], datos.lon[e.offsetX]);
    marker.setPosition(movera);
    if (autopan){
      if(!mapa.getBounds().contains(movera)) mapa.panTo(movera);
    }
  }, false);
  
  div.addEventListener('mouseleave', function(e){
    marker.setVisible(false);
  }, false);
  
  div.addEventListener('mouseover', function(e){
    marker.setVisible(true);
  }, false);
  
}


function moverMapaSegunPerfil(event){
  console.log(event.offsetX + " " + event.offsetY);
  console.log("HOLA!!!");
}




/*
 * Esta función es del Google Tag Manager y por ahora no la vamos a usar.
 * En un futuro además de ver quién entra a qué página, podremos ver si usan
 * ciertas funcionalidades, como ver fotos, usar el mapa general, etc.
 */

function gtag(){
  dataLayer.push(arguments);
}






/*
 * Las siguientes funciones reorganizan ciertos elementos del layout rutas
 * dependiendo del tamaño de pantalla, y activa los listeners para mover la
 * ruta si pulsamos fotos, etc.
 */

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






/* 
 * La siguiente función carga la página principal para dejarla con el máximo numero
 * de rutas que hayamos visto por el momento.
 */

function getVisto() {
  var ca = document.cookie.split(';');
  for(var i=0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1, c.length);
    if (c.indexOf('visto=') == 0) return parseInt(c.substring('visto='.length, c.length));
  }
  return 1;
}

/* Para el ajax de cargar el índice suponemos siempre que estamos en la primera página */
/* En otra página se mostrará el pagination y no habrá botón con el evento */

function loadIndexByAjax(){
  // Si no estamos en la primera página de índice no hacemos nada
  lastPage = $('body.index div.fila').data('last');
  if (lastPage === undefined) return;
  
  // Sacamos la última página vista. Si no hay, será la primera.
  var visto = getVisto();
  
  // Cargamos hasta la última página vista sin florituras
  for (var cont = 2; cont <= visto && cont <= lastPage; cont += 1){
    $.get('page' + cont, function(data){
      $(data).find('div.fila article').appendTo('div.fila');
    });
    actualPage += 1;
  }
  
  // Si hemos llegado a la última página deshabilitamos el botón
  if (actualPage >= lastPage){
    $('body.index #ajax-load button').attr('disabled', 'disabled').text('No quedan más rutas que mostrar');
    return;
  }
  
  // Si quedan más, ponemos el listener para cargar los articles con florituras
  $('body.index #ajax-load button').on('click', function(event){
    actualPage += 1;
    $.get('page' + actualPage, function(data){
      var aux = $(data).find('div.fila article');
      aux.hide();
      aux.appendTo('div.fila');
      document.cookie = 'visto=' + actualPage;
      if (actualPage >= lastPage) $('body.index #ajax-load button').attr('disabled', 'disabled').text('Has llegado al final');
      aux.fadeIn(2000);
    });
  });
}





/*
 * Función helper para que el buscador de localidades funcione
 */

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





/*
 * Función auxiliar para convertir segundos en un texto razonable
 */

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





/*
 * Funciones para cargar del localStorage las preferencias de visualización de los mapas
 */

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






/*
 * Funcion que crea el cuadro de control para visualizar waypoints, pausas y trazos en las rutas
 */

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
    if(getMoverMapa()) {
      ec.checked = 'checked';
      autopan = true;
    } else {
      autopan = false;
    }
    el.appendChild(ec);
    el.appendChild(document.createTextNode('Autopan'));
    divSinCentrar.appendChild(el);
    divSinCentrar.appendChild(document.createElement('br'));
    
    ec.addEventListener('change', function(){
      setMoverMapa(ec.checked);
      autopan=ec.checked;
    });
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

/*
 * Funcion que muestra un desplegable para seleccionar el tipo de mapa
 */

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






/*
 * Las siguientes funciones son propias del mapa general
 */

/*
 * Esta funcion recalcula qué se muestra cuando se filtra en el mapa
 */

function recalcular(map){
  var i;
  var l = polilineas.length;
  for (i = 0; i < l; i++){
    if(polilineas[i].anyo >= g_anyomin && polilineas[i].anyo <= g_anyomax &&
       polilineas[i].ibp >= g_ibpmin && polilineas[i].ibp <= g_ibpmax &&
       polilineas[i].desnivel >= g_desnivelmin && polilineas[i].desnivel <= g_desnivelmax) polilineas[i].setMap(map);
    else polilineas[i].setMap(null);
  }
}

/*
 * Función que muestra el div de filtrar por desnivel
 */

function controlDesnivel(controlDiv, map){
  var desnivel, titulo, selectmin, selectmax, opcion;
  g_desnivelmin = 0;
  g_desnivelmax = 2500;
  selectmin = document.createElement('select');
  for (desnivel = g_desnivelmin; desnivel <= g_desnivelmax; desnivel+=250){
    opcion = document.createElement('option');
    opcion.value = desnivel;
    opcion.appendChild(document.createTextNode(desnivel + ' m'));
    if (desnivel == g_desnivelmin) opcion.selected = 'selected';
    selectmin.appendChild(opcion);
  }
  selectmax = document.createElement('select');
  for (desnivel = g_desnivelmin; desnivel <= g_desnivelmax; desnivel+=250){
    opcion = document.createElement('option');
    opcion.value = desnivel;
    opcion.appendChild(document.createTextNode(desnivel + ' m'));
    if (desnivel == g_desnivelmax) opcion.selected = 'selected';
    selectmax.appendChild(opcion);
  }
  titulo = document.createElement('strong');
  titulo.appendChild(document.createTextNode('Filtrar por ascenso'));
  controlDiv.appendChild(titulo);
  controlDiv.appendChild(document.createElement('br'));
  controlDiv.appendChild(document.createTextNode('Desde '));
  controlDiv.appendChild(selectmin);
  controlDiv.appendChild(document.createElement('br'));
  controlDiv.appendChild(document.createTextNode('Hasta '));
  controlDiv.appendChild(selectmax);
  
   
  google.maps.event.addDomListener(selectmin, 'change', function(){
    var min, i;
    console.log(selectmin.value);
    g_desnivelmin = min = parseInt(selectmin.value);
    for (i = 0; i < selectmax.length; i++) {
      if(parseInt(selectmax[i].value) < min) selectmax[i].disabled = 'disabled';
      else selectmax[i].removeAttribute('disabled');
    }
    recalcular(map);
  });
  
  google.maps.event.addDomListener(selectmax, 'change', function(){
    var max, i;
    console.log(selectmax.value);
    g_desnivelmax = max = parseInt(selectmax.value);
    for (i = 0; i < selectmin.length; i++) {
      if(parseInt(selectmin[i].value) > max) selectmin[i].disabled = 'disabled';
      else selectmin[i].removeAttribute('disabled');
    }
    recalcular(map);
  });
}

/*
 * Función que muestra el control para filtrar por controlIBP
 */

function controlIbp(controlDiv, map){
  var ibp, titulo, selectmin, selectmax, opcion;
  g_ibpmin = 0;
  g_ibpmax = 200;
  selectmin = document.createElement('select');
  for (ibp = g_ibpmin; ibp <= g_ibpmax; ibp+=25){
    opcion = document.createElement('option');
    opcion.value = ibp;
    opcion.appendChild(document.createTextNode(ibp));
    if (ibp == g_ibpmin) opcion.selected = 'selected';
    selectmin.appendChild(opcion);
  }
  selectmax = document.createElement('select');
  for (ibp = g_ibpmin; ibp <= g_ibpmax; ibp+=25){
    opcion = document.createElement('option');
    opcion.value = ibp;
    opcion.appendChild(document.createTextNode(ibp));
    if (ibp == g_ibpmax) opcion.selected = 'selected';
    selectmax.appendChild(opcion);
  }
  titulo = document.createElement('strong');
  titulo.appendChild(document.createTextNode('Filtrar por IBP'));
  controlDiv.appendChild(titulo);
  controlDiv.appendChild(document.createElement('br'));
  controlDiv.appendChild(document.createTextNode('Desde '));
  controlDiv.appendChild(selectmin);
  controlDiv.appendChild(document.createElement('br'));
  controlDiv.appendChild(document.createTextNode('Hasta '));
  controlDiv.appendChild(selectmax);
  
  google.maps.event.addDomListener(selectmin, 'change', function(){
    var min, i;
    console.log(selectmin.value);
    g_ibpmin = min = parseInt(selectmin.value);
    for (i = 0; i < selectmax.length; i++) {
      if(parseInt(selectmax[i].value) < min) selectmax[i].disabled = 'disabled';
      else selectmax[i].removeAttribute('disabled');
    }
    recalcular(map);
  });
  
  google.maps.event.addDomListener(selectmax, 'change', function(){
    var max, i;
    console.log(selectmax.value);
    g_ibpmax = max = parseInt(selectmax.value);
    for (i = 0; i < selectmin.length; i++) {
      if(parseInt(selectmin[i].value) > max) selectmin[i].disabled = 'disabled';
      else selectmin[i].removeAttribute('disabled');
    }
    recalcular(map);
  });
}

/*
 * Funcion que muestra el control para filtrar por año
 */

function controlAnyo(controlDiv, map){
  var anyo, titulo, selectmin, selectmax, opcion;
  var este_anyo = new Date().getFullYear();
  g_anyomin = 2014;
  g_anyomax = este_anyo;
  selectmin = document.createElement('select');
  for (anyo = g_anyomin; anyo <= este_anyo; anyo++){
    opcion = document.createElement('option');
    opcion.value = anyo;
    opcion.appendChild(document.createTextNode(anyo));
    if (anyo == g_anyomin) opcion.selected = 'selected';
    selectmin.appendChild(opcion);
  }
  selectmax = document.createElement('select');
  for (anyo = g_anyomin; anyo <= este_anyo; anyo++){
    opcion = document.createElement('option');
    opcion.value = anyo;
    opcion.appendChild(document.createTextNode(anyo));
    if (anyo == este_anyo) opcion.selected = 'selected';
    selectmax.appendChild(opcion);
  }
  
  titulo = document.createElement('strong');
  titulo.appendChild(document.createTextNode('Filtrar por año'));
  controlDiv.appendChild(titulo);
  controlDiv.appendChild(document.createElement('br'));
  controlDiv.appendChild(document.createTextNode('Desde el '));
  controlDiv.appendChild(selectmin);
  controlDiv.appendChild(document.createElement('br'));
  controlDiv.appendChild(document.createTextNode('Hasta el '));
  controlDiv.appendChild(selectmax);
  
  google.maps.event.addDomListener(selectmin, 'change', function(){
    var min, i;
    console.log(selectmin.value);
    g_anyomin = min = parseInt(selectmin.value);
    for (i = 0; i < selectmax.length; i++) {
      if(parseInt(selectmax[i].value) < min) selectmax[i].disabled = 'disabled';
      else selectmax[i].removeAttribute('disabled');
    }
    recalcular(map);
  });
  
  google.maps.event.addDomListener(selectmax, 'change', function(){
    var max, i;
    console.log(selectmax.value);
    g_anyomax = max = parseInt(selectmax.value);
    for (i = 0; i < selectmin.length; i++) {
      if(parseInt(selectmin[i].value) > max) selectmin[i].disabled = 'disabled';
      else selectmin[i].removeAttribute('disabled');
    }
    recalcular(map);
  });
}






/*
 * Funcion para desplazar el layout de la ruta cuando pulsas en un waypoint
 */

function zoomToWaypoint(map, button){
  map.setCenter({lat: parseFloat(button.parentNode.dataset.lat), lng: parseFloat(button.parentNode.dataset.lon)});
  map.setZoom(16);
  $('html, body').animate({scrollTop: $("#map").offset().top}, 1000)
}

/*
 * Funcion para desplazar el layout de la ruta cuando pulsas en una foto
 */

function thumbsToSlide(){
  $('body.ruta #photo-thumbs img, body.ruta #photos img, body.ruta .waypoint > img').on('click', function(e){
    $("#visor-canvas").carousel($(this).data("slide-to"));
    $('html, body').animate({scrollTop: parseInt($('#visor').offset().top)}, 1000);
  });
}

/*
 * Funcion para desplazar el layout de la ruta cuando pulsas en un waypoint
 */

function linksJournalToWaypoint(){
  $('body.ruta #journal a').on('click', function(e){
    $('html, body').animate({scrollTop: $($(this).attr('href')).offset().top}, 1000);
    e.preventDefault()
  });
}
  
/*
 * Funcion para desplazar el layout de la página de amigos cuando pulsas en un icono de amigo
 */

function friendsSoftTransition(){
  $('body.companeros #amigos img').on('click', function(e){
    $('html, body').animate({scrollTop: parseInt($('#' + $(this).data('slug')).offset().top)}, 1000);
  });
}

/*
 * Funcion para desplazar el layout de la página de tipos de ruta cuando pulsas en un icono de tipo
 */

function activitySoftTransition(){
  $('body.actividades #tipos img').on('click', function(e){
    $('html, body').animate({scrollTop: parseInt($('#cat-' + $(this).data('code')).offset().top)}, 1000);
  });
}

/*
 * Función para que al apretar los botones de compartir, haga algo
 */

function shareHandlers(){
  // Estos botones pueden estar en cualquier página
  $('.boton-facebook').on('click', function(e){
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent($(this).parent().data('url')), '_blank', 'width=626,height=436');
  });
  $('.boton-twitter').on('click', function(e){
    window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent($(this).parent().data('url')) + '&text=' + encodeURIComponent($(this).parent().data('title')) + '&via=LasRutasAlberto', '_blank', 'width=550,height=420');
  });
}

/*
 * Funcion que hace que el Carousel sólo cargue la foto anterior y siguiente, en vez de todas al cargar la página
 * consiguiendo así ahorrar datos y aligerar la carga
 */

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





/*
 * A partir de aquí, cosas específicas de los mapas
 */

/*
 * Prevenimos que nos cargue la tipografía Roboto y nos desgracie la web cuando casi esté cargada
 */

function preventRoboto(){
  var head = document.getElementsByTagName('head')[0];
  var insertBefore = head.insertBefore;
  head.insertBefore = function (newElement, referenceElement) {
    if (newElement.href && newElement.href.indexOf('https://fonts.googleapis.com/css?family=Roboto') === 0) {
      console.info('Prevented Roboto from loading!');
      return;
    }
    insertBefore.call(head, newElement, referenceElement);
  };
}

/*
 * Muestra la información de la ruta cuando pulsas la polilinea en el mapa general
 */

function muestraInfo(e){
  $('.global-map-datos .global-map-datos-actividad').text(this.category);
  $('.global-map-datos .global-map-datos-titulo').text(this.title);
  $('.global-map-datos .global-map-datos-fecha').text(this.longdate);
  $('.global-map-datos .global-map-datos-resumen').text(this.resumen);
  $('.global-map-datos .global-map-datos-');
  $('.global-map-datos .global-map-datos-');
  $('.global-map-datos .global-map-datos-');
  $('.global-map-datos .global-map-datos-');
  /*
  datos.childNodes[3].innerHTML = this.category;
  datos.childNodes[4].childNodes[0].innerHTML = this.title;
  datos.childNodes[4].childNodes[0].setAttribute('href', '/' + this.slug);
  datos.childNodes[5].innerHTML = this.longdate;
  datos.childNodes[6].innerHTML = this.resumen;
  console.log("hola" + this.title);*/
  //$('#global-map-datos:nth-child(0)').text(this.title);
 
}

/*
 * Control encima del mapa (veremos lo que hacemos con pantallas pequeñas) que muestra la información
 * de las rutas.
 */

function mostrarInfo(controlDiv, map){
  var a=new Date();
  controlDiv.innerHTML = "<p>Pulsa sobre cualquier ruta del mapa para ver sus características</p><p><time datetime=\"" + a.toJSON().toString() + "\">Fecha</time></p><p><img width=\"200\" height=\"100\" id=\"imagen\" src=\"\" alt=\"Imagen de la ruta\" /></p><p><a id=\"enlace\" href=\"#\">ruta</a></p><p>Características:<br />Bla bla bla</p><div style=\"width: 200px; height:100px;\" id=\"perfil\"></div>";
}

/*
 * Carga el mapa global de rutas. Casi es más fácil así que usando fusion tables. Aún tendré que darle
 * gracias a Google por cargarse el servicio. :¬s
 */

function initGlobalMap(mapid){
  var ruta, num_rutas;
  polilineas = [];
  var map = new google.maps.Map( mapid,
                                { zoom: 10,
                                  center: valencia,
                                  mapTypeId: getMapType(),
                                  backgroundColor: 'white',
                                  mapTypeControl: false,
                                  streetViewControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
                                  fullscreenControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
                                  zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM }
                                });
  
  $.getJSON( "/rutas.json", function( data ) {
    
    num_rutas = data.length;
    for (ruta = 0; ruta < num_rutas; ruta++) {
      var polilinea = new google.maps.Polyline({
                       path: google.maps.geometry.encoding.decodePath(data[ruta].routestring),
                       strokeColor: data[ruta].color,
                       strokeOpacity: 1.0,
                       strokeWeight: 3.0,
                       clickable: true,
                       map: map });
      polilinea.anyo = data[ruta].date;
      polilinea.longdate = data[ruta].longdate;
      polilinea.ibp = data[ruta].ibp;
      polilinea.ascenso = data[ruta].ascenso;
      polilinea.descenso = data[ruta].descenso;
      polilinea.cima = data[ruta].cima;
      polilinea.sima = data[ruta].sima;
      polilinea.slug = data[ruta].slug;
      polilinea.title = data[ruta].title;
      polilinea.category = data[ruta].category;
      polilinea.categorycode = data[ruta].categorycode;
      polilinea.circularpunto = data[ruta].circularpunto;
      polilinea.circularlocalidad = data[ruta].circularlocalidad;
      polilinea.distancia = data[ruta].distancia;
      polilinea.duracion = data[ruta].duracion;
      polilinea.tiempo = data[ruta].tiempo;
      polilinea.ele = data[ruta].ele;
      polilinea.resumen = data[ruta].resumen;
      google.maps.event.addListener(polilinea, 'click', muestraInfo);
      polilineas.push(polilinea);
    }
  });
  
  var dMostrarInfo = document.createElement('div');
  dMostrarInfo.className = 'gcontrol';
  dMostrarInfo.id = 'inforuta';
  var vMostrarInfo = new mostrarInfo(dMostrarInfo, map);
  map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(dMostrarInfo);
  
  var dControlAnyo = document.createElement('div');
  dControlAnyo.className = 'gcontrol';
  var vControlAnyo = new controlAnyo(dControlAnyo, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(dControlAnyo);
  
  var dControlDesnivel = document.createElement('div');
  dControlDesnivel.className = 'gcontrol';
  var vControlDesnivel = new controlDesnivel(dControlDesnivel, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(dControlDesnivel);
  
  var dControlIbp = document.createElement('div');
  dControlIbp.className = 'gcontrol';
  var vControlIbp = new controlIbp(dControlIbp, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(dControlIbp);
  
  var dControlTipoMapa = document.createElement('div');
  dControlTipoMapa.className = 'gcontrol';
  var vControlTipoMapa = new controlTipoMapa(dControlTipoMapa, map);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(dControlTipoMapa);
  
  map.addListener('maptypeid_changed', function(){ setMapType(map.getMapTypeId().toString()); });
}

/*
 * Carga el mapa de una ruta particular
 */

function initRouteMap(mapid){
  
  var map = new google.maps.Map( mapid,
                                { zoom: 0,
                                  center: {lat: 0.0, lng: 0.0},
                                  mapTypeId: getMapType(),
                                  backgroundColor: 'white',
                                  mapTypeControl: false
                                });
  
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
  
  var elevacion = JSON.parse(mapid.dataset.ele);
  if (elevacion.n > 0) {
    var idelevationcanvas = document.getElementById('elevation-canvas');
    var posmarker = new google.maps.Marker({
      position: decodificado[0],
      map: map,
      visible: false,
      zIndex: 6,
      title: 'Posición',
      icon: {
        url: '/imagenes/markers/sprites.png',
        origin: new google.maps.Point(0, 53 * parseInt(mapid.dataset.category)),
        size: new google.maps.Size(44, 53),
        scaledSize: new google.maps.Size(44, 3869)} });
    
    var svg = crearElevacion(idelevationcanvas, elevacion.ele, 150, elevacion.n, 0 /* extra */);
    handlerMoverMapaSegunPerfil(svg, elevacion, map, posmarker);
    
    /*Vamos a intentar mostrar los kilómetros (aproximadamente) */
    
    crearTextosEnSVG([20, 30, 50],[10, 60, 100],[parseInt(elevacion.l/2000).toString(), '0', parseInt(elevacion.l/1000).toString() + " km"], "fill: red;", svg);
    
    
  }
  
  //if(elevacion.n > 0) document.getElementById('elevation-canvas').addEventListener('mousemove', moverMapaSegunPerfil);
  handlerMoverMapaSegunPerfil(document.getElementById('elevation-canvas'), elevacion, map, posmarker);
  
  var dControlWPE = document.createElement('div');
  dControlWPE.className = 'gcontrol';
  var vControlWPE = new controlWPE(dControlWPE, map, mwaypoints, mpausas, polilinea, elevacion.n);
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(dControlWPE);
  var dControlTipoMapa = document.createElement('div');
  dControlTipoMapa.className = 'gcontrol';
  var vControlTipoMapa = new controlTipoMapa(dControlTipoMapa, map);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(dControlTipoMapa);

  map.addListener('maptypeid_changed', function(){ setMapType(map.getMapTypeId().toString()); });

}

function crearTextosEnSVG(x, y, text, style, svg){
  var i;
  for(i=0; i<x.length; i++){
    var t = document.createElementNS(ns, 'text');
    t.setAttributeNS(null, 'x', x[i]);
    t.setAttributeNS(null, 'y', y[i]);
    t.setAttributeNS(null, 'style', style);
    t.appendChild(document.createTextNode(text[i]));
    svg.appendChild(t);
  }
}

/*
 * Al cargar la librería de google maps, automáticamente se llama a esta función, que se encarga de
 * comprobar si es un mapa local o el global (según la clase del div), y actúa en consecuencia.
 */

function initMap() {
  var mapid;
  valencia = new google.maps.LatLng(39.47001, -0.37641); // Sólo se puede asignar con la librería cargada
  preventRoboto();
  mapid = document.getElementById('global-map-canvas');
  if (mapid !== null) return initGlobalMap(mapid);
  mapid = document.getElementById('map-canvas');
  if (mapid !== null) return initRouteMap(mapid);
  return false;
}






/*
 * Esto se llamará en cuanto la web se pueda cargar
 * No se garantiza que sea antes o después de la carga de los datos del mapa
 */

$(function(){
  
  loadIndexByAjax(); console.log('loadIndexByAjax');
  
  /* Lanzamos una petición de envío de evento que cuando se cargue la librería de analytics se enviará */
  //gtag('js', new Date());
  //gtag('config', '{{ site.google.analytics }}'); console.log('gtag');
  
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
