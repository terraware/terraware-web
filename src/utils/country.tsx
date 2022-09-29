import { Country, Subdivision } from 'src/types/Country';

export function getCountryByCode(countries: Country[], countryCode: string): Country | undefined {
  return countries.find((country) => country.code.toString() === countryCode);
}

export function getSubdivisionByCode(
  countries: Country[],
  countryCode: string,
  subdivisionCode: string
): Subdivision | undefined {
  const country = getCountryByCode(countries, countryCode);
  return country?.subdivisions?.find((subdivision) => subdivision.code.toString() === subdivisionCode);
}
