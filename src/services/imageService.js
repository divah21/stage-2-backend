import Jimp from 'jimp';
import fs from 'fs/promises';
import path from 'path';

export async function generateSummaryImage(data) {
  const { totalCountries, topCountries, lastRefreshed } = data;

  const width = 800;
  const height = 600;
  const image = await new Promise((resolve, reject) => {
    new Jimp(width, height, '#1e293b', (err, img) => {
      if (err) reject(err);
      else resolve(img);
    });
  });

  const fontLarge = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const fontMedium = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_14_WHITE);

  image.print(
    fontLarge,
    0,
    30,
    {
      text: 'Country Currency Exchange Summary',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    },
    width
  );

  image.print(
    fontMedium,
    0,
    90,
    {
      text: `Total Countries: ${totalCountries}`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    },
    width
  );

  image.print(fontMedium, 50, 140, 'Top 5 Countries by Estimated GDP');

  let yPosition = 180;
  topCountries.forEach((country, index) => {
    const gdp = country.estimated_gdp 
      ? `$${Number(country.estimated_gdp).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      : 'N/A';
    
    const line = `${index + 1}. ${country.name} - ${gdp}`;
    image.print(fontSmall, 60, yPosition, line);
    yPosition += 40;
  });

  const refreshText = lastRefreshed 
    ? `Last Refreshed: ${new Date(lastRefreshed).toLocaleString()}`
    : 'Last Refreshed: Never';
  
  image.print(
    fontSmall,
    0,
    height - 50,
    {
      text: refreshText,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    },
    width
  );

  const cacheDir = path.join(process.cwd(), 'cache');
  await fs.mkdir(cacheDir, { recursive: true });
  
  const imagePath = path.join(cacheDir, 'summary.png');
  await image.writeAsync(imagePath);

  return imagePath;
}
