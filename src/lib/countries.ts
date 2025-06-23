export interface Country {
  code: string
  name: string
  flag: string
  continent: string
}

export const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', continent: 'North America' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', continent: 'North America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', continent: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', continent: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', continent: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', continent: 'Europe' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', continent: 'Europe' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', continent: 'Europe' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', continent: 'Europe' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', continent: 'Europe' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', continent: 'Europe' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', continent: 'Europe' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', continent: 'Europe' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', continent: 'Europe' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', continent: 'Europe' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', continent: 'Europe' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', continent: 'Europe' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', continent: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', continent: 'Oceania' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', continent: 'Asia' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', continent: 'Asia' },
  { code: 'CN', name: 'China', flag: '🇨🇳', continent: 'Asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', continent: 'Asia' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', continent: 'Asia' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', continent: 'Asia' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', continent: 'Asia' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', continent: 'Asia' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', continent: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', continent: 'Asia' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', continent: 'Asia' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', continent: 'Asia' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', continent: 'Asia' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', continent: 'Asia' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', continent: 'South America' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', continent: 'South America' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', continent: 'South America' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', continent: 'South America' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', continent: 'South America' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', continent: 'South America' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', continent: 'North America' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', continent: 'North America' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', continent: 'North America' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', continent: 'Africa' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', continent: 'Africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', continent: 'Africa' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', continent: 'Africa' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', continent: 'Africa' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', continent: 'Africa' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', continent: 'Africa' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', continent: 'Europe' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', continent: 'Europe' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', continent: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', continent: 'Europe' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', continent: 'Europe' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', continent: 'Europe' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', continent: 'Europe' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', continent: 'Europe' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', continent: 'Europe' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', continent: 'Europe' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', continent: 'Europe' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', continent: 'Europe' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', continent: 'Europe' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', continent: 'Europe' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', continent: 'Europe' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', continent: 'Europe' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', continent: 'Europe' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', continent: 'Europe' },
]

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code)
}

export const getCountryFlag = (code: string): string => {
  const country = getCountryByCode(code)
  return country?.flag || '🌍'
}

export const getCountryName = (code: string): string => {
  const country = getCountryByCode(code)
  return country?.name || 'Unknown'
}

export const getCountriesByContinent = (): Record<string, Country[]> => {
  return countries.reduce((acc, country) => {
    if (!acc[country.continent]) {
      acc[country.continent] = []
    }
    acc[country.continent].push(country)
    return acc
  }, {} as Record<string, Country[]>)
}

export const searchCountries = (query: string): Country[] => {
  const lowercaseQuery = query.toLowerCase()
  return countries.filter(
    country =>
      country.name.toLowerCase().includes(lowercaseQuery) ||
      country.code.toLowerCase().includes(lowercaseQuery)
  )
}

export const getPopularCountries = (): Country[] => {
  const popularCodes = ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP', 'BR', 'IN', 'CN']
  return popularCodes.map(code => getCountryByCode(code)).filter(Boolean) as Country[]
} 