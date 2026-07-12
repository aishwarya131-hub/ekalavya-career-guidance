const mongoose = require('mongoose');
const College = require('./server/models/College');

const sampleColleges = [
  {
    name: "Indian Institute of Technology Bombay",
    slug: "iit-bombay",
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400076"
    },
    type: "Government",
    rating: 4.8,
    reviews: 1250,
    accreditations: ["UGC", "AICTE", "NBA", "NAAC A++"],
    feeRange: {
      min: 25000,
      max: 300000,
      raw: "25,000 - 3,00,000"
    },
    avgPackage: "20 LPA",
    nirfRank: 3,
    entranceExams: ["JEE Advanced", "GATE"],
    courses: [
      {
        name: "B.Tech Computer Science Engineering",
        level: "UG",
        duration: "4 Years",
        fees: 250000,
        feesRaw: "2.5 Lacs per year",
        mode: "Full Time",
        specialization: "AI/ML"
      },
      {
        name: "B.Tech Mechanical Engineering",
        level: "UG", 
        duration: "4 Years",
        fees: 200000,
        feesRaw: "2 Lacs per year",
        mode: "Full Time",
        specialization: "Thermal Engineering"
      },
      {
        name: "M.Tech Computer Science",
        level: "PG",
        duration: "2 Years", 
        fees: 50000,
        feesRaw: "50,000 per year",
        mode: "Full Time",
        specialization: "Artificial Intelligence"
      }
    ],
    shortlistedBy: 8500,
    totalCourses: 45
  },
  {
    name: "Delhi University",
    slug: "delhi-university",
    location: {
      city: "New Delhi",
      state: "Delhi",
      pincode: "110007"
    },
    type: "Government",
    rating: 4.6,
    reviews: 2100,
    accreditations: ["UGC", "NAAC A+"],
    feeRange: {
      min: 5000,
      max: 50000,
      raw: "5,000 - 50,000"
    },
    avgPackage: "8 LPA",
    nirfRank: 12,
    entranceExams: ["CUET"],
    courses: [
      {
        name: "B.Sc Computer Science",
        level: "UG",
        duration: "3 Years",
        fees: 10000,
        feesRaw: "10,000 per year",
        mode: "Full Time",
        specialization: "Computer Science"
      },
      {
        name: "B.Com Honors",
        level: "UG",
        duration: "3 Years", 
        fees: 8000,
        feesRaw: "8,000 per year",
        mode: "Full Time",
        specialization: "Accounting"
      },
      {
        name: "BA Economics Honors",
        level: "UG",
        duration: "3 Years",
        fees: 12000,
        feesRaw: "12,000 per year", 
        mode: "Full Time",
        specialization: "Economics"
      }
    ],
    shortlistedBy: 12000,
    totalCourses: 120
  },
  {
    name: "National Institute of Technology Karnataka",
    slug: "nit-karnataka",
    location: {
      city: "Surathkal",
      state: "Karnataka",
      pincode: "575025"
    },
    type: "Government",
    rating: 4.5,
    reviews: 980,
    accreditations: ["UGC", "AICTE", "NBA", "NAAC A+"],
    feeRange: {
      min: 35000,
      max: 250000,
      raw: "35,000 - 2,50,000"
    },
    avgPackage: "15 LPA",
    nirfRank: 21,
    entranceExams: ["JEE Main", "GATE"],
    courses: [
      {
        name: "B.Tech Information Technology",
        level: "UG",
        duration: "4 Years",
        fees: 180000,
        feesRaw: "1.8 Lacs per year",
        mode: "Full Time",
        specialization: "Software Engineering"
      },
      {
        name: "B.Tech Electronics and Communication",
        level: "UG",
        duration: "4 Years",
        fees: 170000,
        feesRaw: "1.7 Lacs per year",
        mode: "Full Time",
        specialization: "VLSI Design"
      }
    ],
    shortlistedBy: 6500,
    totalCourses: 35
  },
  {
    name: "Anna University",
    slug: "anna-university",
    location: {
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600025"
    },
    type: "Government",
    rating: 4.4,
    reviews: 1500,
    accreditations: ["UGC", "AICTE", "NBA", "NAAC A++"],
    feeRange: {
      min: 15000,
      max: 150000,
      raw: "15,000 - 1,50,000"
    },
    avgPackage: "7 LPA",
    nirfRank: 18,
    entranceExams: ["TANCET", "JEE Main"],
    courses: [
      {
        name: "B.E Mechanical Engineering",
        level: "UG",
        duration: "4 Years",
        fees: 80000,
        feesRaw: "80,000 per year",
        mode: "Full Time",
        specialization: "Automobile"
      },
      {
        name: "B.E Computer Science Engineering",
        level: "UG",
        duration: "4 Years",
        fees: 120000,
        feesRaw: "1.2 Lacs per year",
        mode: "Full Time",
        specialization: "Data Science"
      }
    ],
    shortlistedBy: 9800,
    totalCourses: 55
  },
  {
    name: "Banaras Hindu University",
    slug: "bhu",
    location: {
      city: "Varanasi",
      state: "Uttar Pradesh",
      pincode: "221005"
    },
    type: "Government",
    rating: 4.3,
    reviews: 1800,
    accreditations: ["UGC", "AICTE", "NAAC A++"],
    feeRange: {
      min: 8000,
      max: 80000,
      raw: "8,000 - 80,000"
    },
    avgPackage: "9 LPA",
    nirfRank: 25,
    entranceExams: ["BHU UET", "JEE Main"],
    courses: [
      {
        name: "B.Sc Agriculture",
        level: "UG",
        duration: "4 Years",
        fees: 15000,
        feesRaw: "15,000 per year",
        mode: "Full Time",
        specialization: "Agricultural Science"
      },
      {
        name: "B.Tech Chemical Engineering",
        level: "UG",
        duration: "4 Years",
        fees: 60000,
        feesRaw: "60,000 per year",
        mode: "Full Time",
        specialization: "Process Engineering"
      }
    ],
    shortlistedBy: 7200,
    totalCourses: 85
  }
];

async function seedColleges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ekalavya');
    console.log('Connected to MongoDB');

    // Clear existing colleges
    await College.deleteMany({});
    console.log('Cleared existing colleges');

    // Insert sample colleges
    await College.insertMany(sampleColleges);
    console.log(`Inserted ${sampleColleges.length} sample colleges`);

    console.log('College seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding colleges:', error);
    process.exit(1);
  }
}

seedColleges();
