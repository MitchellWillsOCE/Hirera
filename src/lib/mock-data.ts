import { countries } from './countries'

export interface MockUser {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  country: string
  isPublic: boolean
}

export interface MockJobApplication {
  jobTitle: string
  company: string
  location: string
  jobPostUrl?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  notes?: string
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  priority: 'low' | 'medium' | 'high'
  appliedDate: Date
  tags: string[]
}

export const jobTitles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer', 'Product Manager',
  'UX Designer', 'UI Designer', 'Marketing Manager', 'Sales Representative',
  'Business Analyst', 'Project Manager', 'Quality Assurance Engineer', 'Mobile Developer',
  'Cloud Architect', 'Security Engineer', 'Data Analyst', 'Technical Writer',
  'Scrum Master', 'Product Designer', 'Growth Hacker', 'Customer Success Manager',
  'Solutions Architect', 'Platform Engineer', 'Site Reliability Engineer'
]

export const companies = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'SpaceX',
  'Uber', 'Airbnb', 'Stripe', 'Spotify', 'Slack', 'Zoom', 'Atlassian', 'Salesforce',
  'Adobe', 'Nvidia', 'Intel', 'Oracle', 'IBM', 'Cisco', 'VMware', 'ServiceNow',
  'Snowflake', 'Databricks', 'Palantir', 'Coinbase', 'Twitter', 'LinkedIn',
  'Pinterest', 'Snapchat', 'TikTok', 'Discord', 'Reddit', 'Shopify',
  'Square', 'PayPal', 'Robinhood', 'Dropbox', 'Box', 'Zendesk',
  'HubSpot', 'Twilio', 'SendGrid', 'Mailchimp', 'Figma', 'Notion',
  'Airtable', 'Monday.com', 'Canva', 'Grammarly', 'Duolingo', 'Khan Academy'
]

export const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
  'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Atlanta, GA', 'Miami, FL',
  'Toronto, ON', 'Vancouver, BC', 'Montreal, QC', 'London, UK', 'Berlin, DE',
  'Amsterdam, NL', 'Stockholm, SE', 'Copenhagen, DK', 'Zurich, CH', 'Paris, FR',
  'Barcelona, ES', 'Rome, IT', 'Dublin, IE', 'Edinburgh, UK', 'Munich, DE',
  'Sydney, AU', 'Melbourne, AU', 'Tokyo, JP', 'Singapore, SG', 'Hong Kong, HK',
  'Tel Aviv, IL', 'Dubai, AE', 'São Paulo, BR', 'Mexico City, MX', 'Remote'
]

export const skills = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Python',
  'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart',
  'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap', 'Material UI',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'GraphQL',
  'REST API', 'microservices', 'Machine Learning', 'AI', 'Data Science',
  'Agile', 'Scrum', 'Leadership', 'Project Management', 'Product Strategy',
  'UI/UX Design', 'Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping'
]

export const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery',
  'Quinn', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Harper', 'Hayden',
  'Kendall', 'Logan', 'Marley', 'Parker', 'Reese', 'Sage', 'Skyler', 'River'
]

export const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
]

