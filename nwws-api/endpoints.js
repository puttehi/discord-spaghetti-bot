const { default: axios } = require('axios');
const rateLimit = require('axios-rate-limit');
const config = require('./config.js');
const { World, Worlds, WorldSet, WorldSets } = require('./models.js');

const axiosConfig = {
  headers: {
    Authorization: config.BEARER_TOKEN,
  },
};

const limitedAxios = rateLimit(axios.create(axiosConfig), { maxRPS: 2 });

const getWorldsList = () => {
  return axios
    .get(`${config.BASE_URL}/worlds`, axiosConfig)
    .then((res) => {
      const worldsArr = res.data.message.worlds;
      let worldsList = [];
      console.log(worldsArr[0]);
      worldsArr.forEach((e) => {
        worldsList.push(
          new Worlds(e.identifier, e.name, e.type, e.serialized_type)
        );
      });
      return worldsList;
    })
    .catch(console.error);
};

/**
 *
 * @param {Array<Worlds>} worldsList Array of Worlds modelled world information
 */
const getWorldInfo = async (worldIdentifier) => {
  return axios
    .get(`${config.BASE_URL}/worlds/${worldIdentifier}`, axiosConfig)
    .then((res) => {
      const worldInfo = res.data.message;
      return new World(
        worldInfo.players_current,
        worldInfo.players_maximum,
        worldInfo.queue_current,
        worldInfo.queue_wait_time_minutes,
        worldInfo.status_enum
      );
    })
    .catch(console.error);
};

module.exports = {
  getWorldsList: getWorldsList,
  getWorldInfo: getWorldInfo,
};
