import db from '../../models/index.js';
import { Op } from 'sequelize';

const { Country, Metadata } = db;

export async function getAllCountries(filters = {}) {
  const whereClause = {};

  if (filters.region) {
    whereClause.region = {
      [Op.iLike]: filters.region
    };
  }

  if (filters.currency) {
    whereClause.currency_code = {
      [Op.iLike]: filters.currency
    };
  }

  const queryOptions = {
    where: whereClause,
    order: filters.sort === 'gdp_desc' 
      ? [['estimated_gdp', 'DESC']] 
      : [['name', 'ASC']]
  };

  const countries = await Country.findAll(queryOptions);
  return countries;
}

export async function getCountryByName(name) {
  const country = await Country.findOne({
    where: {
      name: {
        [Op.iLike]: name
      }
    }
  });
  return country;
}

export async function deleteCountryByName(name) {
  const result = await Country.destroy({
    where: {
      name: {
        [Op.iLike]: name
      }
    }
  });
  return result > 0;
}

export async function upsertCountry(countryData) {
  const {
    name,
    capital,
    region,
    population,
    currency_code,
    exchange_rate,
    estimated_gdp,
    flag_url
  } = countryData;

  const existingCountry = await Country.findOne({
    where: {
      name: {
        [Op.iLike]: name
      }
    }
  });

  if (existingCountry) {
    await existingCountry.update({
      capital: capital || null,
      region: region || null,
      population,
      currency_code: currency_code || null,
      exchange_rate: exchange_rate || null,
      estimated_gdp: estimated_gdp || 0,
      flag_url: flag_url || null,
      last_refreshed_at: new Date()
    });
    return existingCountry;
  } else {
    const newCountry = await Country.create({
      name,
      capital: capital || null,
      region: region || null,
      population,
      currency_code: currency_code || null,
      exchange_rate: exchange_rate || null,
      estimated_gdp: estimated_gdp || 0,
      flag_url: flag_url || null,
      last_refreshed_at: new Date()
    });
    return newCountry;
  }
}

export async function getTotalCountries() {
  const count = await Country.count();
  return count;
}

export async function getTopCountriesByGDP(limit = 5) {
  const countries = await Country.findAll({
    where: {
      estimated_gdp: {
        [Op.ne]: null
      }
    },
    order: [['estimated_gdp', 'DESC']],
    limit,
    attributes: ['name', 'estimated_gdp']
  });
  return countries;
}

export async function updateLastRefreshTimestamp() {
  const timestamp = new Date().toISOString();
  
  const [metadata, created] = await Metadata.findOrCreate({
    where: { key_name: 'last_refresh' },
    defaults: {
      key_name: 'last_refresh',
      value: timestamp,
      updated_at: new Date()
    }
  });

  if (!created) {
    await metadata.update({
      value: timestamp,
      updated_at: new Date()
    });
  }
}

export async function getLastRefreshTimestamp() {
  const metadata = await Metadata.findOne({
    where: { key_name: 'last_refresh' }
  });
  return metadata?.value || null;
}
