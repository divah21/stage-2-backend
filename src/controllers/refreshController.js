import { fetchCountries, fetchExchangeRates } from '../services/externalApiService.js';
import { 
  upsertCountry, 
  updateLastRefreshTimestamp,
  getTotalCountries,
  getTopCountriesByGDP
} from '../services/countryService.js';
import { generateSummaryImage } from '../services/imageService.js';

function computeEstimatedGDP(population, exchangeRate) {
  if (!exchangeRate || exchangeRate <= 0) {
    return null;
  }
  
  const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
  const estimatedGDP = (population * randomMultiplier) / exchangeRate;
  
  return estimatedGDP;
}

export async function refreshCountries(req, res) {
  try {
    let countries, exchangeRates;
    
    try {
      countries = await fetchCountries();
    } catch (error) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: `Could not fetch data from REST Countries API: ${error.message}`
      });
    }

    try {
      exchangeRates = await fetchExchangeRates();
    } catch (error) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: `Could not fetch data from Exchange Rates API: ${error.message}`
      });
    }

    let processedCount = 0;
    
    for (const country of countries) {
      try {
        let currencyCode = null;
        if (country.currencies && Array.isArray(country.currencies) && country.currencies.length > 0) {
          currencyCode = country.currencies[0].code;
        }

        let exchangeRate = null;
        if (currencyCode && exchangeRates[currencyCode]) {
          exchangeRate = exchangeRates[currencyCode];
        }

        let estimatedGDP = 0;
        if (currencyCode && exchangeRate && country.population) {
          estimatedGDP = computeEstimatedGDP(country.population, exchangeRate);
        }

        const countryData = {
          name: country.name,
          capital: country.capital || null,
          region: country.region || null,
          population: country.population,
          currency_code: currencyCode,
          exchange_rate: exchangeRate,
          estimated_gdp: estimatedGDP,
          flag_url: country.flag || null
        };

        await upsertCountry(countryData);
        processedCount++;
      } catch (error) {
        console.error(`Error processing country ${country.name}:`, error.message);
      }
    }

    await updateLastRefreshTimestamp();

    try {
      const totalCountries = await getTotalCountries();
      const topCountries = await getTopCountriesByGDP(5);
      const lastRefreshed = new Date().toISOString();

      await generateSummaryImage({
        totalCountries,
        topCountries,
        lastRefreshed
      });
    } catch (imageError) {
      console.error('Error generating summary image:', imageError.message);
    }

    res.status(200).json({
      message: 'Countries data refreshed successfully',
      processed: processedCount,
      total: countries.length
    });

  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
