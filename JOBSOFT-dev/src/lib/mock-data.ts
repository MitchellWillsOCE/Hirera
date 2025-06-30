import { countries } from './countries'

export interface MockUser {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  country: string
  isPublic: boolean
  applicationCount?: number
  successRate?: number
}

export interface MockJobApplication {
  jobTitle: string
  company: string
  location: string
  jobPostUrl?: string
  salary?: number
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
  // Software Engineering
  'Software Engineer', 'Senior Software Engineer', 'Junior Software Engineer',
  'Frontend Developer', 'Senior Frontend Developer', 'Backend Developer', 'Senior Backend Developer',
  'Full Stack Developer', 'Senior Full Stack Developer', 'Lead Software Engineer',
  'Principal Software Engineer', 'Staff Software Engineer',
  
  // Specialized Engineering
  'DevOps Engineer', 'Senior DevOps Engineer', 'Cloud Engineer', 'Platform Engineer',
  'Site Reliability Engineer', 'Infrastructure Engineer', 'Security Engineer',
  'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Native Developer',
  'Game Developer', 'Embedded Software Engineer', 'Firmware Engineer',
  
  // Data & AI
  'Data Scientist', 'Senior Data Scientist', 'Machine Learning Engineer', 'ML Engineer',
  'Data Engineer', 'Data Analyst', 'Business Intelligence Developer', 'AI Engineer',
  'Research Scientist', 'Deep Learning Engineer', 'Computer Vision Engineer',
  
  // Product & Design
  'Product Manager', 'Senior Product Manager', 'Product Owner', 'Technical Product Manager',
  'UX Designer', 'UI Designer', 'Product Designer', 'UX/UI Designer',
  'Design Systems Engineer', 'User Researcher', 'Interaction Designer',
  
  // Leadership & Management
  'Engineering Manager', 'Senior Engineering Manager', 'Director of Engineering',
  'VP of Engineering', 'CTO', 'Technical Lead', 'Team Lead',
  'Scrum Master', 'Agile Coach', 'Technical Program Manager',
  
  // Quality & Testing
  'Quality Assurance Engineer', 'QA Engineer', 'Test Engineer', 'Automation Engineer',
  'Performance Engineer', 'Security Tester', 'Manual Tester',
  
  // Other Tech Roles
  'Solutions Architect', 'Enterprise Architect', 'Cloud Architect', 'Systems Architect',
  'Technical Writer', 'Developer Advocate', 'Sales Engineer', 'Customer Success Engineer',
  'Support Engineer', 'Implementation Engineer', 'Integration Engineer'
]

export const companies = [
  // Big Tech
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta (Facebook)', 'Netflix', 'Tesla', 'SpaceX',
  'Nvidia', 'Intel', 'AMD', 'Oracle', 'IBM', 'Cisco', 'VMware', 'Adobe',
  
  // Unicorns & High-Growth
  'Uber', 'Airbnb', 'Stripe', 'Spotify', 'Slack', 'Zoom', 'Atlassian', 'Salesforce',
  'ServiceNow', 'Snowflake', 'Databricks', 'Palantir', 'Coinbase', 'LinkedIn',
  'Pinterest', 'Snapchat', 'TikTok', 'Discord', 'Reddit', 'Shopify',
  
  // Fintech
  'Square', 'PayPal', 'Robinhood', 'Plaid', 'Chime', 'Affirm', 'Klarna',
  'Wise', 'Revolut', 'Monzo', 'N26', 'Brex', 'Marqeta',
  
  // Productivity & Tools
  'Notion', 'Airtable', 'Monday.com', 'Figma', 'Canva', 'Miro', 'Asana',
  'Dropbox', 'Box', 'Zendesk', 'HubSpot', 'Twilio', 'SendGrid', 'Mailchimp',
  
  // Cloud & Infrastructure
  'AWS', 'HashiCorp', 'Terraform', 'Kubernetes', 'Docker', 'GitLab',
  'DataDog', 'New Relic', 'PagerDuty', 'Splunk', 'Elastic',
  
  // AI & ML
  'OpenAI', 'Anthropic', 'Scale AI', 'Hugging Face', 'Stability AI',
  'Cohere', 'Jasper', 'Copy.ai', 'Midjourney',
  
  // Gaming
  'Unity', 'Epic Games', 'Riot Games', 'Blizzard Entertainment', 'EA',
  'Ubisoft', 'Valve', 'Roblox', 'Discord',
  
  // Traditional Tech
  'Accenture', 'Deloitte', 'Capgemini', 'Infosys', 'TCS', 'Wipro',
  'Cognizant', 'DXC Technology', 'Atos', 'CGI'
]

