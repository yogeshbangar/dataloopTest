// Autor: Yogeosh Bangar
let map, drawInteraction, snapInteraction,baseVector,drawVector;
const scribbleStyle = (feature, resolution) => {
  const colors = ['red', 'green', 'blue', 'cyan', 'magenta', 'yellow', 'orange', 'purple', 'GreenYellow'];
  const a = feature.get('angle') || Math.random() * Math.PI;
  feature.set('angle', a)
  const color = feature.get('color') || colors[Math.round(Math.random() * (colors.length - 1))];
  feature.set('color', color)
  const maxres = 10000;
  const step = Math.max(8 * maxres, 8 * resolution);
  const width = Math.max(2, 2 * maxres / resolution);

  let scribble = feature._scribble;
  if (!scribble || scribble.step !== step) {
    scribble = {
      step: step,
      geom: ol.geom.scribbleFill(feature.getGeometry(), { interval: step, angle: a }) // feature.getGeometry().scribbleFill({ interval: step, angle: a })
    };
    feature._scribble = scribble;
  }

  return [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: .5,
        color: color
      }),
      fill: new ol.style.Fill({ color: 'transparent' })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: width,
        color: color
      }),
      geometry: scribble.geom
    })
  ];
};

const addInteraction = () => {
  const value = 'Polygon';
  if (value !== 'None') {
    drawInteraction = new ol.interaction.Draw({
      type: value,
      source: drawVector.getSource(),
      trace: true,
      traceSource: baseVector.getSource(),
      style: {
        'stroke-color': 'rgba(255, 255, 100, 0.5)',
        'stroke-width': 1.5,
        'fill-color': 'rgba(255, 255, 100, 0.25)',
        'circle-radius': 6,
        'circle-fill-color': 'rgba(255, 255, 100, 0.5)',
      },
    });
    map.addInteraction(drawInteraction);
    map.addInteraction(snapInteraction);
  }
}

const onLoad = () => {
  const layer = new ol.layer.Geoportail({ layer: 'ORTHOIMAGERY.ORTHOPHOTOS' });
  baseVector = new ol.layer.Vector({
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: './fire.json',
    }),
    style: {
      'fill-color': 'rgba(255, 0, 0, 0.3)',
      'stroke-color': 'rgba(255, 0, 0, 0.9)',
      'stroke-width': 0.5,
    },
  });
  drawVector = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: {
      'stroke-color': 'rgba(100, 255, 0, 1)',
      'stroke-width': 2,
      'fill-color': 'rgba(100, 255, 0, 0.3)',
    },
  });
  snapInteraction = new ol.interaction.Snap({
    source: baseVector.getSource(),
  });
  console.log(ol.interaction, '~~~~~~~');
  // The map
  map = new ol.Map({
    target: 'map',
    view: new ol.View
      ({
        zoom: 3,
        center: [166326, 5992663]
      }),
    layers: [layer,baseVector,drawVector]
  });
  const vector = new ol.layer.Vector({
    renderMode: 'image',
    source: new ol.source.Vector({
      url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson',
      format: new ol.format.GeoJSON()
    }),
    style: scribbleStyle
  })
  map.addLayer(vector);
  addInteraction();
}
document.addEventListener("DOMContentLoaded", function (event) {
  console.log("DOM fully loaded and parsed");
  onLoad();
}); 