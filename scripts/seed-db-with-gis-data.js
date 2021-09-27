import axios from "axios";
import {fromLatLon} from "utm";

const headers = {
  "Cookie": "SESSION=ZGY2M2I2ZTgtY2UzNi00YWJkLThhZjEtODVlZTZiMmZkOWM3; OAuth_Token_Request_State=95a28a88-859e-4a69-a25e-26603aa7c19b",
}
const BASE_URL = `http://localhost:8080/api/v1`;

async function createSpecies(name) {
  const speciesEndpoint = `${BASE_URL}/species`;
  const speciesReq = {
    name: name,
    rare: "No",
  }
  const speciesId = (await axios.post(speciesEndpoint, speciesReq, {headers})).data.id;
  console.log(`Created new species name: ${name}, id: ${speciesId}`);
  return speciesId;
}

async function createLayer(siteId) {
  const layersEndpoint = `${BASE_URL}/gis/layers`;
  const createLayerReq = {
    siteId: siteId,
    layerType: "Plants Planted",
    tileSetName: "Some tile set name",
    proposed: "false",
    hidden: "false",
  }
  const newLayerId = (await axios.post(layersEndpoint, createLayerReq, {headers})).data.layer.id
  console.log("New layer id is " + newLayerId)
  return newLayerId;
}

async function createFeature(layerId, coordinates) {
  const featuresEndpoint = `${BASE_URL}/gis/features`;
  const createFeatureReq = {
    layerId: layerId,
    geom: {
      type: "Point",
      coordinates: coordinates,
    },
    attrib: "Kalina attrib",
    notes: "Great location",
    // TODO ADD enteredTime
  }
  const newFeatureId = (await axios.post(featuresEndpoint, createFeatureReq, {headers})).data.feature.id
  console.log("New feature id is " + newFeatureId);
  return newFeatureId;
}

async function createPlant(featureId, speciesId) {
  const plantsEndpoint = `${BASE_URL}/gis/plants`;
  const createPlantsReq = {
    featureId: featureId,
    label: "My plant label",
    speciesId: speciesId,
  }
  await axios.post(plantsEndpoint, createPlantsReq, {headers});
  console.log("Created new plant with feature id " + featureId);
}

(async function seedDb() {
  try {
    // const speciesNames = ["Koa", "Hibiscus", "Mango", "O'hia"];
    // const species = await Promise.all(speciesNames.map(async (speciesName) => {
    //   const id = await createSpecies(speciesName)
    //   return {
    //     id: id,
    //     name: speciesName,
    //   }
    // }));
    // const newLayerId = await createLayer(10);
    const newFeatureId = await createFeature(1, [-75.546518086577947, 45.467134581917357]);
    // TODO FIX THIS
    await createPlant(newFeatureId, 2);
  } catch (e) {
    console.log(e)
    return
  }
})();