export const locations = [
  // US Tech Hubs
  'San Francisco, CA', 'Palo Alto, CA', 'Mountain View, CA', 'Cupertino, CA',
  'San Jose, CA', 'Redwood City, CA', 'Menlo Park, CA',
  'New York, NY', 'Brooklyn, NY', 'Manhattan, NY',
  'Seattle, WA', 'Bellevue, WA', 'Redmond, WA',
  'Austin, TX', 'Dallas, TX', 'Houston, TX',
  'Boston, MA', 'Cambridge, MA',
  'Los Angeles, CA', 'Santa Monica, CA', 'Irvine, CA',
  'Chicago, IL', 'Denver, CO', 'Boulder, CO',
  'Atlanta, GA', 'Miami, FL', 'Orlando, FL',
  'Portland, OR', 'Phoenix, AZ', 'Salt Lake City, UT',
  'Nashville, TN', 'Raleigh, NC', 'Charlotte, NC',
  
  // Canadian Cities
  'Toronto, ON', 'Vancouver, BC', 'Montreal, QC', 'Ottawa, ON',
  'Calgary, AB', 'Waterloo, ON', 'Kitchener, ON',
  
  // European Cities
  'London, UK', 'Manchester, UK', 'Edinburgh, UK', 'Cambridge, UK',
  'Berlin, DE', 'Munich, DE', 'Hamburg, DE', 'Frankfurt, DE',
  'Amsterdam, NL', 'Rotterdam, NL',
  'Stockholm, SE', 'Gothenburg, SE',
  'Copenhagen, DK', 'Aarhus, DK',
  'Zurich, CH', 'Geneva, CH',
  'Paris, FR', 'Lyon, FR', 'Toulouse, FR',
  'Barcelona, ES', 'Madrid, ES',
  'Rome, IT', 'Milan, IT',
  'Dublin, IE', 'Cork, IE',
  'Oslo, NO', 'Bergen, NO',
  'Helsinki, FI', 'Tampere, FI',
  'Warsaw, PL', 'Krakow, PL',
  'Prague, CZ', 'Brno, CZ',
  'Budapest, HU', 'Vienna, AT',
  
  // Asia Pacific
  'Tokyo, JP', 'Osaka, JP', 'Kyoto, JP',
  'Singapore, SG',
  'Hong Kong, HK',
  'Sydney, AU', 'Melbourne, AU', 'Brisbane, AU', 'Perth, AU',
  'Auckland, NZ', 'Wellington, NZ',
  'Seoul, KR', 'Busan, KR',
  'Taipei, TW', 'Taichung, TW',
  'Bangalore, IN', 'Mumbai, IN', 'Delhi, IN', 'Hyderabad, IN', 'Pune, IN',
  'Tel Aviv, IL', 'Jerusalem, IL',
  'Dubai, AE', 'Abu Dhabi, AE',
  
  // Other Global
  'São Paulo, BR', 'Rio de Janeiro, BR',
  'Mexico City, MX', 'Guadalajara, MX',
  'Buenos Aires, AR',
  'Santiago, CL',
  'Cape Town, ZA', 'Johannesburg, ZA',
  
  // Remote
  'Remote', 'Remote (US)', 'Remote (EU)', 'Remote (Global)'
]

