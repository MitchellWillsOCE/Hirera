export interface Country {
  code: string
  name: string
  flag: string
  continent: string
}

export const countries: Country[] = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', continent: 'Asia' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱', continent: 'Europe' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', continent: 'Africa' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', continent: 'South America' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', continent: 'Asia' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', continent: 'Oceania' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', continent: 'Europe' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', continent: 'Asia' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', continent: 'Asia' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', continent: 'Asia' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', continent: 'Europe' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', continent: 'Europe' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', continent: 'South America' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', continent: 'Europe' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', continent: 'South America' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', continent: 'Europe' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', continent: 'Asia' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', continent: 'Africa' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', continent: 'North America' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', continent: 'South America' },
  { code: 'CN', name: 'China', flag: '🇨🇳', continent: 'Asia' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', continent: 'South America' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', continent: 'North America' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', continent: 'Europe' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', continent: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', continent: 'Europe' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', continent: 'Europe' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', continent: 'South America' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', continent: 'Africa' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', continent: 'North America' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', continent: 'Europe' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', continent: 'Africa' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', continent: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', continent: 'Europe' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', continent: 'Asia' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', continent: 'Europe' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', continent: 'Africa' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', continent: 'Europe' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', continent: 'North America' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', continent: 'North America' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', continent: 'Asia' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', continent: 'Europe' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', continent: 'Europe' },
  { code: 'IN', name: 'India', flag: '🇮🇳', continent: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', continent: 'Asia' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', continent: 'Asia' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', continent: 'Asia' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', continent: 'Europe' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', continent: 'Asia' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', continent: 'Europe' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', continent: 'North America' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', continent: 'Asia' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', continent: 'Asia' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', continent: 'Asia' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', continent: 'Africa' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', continent: 'Asia' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', continent: 'Europe' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', continent: 'Asia' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', continent: 'Europe' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', continent: 'Europe' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', continent: 'Asia' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', continent: 'Asia' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', continent: 'Europe' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', continent: 'North America' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', continent: 'Europe' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', continent: 'Europe' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', continent: 'Africa' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', continent: 'Asia' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', continent: 'Asia' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', continent: 'Europe' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', continent: 'Oceania' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', continent: 'North America' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', continent: 'Africa' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', continent: 'Europe' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', continent: 'Europe' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', continent: 'Asia' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', continent: 'Asia' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', continent: 'North America' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', continent: 'South America' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', continent: 'South America' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', continent: 'Asia' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', continent: 'Europe' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', continent: 'Europe' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', continent: 'Asia' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', continent: 'Europe' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', continent: 'Europe' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', continent: 'Asia' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', continent: 'Europe' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', continent: 'Asia' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', continent: 'Europe' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', continent: 'Europe' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', continent: 'Africa' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', continent: 'Asia' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', continent: 'Europe' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', continent: 'Asia' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', continent: 'Europe' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', continent: 'Europe' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', continent: 'Asia' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', continent: 'Africa' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', continent: 'Asia' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', continent: 'Africa' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', continent: 'Asia' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', continent: 'Europe' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', continent: 'Asia' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe' },
  { code: 'US', name: 'United States', flag: '🇺🇸', continent: 'North America' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', continent: 'South America' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', continent: 'Asia' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', continent: 'South America' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', continent: 'Asia' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', continent: 'Asia' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', continent: 'Africa' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', continent: 'Africa' },
].sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name

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