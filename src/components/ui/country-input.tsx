'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Globe, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { countries, type Country, searchCountries } from '@/lib/countries'

interface CountryInputProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export function CountryInput({
  value,
  onValueChange,
  placeholder = "Search for your country...",
  disabled = false,
  className,
  error = false
}: CountryInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(countries)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedCountry = countries.find(country => country.code === value)

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchCountries(searchQuery)
      setFilteredCountries(filtered)
    } else {
      setFilteredCountries(countries)
    }
    setHighlightedIndex(-1)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredCountries.length) {
          selectCountry(filteredCountries[highlightedIndex])
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        )
        break
      case 'Escape':
        setIsOpen(false)
        setSearchQuery('')
        inputRef.current?.blur()
        break
    }
  }

  const selectCountry = (country: Country) => {
    onValueChange?.(country.code)
    setIsOpen(false)
    setSearchQuery('')
    inputRef.current?.blur()
  }

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true)
      inputRef.current?.focus()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [highlightedIndex])

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "relative flex items-center cursor-pointer",
          className
        )}
        onClick={handleInputClick}
      >
        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : (selectedCountry ? selectedCountry.name : '')}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 pr-10 h-12 text-base border border-gray-300 rounded-md bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            "transition-all duration-200",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            error && "border-red-300 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          readOnly={!isOpen}
        />
        <ChevronDown 
          className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {filteredCountries.length > 0 ? (
            <ul ref={listRef} className="overflow-y-auto max-h-60">
              {filteredCountries.map((country, index) => (
                <li
                  key={country.code}
                  className={cn(
                    "px-3 py-2 cursor-pointer flex items-center space-x-3 text-sm",
                    "hover:bg-gray-50 transition-colors duration-150",
                    highlightedIndex === index && "bg-blue-50",
                    value === country.code && "bg-blue-100"
                  )}
                  onClick={() => selectCountry(country)}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  {value === country.code && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-8 text-center text-gray-500 text-sm">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No countries found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 