export const skills = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'Clojure', 'Erlang',
  'R', 'MATLAB', 'Perl', 'Shell', 'PowerShell', 'VBA',
  
  // Frontend Technologies
  'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby',
  'HTML5', 'CSS3', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
  'Styled Components', 'Emotion', 'Chakra UI', 'Ant Design',
  'Webpack', 'Vite', 'Parcel', 'Rollup', 'ESLint', 'Prettier',
  
  // Backend Technologies
  'Node.js', 'Express.js', 'Nest.js', 'Fastify', 'Koa.js',
  'Django', 'Flask', 'FastAPI', 'Tornado',
  'Spring Boot', 'Spring Framework', 'Hibernate',
  'ASP.NET Core', 'Entity Framework',
  'Ruby on Rails', 'Sinatra',
  'Laravel', 'Symfony', 'CodeIgniter',
  
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra',
  'DynamoDB', 'CouchDB', 'Neo4j', 'InfluxDB', 'TimescaleDB',
  'SQLite', 'Oracle DB', 'SQL Server', 'MariaDB',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes',
  'Terraform', 'Ansible', 'Chef', 'Puppet', 'Jenkins', 'GitLab CI',
  'GitHub Actions', 'CircleCI', 'Travis CI', 'TeamCity',
  'Nginx', 'Apache', 'HAProxy', 'Load Balancing',
  'Monitoring', 'Logging', 'Prometheus', 'Grafana', 'ELK Stack',
  
  // Data & Analytics
  'SQL', 'Apache Spark', 'Hadoop', 'Kafka', 'Apache Airflow',
  'Pandas', 'NumPy', 'Jupyter', 'Tableau', 'Power BI', 'Looker',
  'ETL', 'Data Warehousing', 'Data Lakes', 'Big Data',
  
  // Machine Learning & AI
  'Machine Learning', 'Deep Learning', 'Neural Networks', 'TensorFlow',
  'PyTorch', 'Keras', 'Scikit-learn', 'OpenCV', 'NLTK', 'spaCy',
  'Computer Vision', 'Natural Language Processing', 'Reinforcement Learning',
  'MLOps', 'Model Deployment', 'Feature Engineering',
  
  // Mobile Development
  'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova',
  'iOS Development', 'Android Development', 'SwiftUI', 'Jetpack Compose',
  
  // Testing & Quality
  'Unit Testing', 'Integration Testing', 'E2E Testing', 'Jest', 'Cypress',
  'Selenium', 'Playwright', 'TestNG', 'JUnit', 'Mocha', 'Chai',
  'Test-Driven Development', 'Behavior-Driven Development',
  
  // Methodologies & Practices
  'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'Microservices',
  'API Design', 'REST', 'GraphQL', 'gRPC', 'Event-Driven Architecture',
  'Domain-Driven Design', 'Clean Architecture', 'SOLID Principles',
  'Design Patterns', 'Code Review', 'Technical Documentation',
  
  // Soft Skills
  'Leadership', 'Team Management', 'Project Management', 'Communication',
  'Problem Solving', 'Critical Thinking', 'Mentoring', 'Collaboration',
  'Stakeholder Management', 'Cross-functional Collaboration'
]

export const firstNames = [
  // Gender-neutral and diverse names
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery',
  'Quinn', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Harper', 'Hayden',
  'Kendall', 'Logan', 'Marley', 'Parker', 'Reese', 'Sage', 'Skyler', 'River',
  
  // Traditional names with diversity
  'Aaliyah', 'Adrian', 'Aisha', 'Akira', 'Amara', 'Amir', 'Ananya', 'Andre',
  'Angela', 'Antonio', 'Aria', 'Arjun', 'Ashley', 'Ava', 'Benjamin', 'Bianca',
  'Carlos', 'Carmen', 'Chen', 'Chloe', 'Christian', 'Christopher', 'Daniel',
  'David', 'Elena', 'Emily', 'Ethan', 'Eva', 'Gabriel', 'Grace', 'Hannah',
  'Hassan', 'Isaac', 'Isabella', 'Jackson', 'Jacob', 'Jade', 'James', 'Jasmine',
  'Jason', 'Jennifer', 'Jessica', 'John', 'Jonathan', 'Jose', 'Joseph', 'Joshua',
  'Juan', 'Julia', 'Justin', 'Kai', 'Kenji', 'Kevin', 'Layla', 'Leo', 'Liam',
  'Lucas', 'Luna', 'Madison', 'Maria', 'Mark', 'Maya', 'Michael', 'Michelle',
  'Miguel', 'Mia', 'Naomi', 'Nathan', 'Nicole', 'Noah', 'Oliver', 'Omar',
  'Priya', 'Rachel', 'Rafael', 'Ryan', 'Samantha', 'Samuel', 'Sarah', 'Sebastian',
  'Sofia', 'Stephen', 'Taro', 'Tyler', 'Victoria', 'William', 'Yuki', 'Zoe'
]

