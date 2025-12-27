import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/jwt'

interface JobInsight {
  id: string
  title: string
  company: string
  location: string
  salaryRange?: string
  description: string
  skills: string[]
  source: string
  url?: string
  postedDate: string
}

interface MarketTrend {
  skill: string
  demand: number
  growth: string
  averageSalary: number
  jobCount: number
}

interface JobMarketData {
  insights: JobInsight[]
  trends: MarketTrend[]
  salaryBenchmarks: {
    role: string
    location: string
    min: number
    max: number
    median: number
  }[]
  summary: {
    totalJobs: number
    averageSalary: number
    topSkills: string[]
    hotCompanies: string[]
  }
}

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.split(' ')[1] ||
      request.cookies.get('access_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validatedToken = await validateToken(token)
    if (!validatedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'software engineer'
    const location = searchParams.get('location') || 'remote'
    const experience = searchParams.get('experience') || 'mid'

    // In a real implementation, you would call actual APIs here
    // For now, we'll generate realistic mock data
    const jobMarketData = await generateJobMarketData(query, location, experience)

    return NextResponse.json(jobMarketData)
  } catch (error) {
    console.error('Error fetching job insights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateJobMarketData(query: string, location: string, experience: string): Promise<JobMarketData> {
  // Mock data generation - in production, this would call real APIs
  const companies = [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb',
    'Stripe', 'Spotify', 'Slack', 'Zoom', 'Salesforce', 'Adobe', 'Nvidia'
  ]

  const skills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker',
    'Kubernetes', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Git', 'CI/CD'
  ]

  const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote']

  // Generate job insights
  const insights: JobInsight[] = Array.from({ length: 15 }, (_, i) => {
    const company = companies[Math.floor(Math.random() * companies.length)]
    const jobLocation = Math.random() > 0.3 ? location : locations[Math.floor(Math.random() * locations.length)]
    const requiredSkills = skills.slice(0, Math.floor(Math.random() * 5) + 3)
    
    const baseSalary = experience === 'entry' ? 80000 : experience === 'senior' ? 150000 : 110000
    const variation = baseSalary * 0.3
    const minSalary = Math.floor(baseSalary - variation)
    const maxSalary = Math.floor(baseSalary + variation)

    return {
      id: `job-${i}`,
      title: `${experience === 'senior' ? 'Senior ' : experience === 'entry' ? 'Junior ' : ''}${query}`,
      company,
      location: jobLocation,
      salaryRange: `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()}`,
      description: `Join ${company} as a ${query} and help build the future of technology. We're looking for someone passionate about innovation and excellence.`,
      skills: requiredSkills,
      source: Math.random() > 0.5 ? 'LinkedIn' : 'Indeed',
      url: `https://${company.toLowerCase()}.com/careers`,
      postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  })

  // Generate market trends
  const trends: MarketTrend[] = skills.slice(0, 8).map(skill => ({
    skill,
    demand: Math.floor(Math.random() * 100) + 50,
    growth: Math.random() > 0.3 ? '+' + Math.floor(Math.random() * 25 + 5) + '%' : '-' + Math.floor(Math.random() * 10 + 1) + '%',
    averageSalary: Math.floor(Math.random() * 50000) + 80000,
    jobCount: Math.floor(Math.random() * 5000) + 1000
  }))

  // Generate salary benchmarks
  const salaryBenchmarks = [
    { role: 'Junior ' + query, location, min: 60000, max: 90000, median: 75000 },
    { role: query, location, min: 90000, max: 130000, median: 110000 },
    { role: 'Senior ' + query, location, min: 130000, max: 180000, median: 155000 },
    { role: 'Lead ' + query, location, min: 180000, max: 250000, median: 215000 }
  ]

  const summary = {
    totalJobs: insights.length * 100, // Scale up for realism
    averageSalary: Math.floor(trends.reduce((sum, t) => sum + t.averageSalary, 0) / trends.length),
    topSkills: skills.slice(0, 5),
    hotCompanies: companies.slice(0, 6)
  }

  return {
    insights,
    trends,
    salaryBenchmarks,
    summary
  }
}

// Helper function to call real APIs (for future implementation)
async function callRealJobAPI(query: string, location: string): Promise<JobInsight[]> {
  // Example implementation for GitHub Jobs API (currently deprecated)
  // You could integrate with:
  // - Indeed API
  // - LinkedIn API
  // - RemoteOK API
  // - AngelList API
  // - Glassdoor API for salary data
  
  try {
    // Example API call structure:
    // const response = await fetch(`https://api.example.com/jobs?q=${query}&location=${location}`)
    // const data = await response.json()
    // return data.jobs.map(transformToJobInsight)
    
    return []
  } catch (error) {
    console.error('Real API call failed:', error)
    return []
  }
} 

