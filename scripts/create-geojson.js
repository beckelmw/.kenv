import "@johnlindquist/kit";

const { gpx } = await npm("@tmcw/togeojson");
const { DOMParser } = await npm("xmldom");
const simplify = await npm("simplify-geojson");
const ExifReader = await npm("exifreader");
const { merge: mergeGeoJson } = await npm("@mapbox/geojson-merge");

const { load: readExif } = ExifReader;

const buildPointsGeoJson = (data, propertyMapper = () => {}) => {
  const result = {
    type: "FeatureCollection",
    features: [],
  };

  for (let d of data) {
    result.features.push({
      type: "Feature",
      properties: propertyMapper(d),
      geometry: {
        type: "Point",
        coordinates: [d.longitude, d.latitude],
      },
    });
  }
  return result;
};

// Get the selected files
const files = await getSelectedFile();
const selectedFiles = files.split("\n");

const geoJsonFiles = [];

for (const file of selectedFiles.filter((f) => path.extname(f) === ".gpx")) {
  const fileContent = await readFile(file, "utf-8");
  const gpxXML = new DOMParser().parseFromString(fileContent, "text/xml");
  const geoJson = gpx(gpxXML);
  geoJson.features[0].properties = {};
  geoJsonFiles.push(geoJson);
}

const points = [];
for (const file of selectedFiles.filter((f) => path.extname(f) !== ".gpx")) {
  const fileContent = await readFile(file);
  try {
    const { gps } = readExif(fileContent, { expanded: true });
    if (gps) {
      points.push({
        latitude: gps.Latitude,
        longitude: gps.Longitude,
        name: path.basename(file),
      });
    }
  } catch (err) {}
}

if (points.length) {
  geoJsonFiles.push(buildPointsGeoJson(points, (x) => ({ name: x.name })));
}

const geoJson = mergeGeoJson(geoJsonFiles);

// Simplify
// Note: Tolerance could be a made a script choice
const simplifiedGeoJson = simplify(geoJson, 0.0001);

//Write back to the same directory with a different extension
await writeJson(
  path.join(path.dirname(selectedFiles[0]), "hike.geojson"),
  simplifiedGeoJson,
  {
    flag: "w",
  }
);