export const lastNames = [
  // Diverse surnames reflecting global tech workforce
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  
  // Asian surnames
  'Chen', 'Wang', 'Zhang', 'Li', 'Liu', 'Yang', 'Huang', 'Wu', 'Zhou', 'Xu',
  'Kim', 'Park', 'Jung', 'Choi', 'Yoon', 'Jang', 'Lim', 'Han', 'Seo', 'Shin',
  'Tanaka', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura',
  'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Matsumoto',
  'Inoue', 'Kimura', 'Hayashi', 'Shimizu', 'Yamazaki', 'Mori', 'Abe', 'Ikeda',
  'Singh', 'Kumar', 'Sharma', 'Gupta', 'Agarwal', 'Verma', 'Mishra', 'Jain',
  'Patel', 'Shah', 'Mehta', 'Desai', 'Modi', 'Joshi', 'Thakkar', 'Amin',
  
  // European surnames
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
  'Becker', 'Schulz', 'Hoffmann', 'Schaefer', 'Koch', 'Bauer', 'Richter',
  'Klein', 'Wolf', 'Schroeder', 'Neumann', 'Schwarz', 'Zimmermann',
  'Andersson', 'Johansson', 'Carlsson', 'Larsson', 'Olsson', 'Persson',
  'Svensson', 'Gustafsson', 'Pettersson', 'Jonsson', 'Jansson', 'Hansson',
  'Nielsen', 'Hansen', 'Andersen', 'Pedersen', 'Christensen', 'Larsen',
  'Sorensen', 'Rasmussen', 'Jorgensen', 'Petersen', 'Madsen', 'Kristensen',
  'Dubois', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard',
  'Durand', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy',
  
  // Other diverse surnames
  'Ali', 'Hassan', 'Mohammed', 'Ahmad', 'Khan', 'Rahman', 'Hussein', 'Ibrahim',
  'Okafor', 'Adebayo', 'Oluwaseun', 'Chukwu', 'Eze', 'Okoro', 'Nwankwo',
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Almeida', 'Cardoso'
]

// Predefined user profiles for more realistic data
export const mockUserProfiles: MockUser[] = [
  {
    username: 'sarah_tech',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    country: 'US',
    isPublic: true,
    applicationCount: 45,
    successRate: 22
  },
  {
    username: 'alex_dev',
    email: 'alex.chen@example.com',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Chen',
    country: 'CA',
    isPublic: true,
    applicationCount: 32,
    successRate: 28
  },
  {
    username: 'priya_ml',
    email: 'priya.sharma@example.com',
    password: 'password123',
    firstName: 'Priya',
    lastName: 'Sharma',
    country: 'IN',
    isPublic: true,
    applicationCount: 38,
    successRate: 31
  },
  {
    username: 'marcus_fullstack',
    email: 'marcus.mueller@example.com',
    password: 'password123',
    firstName: 'Marcus',
    lastName: 'Mueller',
    country: 'DE',
    isPublic: true,
    applicationCount: 28,
    successRate: 25
  },
  {
    username: 'emma_product',
    email: 'emma.wilson@example.com',
    password: 'password123',
    firstName: 'Emma',
    lastName: 'Wilson',
    country: 'GB',
    isPublic: true,
    applicationCount: 41,
    successRate: 34
  },
  {
    username: 'kenji_frontend',
    email: 'kenji.tanaka@example.com',
    password: 'password123',
    firstName: 'Kenji',
    lastName: 'Tanaka',
    country: 'JP',
    isPublic: true,
    applicationCount: 26,
    successRate: 19
  },
  {
    username: 'sofia_data',
    email: 'sofia.rodriguez@example.com',
    password: 'password123',
    firstName: 'Sofia',
    lastName: 'Rodriguez',
    country: 'ES',
    isPublic: true,
    applicationCount: 33,
    successRate: 27
  },
  {
    username: 'liam_devops',
    email: 'liam.oconnor@example.com',
    password: 'password123',
    firstName: 'Liam',
    lastName: "O'Connor",
    country: 'IE',
    isPublic: true,
    applicationCount: 29,
    successRate: 31
  },
  {
    username: 'zoe_mobile',
    email: 'zoe.andersson@example.com',
    password: 'password123',
    firstName: 'Zoe',
    lastName: 'Andersson',
    country: 'SE',
    isPublic: true,
    applicationCount: 37,
    successRate: 24
  },
  {
    username: 'diego_backend',
    email: 'diego.silva@example.com',
    password: 'password123',
    firstName: 'Diego',
    lastName: 'Silva',
    country: 'BR',
    isPublic: true,
    applicationCount: 31,
    successRate: 26
  }
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
  const applicationCount = Math.floor(Math.random() * 40) + 10 // 10-50 applications
  const successRate = Math.floor(Math.random() * 30) + 5 // 5-35% success rate
  
  return {
    username,
    email: `${username}@example.com`,
    password: 'password123', // This will be hashed
    firstName,
    lastName,
    country,
    isPublic: Math.random() > 0.2, // 80% chance of being public
    applicationCount,
    successRate
  }
}