export function generateRandomDate(daysAgo: number): Date {
  const now = new Date()
  const randomDays = Math.floor(Math.random() * daysAgo)
  const date = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000))
  return date
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function generateMockUser(): MockUser {
  const firstName = getRandomElement(firstNames)
  const lastName = getRandomElement(lastNames)
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}`
  const country = getRandomElement(countries).code
  
  return {
    username,
    email: `${username}@example.com`,
    password: 'password123', // This will be hashed
    firstName,
    lastName,
    country,
    isPublic: Math.random() > 0.3 // 70% chance of being public
  }
}

export function generateMockJobApplication(appliedDaysAgo?: number): MockJobApplication {
  const maxDaysAgo = appliedDaysAgo || 90
  const appliedDate = generateRandomDate(maxDaysAgo)
  
  // Status progression based on how old the application is
  const daysOld = Math.floor((new Date().getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
  let status: MockJobApplication['status'] = 'applied'
  
  if (daysOld > 7) {
    const rand = Math.random()
    if (rand < 0.3) status = 'rejected'
    else if (rand < 0.5) status = 'screening'
    else if (rand < 0.65) status = 'interview'
    else if (rand < 0.75) status = 'offer'
    else if (rand < 0.8) status = 'withdrawn'
  } else if (daysOld > 3) {
    const rand = Math.random()
    if (rand < 0.4) status = 'screening'
    else if (rand < 0.6) status = 'interview'
  }

  const jobTitle = getRandomElement(jobTitles)
  const company = getRandomElement(companies)
  const location = getRandomElement(locations)
  const isRemote = location === 'Remote'
  
  // Salary ranges based on job level and location
  const baseSalary = jobTitle.includes('Senior') || jobTitle.includes('Lead') ? 120 : 
                   jobTitle.includes('Junior') ? 60 : 80
  const locationMultiplier = location.includes('San Francisco') || location.includes('New York') ? 1.4 :
                           location.includes('London') || location.includes('Zurich') ? 1.2 :
                           isRemote ? 1.1 : 1.0
  
  const salaryMin = Math.floor(baseSalary * locationMultiplier)
  const salaryMax = Math.floor(salaryMin * 1.3)
  
  const currency = location.includes('UK') || location.includes('London') ? 'GBP' :
                  location.includes('EU') || location.includes('DE') || location.includes('FR') ? 'EUR' :
                  'USD'

  // Generate relevant tags
  const relevantSkills = getRandomElements(skills, Math.floor(Math.random() * 6) + 2)
  const jobLevelTags = []
  if (jobTitle.includes('Senior')) jobLevelTags.push('Senior')
  if (jobTitle.includes('Lead')) jobLevelTags.push('Leadership')
  if (jobTitle.includes('Manager')) jobLevelTags.push('Management')
  if (isRemote) jobLevelTags.push('Remote')
  
  const priority = Math.random() < 0.2 ? 'high' : Math.random() < 0.6 ? 'medium' : 'low'
  
  return {
    jobTitle,
    company,
    location,
    jobPostUrl: Math.random() > 0.3 ? `https://${company.toLowerCase().replace(/\s+/g, '')}.com/careers/${Math.floor(Math.random() * 10000)}` : undefined,
    salaryMin: Math.random() > 0.2 ? salaryMin : undefined,
    salaryMax: Math.random() > 0.2 ? salaryMax : undefined,
    salaryCurrency: currency,
    contactName: Math.random() > 0.6 ? `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}` : undefined,
    contactEmail: Math.random() > 0.7 ? `hiring@${company.toLowerCase().replace(/\s+/g, '')}.com` : undefined,
    contactPhone: Math.random() > 0.8 ? `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
    notes: Math.random() > 0.4 ? generateJobNotes(status, company) : undefined,
    status,
    priority: priority as 'low' | 'medium' | 'high',
    appliedDate,
    tags: [...relevantSkills, ...jobLevelTags]
  }
}

function generateJobNotes(status: string, company: string): string {
  const notes = [
    `Really excited about this opportunity at ${company}. The role seems like a perfect fit for my skills.`,
    `Found this position through LinkedIn. The company culture looks amazing from their Glassdoor reviews.`,
    `Referred by a colleague who works there. They spoke highly of the team and work environment.`,
    `This company is doing innovative work in their field. Would love to contribute to their mission.`,
    `Applied through their website. The job description aligns perfectly with my career goals.`,
    `Met the hiring manager at a tech conference. They encouraged me to apply for this role.`,
    `The benefits package looks comprehensive. Especially interested in their learning budget.`,
    `Remote-first company which is perfect for my current situation. Excited about the flexibility.`,
    `They use the exact tech stack I've been wanting to work with. Great opportunity to grow.`,
    `Fast-growing startup with significant funding. Could be a great place to make an impact.`
  ]
  
  if (status === 'interview') {
    return getRandomElement(notes) + ' Interview scheduled for next week!'
  } else if (status === 'offer') {
    return getRandomElement(notes) + ' Received an offer! Considering the terms.'
  } else if (status === 'rejected') {
    return getRandomElement(notes) + ' Unfortunately didn\'t move forward, but good learning experience.'
  }
  
  return getRandomElement(notes)
}

export function generateMockUsers(count: number): MockUser[] {
  const users: MockUser[] = []
  for (let i = 0; i < count; i++) {
    users.push(generateMockUser())
  }
  return users
}

export function generateMockJobApplications(count: number): MockJobApplication[] {
  const applications: MockJobApplication[] = []
  for (let i = 0; i < count; i++) {
    applications.push(generateMockJobApplication())
  }
  return applications
}

// Predefined user profiles for more realistic data
export const mockUserProfiles = [
  {
    username: 'sarah_dev',
    email: 'sarah.dev@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    country: 'US',
    applicationCount: 25,
    successRate: 12
  },
  {
    username: 'alex_frontend',
    email: 'alex.frontend@example.com',
    firstName: 'Alex',
    lastName: 'Chen',
    country: 'CA',
    applicationCount: 18,
    successRate: 22
  },
  {
    username: 'mike_fullstack',
    email: 'mike.fullstack@example.com',
    firstName: 'Mike',
    lastName: 'Schmidt',
    country: 'DE',
    applicationCount: 32,
    successRate: 8
  },
  {
    username: 'priya_data',
    email: 'priya.data@example.com',
    firstName: 'Priya',
    lastName: 'Patel',
    country: 'IN',
    applicationCount: 41,
    successRate: 15
  },
  {
    username: 'james_backend',
    email: 'james.backend@example.com',
    firstName: 'James',
    lastName: 'Wilson',
    country: 'GB',
    applicationCount: 29,
    successRate: 18
  }
] 