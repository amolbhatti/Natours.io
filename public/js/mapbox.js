/*eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW1vbHNpbm5naCIsImEiOiJja3FqM3ppZzEwY3MyMm9xc2sxajM2eWc4In0.Wb5HaViVvOHMzXU2le0Pfg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/amolsinngh/ckqj4mdzd1bcf17nummpaqft5',
    scrollzoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((element) => {
    // add marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(element.coordinates)
      .addTo(map);
    // app popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(element.coordinates)
      .setHTML(`<p>Day ${element.day}: ${element.description}</p>`)
      .addTo(map);
    // extends map bounds to include current location
    bounds.extend(element.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