export function generateMockJobApplication(appliedDaysAgo?: number): MockJobApplication {
  const maxDaysAgo = appliedDaysAgo || 90
  const appliedDate = generateRandomDate(maxDaysAgo)
  
  // Status progression based on how old the application is
  const daysOld = Math.floor((new Date().getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
  let status: MockJobApplication['status'] = 'applied'
  
  if (daysOld > 14) {
    const rand = Math.random()
    if (rand < 0.35) status = 'rejected'
    else if (rand < 0.55) status = 'screening'
    else if (rand < 0.72) status = 'interview'
    else if (rand < 0.82) status = 'offer'
    else if (rand < 0.87) status = 'withdrawn'
  } else if (daysOld > 7) {
    const rand = Math.random()
    if (rand < 0.15) status = 'rejected'
    else if (rand < 0.45) status = 'screening'
    else if (rand < 0.65) status = 'interview'
    else if (rand < 0.72) status = 'offer'
  } else if (daysOld > 3) {
    const rand = Math.random()
    if (rand < 0.35) status = 'screening'
    else if (rand < 0.55) status = 'interview'
    else if (rand < 0.6) status = 'offer'
  }

  const jobTitle = getRandomElement(jobTitles)
  const company = getRandomElement(companies)
  const location = getRandomElement(locations)
  const isRemote = location.includes('Remote')
  
  // More realistic salary ranges based on job level, location, and role
  const isSenior = jobTitle.toLowerCase().includes('senior') || 
                   jobTitle.toLowerCase().includes('lead') || 
                   jobTitle.toLowerCase().includes('principal') ||
                   jobTitle.toLowerCase().includes('staff')
  const isJunior = jobTitle.toLowerCase().includes('junior') || 
                   jobTitle.toLowerCase().includes('entry')
  const isManager = jobTitle.toLowerCase().includes('manager') || 
                    jobTitle.toLowerCase().includes('director') ||
                    jobTitle.toLowerCase().includes('cto')
  
  let baseSalary = 90 // Default mid-level
  if (isManager) baseSalary = 140
  else if (isSenior) baseSalary = 120
  else if (isJunior) baseSalary = 65
  
  // Location multipliers
  const highCostAreas = ['San Francisco', 'Palo Alto', 'Mountain View', 'New York', 'Manhattan', 'Zurich', 'London']
  const locationMultiplier = highCostAreas.some(area => location.includes(area)) ? 1.5 :
                           location.includes('Seattle') || location.includes('Boston') || location.includes('Los Angeles') ? 1.3 :
                           location.includes('Austin') || location.includes('Denver') || location.includes('Toronto') ? 1.2 :
                           isRemote ? 1.15 : 1.0
  
  // Company multipliers (Big Tech pays more)
  const bigTech = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Nvidia']
  const companyMultiplier = bigTech.includes(company) ? 1.3 :
                           company.includes('Stripe') || company.includes('Uber') || company.includes('Airbnb') ? 1.2 : 1.0
  
  const adjustedSalary = Math.floor(baseSalary * locationMultiplier * companyMultiplier)
  
  // Currency based on location
  const currency = location.includes('UK') || location.includes('London') || location.includes('Manchester') || location.includes('Edinburgh') ? 'GBP' :
                  location.includes('EU') || location.includes('DE') || location.includes('FR') || location.includes('ES') || 
                  location.includes('NL') || location.includes('SE') || location.includes('DK') ||
                  location.includes('CH') || location.includes('IE') || location.includes('NO') ||
                  location.includes('FI') || location.includes('PL') || location.includes('CZ') ||
                  location.includes('HU') || location.includes('AT') ? 'EUR' :
                  location.includes('JP') ? 'JPY' :
                  location.includes('IN') ? 'INR' :
                  location.includes('CA') ? 'CAD' :
                  location.includes('AU') ? 'AUD' :
                  location.includes('SG') ? 'SGD' :
                  'USD' // Default for US and others

  let salary = Math.random() > 0.15 ? adjustedSalary : undefined
  if (salary) {
    if (currency === 'JPY') salary = salary * 130
    if (currency === 'INR') salary = salary * 75
  }
  
  // Generate relevant tags based on job title and company
  const roleBasedSkills: string[] = []
  if (jobTitle.toLowerCase().includes('frontend') || jobTitle.toLowerCase().includes('ui')) {
    roleBasedSkills.push(...getRandomElements(['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'CSS3', 'HTML5'], 3))
  } else if (jobTitle.toLowerCase().includes('backend')) {
    roleBasedSkills.push(...getRandomElements(['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'API Design'], 3))
  } else if (jobTitle.toLowerCase().includes('full stack')) {
    roleBasedSkills.push(...getRandomElements(['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], 3))
  } else if (jobTitle.toLowerCase().includes('data') || jobTitle.toLowerCase().includes('ml')) {
    roleBasedSkills.push(...getRandomElements(['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas', 'Apache Spark'], 3))
  } else if (jobTitle.toLowerCase().includes('devops') || jobTitle.toLowerCase().includes('cloud')) {
    roleBasedSkills.push(...getRandomElements(['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD'], 3))
  } else if (jobTitle.toLowerCase().includes('mobile')) {
    roleBasedSkills.push(...getRandomElements(['React Native', 'Swift', 'Kotlin', 'Flutter', 'iOS Development'], 2))
  } else if (jobTitle.toLowerCase().includes('product')) {
    roleBasedSkills.push(...getRandomElements(['Product Management', 'Agile', 'Scrum', 'Stakeholder Management'], 2))
  } else {
    roleBasedSkills.push(...getRandomElements(skills, 3))
  }
  
  const additionalSkills = getRandomElements(skills.filter(s => !roleBasedSkills.includes(s)), Math.floor(Math.random() * 3) + 1)
  const allSkills = [...roleBasedSkills, ...additionalSkills]
  
  // Job level and other tags
  const jobLevelTags = []
  if (isSenior) jobLevelTags.push('Senior')
  if (isJunior) jobLevelTags.push('Junior')
  if (isManager) jobLevelTags.push('Leadership', 'Management')
  if (isRemote) jobLevelTags.push('Remote')
  if (Math.random() > 0.7) jobLevelTags.push('Startup')
  if (bigTech.includes(company)) jobLevelTags.push('Big Tech')
  
  // Priority based on company, role, and fit
  let priority: 'low' | 'medium' | 'high' = 'medium'
  if (bigTech.includes(company) || isManager || isSenior) {
    priority = Math.random() < 0.6 ? 'high' : 'medium'
  } else if (isJunior) {
    priority = Math.random() < 0.4 ? 'low' : 'medium'
  } else {
    priority = Math.random() < 0.3 ? 'high' : Math.random() < 0.7 ? 'medium' : 'low'
  }
  
  const statusTags = {
    applied: ['Active'],
    screening: ['Active', 'Screening'],
    interview: ['Active', 'Interview'],
    offer: ['Offer'],
    rejected: ['Rejected'],
    withdrawn: ['Withdrawn']
  }
  
  return {
    jobTitle,
    company,
    location,
    jobPostUrl: Math.random() > 0.3 ? `https://www.linkedin.com/jobs/view/${Math.floor(Math.random() * 999999999)}` : undefined,
    salary,
    salaryCurrency: currency,
    contactName: Math.random() > 0.7 ? `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}` : undefined,
    contactEmail: Math.random() > 0.8 ? `${name.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(/\s/g, '')}.com` : undefined,
    contactPhone: Math.random() > 0.9 ? generatePhoneNumber(currency) : undefined,
    notes: Math.random() > 0.3 ? generateJobNotes(status, company, jobTitle) : undefined,
    status,
    priority,
    appliedDate,
    tags: [...allSkills, ...jobLevelTags, ...statusTags[status]].slice(0, 8) // Limit to 8 tags
  }
}

function generatePhoneNumber(currency: string): string {
  switch (currency) {
    case 'USD':
    case 'CAD':
      return `+1-${Math.floor(Math.random() * 800) + 200}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    case 'GBP':
      return `+44-20-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`
    case 'EUR':
      return `+49-30-${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`
    default:
      return `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
  }
}

function generateJobNotes(status: string, company: string, jobTitle: string): string {
  const notes = [
    `Really excited about this ${jobTitle} opportunity at ${company}. The role seems like a perfect fit for my skills and career goals.`,
    `Found this position through LinkedIn. ${company} has amazing reviews on Glassdoor and the company culture looks fantastic.`,
    `Referred by a colleague who works at ${company}. They spoke highly of the team, work-life balance, and growth opportunities.`,
    `${company} is doing innovative work in their field. Would love to contribute to their mission and make a meaningful impact.`,
    `Applied through their website. The job description aligns perfectly with my experience and what I'm looking for next.`,
    `Met the hiring manager at a tech conference. They encouraged me to apply and seemed genuinely interested in my background.`,
    `The benefits package at ${company} looks comprehensive. Especially interested in their learning budget and remote work policy.`,
    `This is a remote-first company which is perfect for my current situation. Excited about the flexibility and global team.`,
    `They use the exact tech stack I've been wanting to work with. Great opportunity to grow and apply my skills in new ways.`,
    `Fast-growing company with significant recent funding. Could be a great place to make an impact and grow with the team.`,
    `${company} has a strong engineering culture and emphasis on code quality. Looking forward to learning from experienced developers.`,
    `The role offers great mentorship opportunities and a clear career progression path. Exactly what I need at this stage.`,
    `Impressed by their commitment to diversity and inclusion. The team photos and values really resonate with me.`,
    `Applied after attending their tech talk. The engineering challenges they're solving are fascinating and align with my interests.`,
    `Compensation package is competitive and includes equity. Great opportunity to be part of a company's growth story.`
  ]
  
  const statusNotes: Record<string, string[]> = {
    screening: [
      'Completed initial phone screening. Seemed to go well, waiting for next steps.',
      'HR called for a brief chat about the role and my background. Moving to technical round.',
      'Quick screening call scheduled for next week. Preparing talking points about my experience.'
    ],
    interview: [
      'Technical interview scheduled for next week. Reviewing system design and coding problems.',
      'Had a great conversation with the hiring manager. Technical round went well, awaiting feedback.',
      'Completed the coding challenge. Feeling confident about the solution I submitted.',
      'Panel interview with the team scheduled. Excited to learn more about their current projects.'
    ],
    offer: [
      'Received an offer! Reviewing the package and considering the opportunity.',
      'Great news - they extended an offer. Negotiating some details before making a decision.',
      'Offer came in above expectations. Very excited about this opportunity!'
    ],
    rejected: [
      'Unfortunately didn\'t move forward. They mentioned it was a close decision with strong candidates.',
      'Received feedback that they went with someone with more specific experience. Good learning experience.',
      'Not selected for this round, but they encouraged me to apply for future openings.'
    ],
    withdrawn: [
      'Decided to withdraw after learning more about the role. Not the right fit for my career goals.',
      'Withdrew application after accepting another offer. Great company but timing wasn\'t right.',
      'Pulled out due to compensation not meeting expectations after initial discussions.'
    ]
  }
  
  const baseNote = getRandomElement(notes)
  const statusNote = status !== 'applied' && statusNotes[status] ? 
    ' ' + getRandomElement(statusNotes[status]) : ''
  
  return baseNote + statusNote
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