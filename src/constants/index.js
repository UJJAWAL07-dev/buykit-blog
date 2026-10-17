import {
  FaBrain,
  FaMobileAlt,
  FaCode,
  FaMicrochip,
  FaGlobe,
  FaShieldAlt,
  FaBookOpen,
  FaStar,
} from "react-icons/fa";
import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  meta,
  starbucks,
  tesla,
  shopify,
  carrent,
  jobit,
  tripguide,
  threejs,
  weather,
  calendar,
  restaurant,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "skills",
    title: "Skills",
  },
  {
    id: "projects",
    title: "Projects",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Tech Insights",
    icon: web,
  },
  {
    title: "AI & Future Tech",
    icon: mobile,
  },
  {
    title: "Gadgets & Software",
    icon: backend,
  },
  {
    title: "Guides & Reviews",
    icon: creator,
  },
];

const technologies = [
  {
    name: "AI & Machine Learning",
    icon: FaBrain,
    label: "EXPLORE",
  },
  {
    name: "Gadgets & Devices",
    icon: FaMobileAlt,
    label: "DISCOVER",
  },
  {
    name: "Apps & Software",
    icon: FaCode,
    label: "DISCOVER",
  },
  {
    name: "Emerging Technology",
    icon: FaMicrochip,
    label: "EXPLORE",
  },
  {
    name: "Internet & Web",
    icon: FaGlobe,
    label: "EXPLORE",
  },
  {
    name: "Cybersecurity",
    icon: FaShieldAlt,
    label: "LEARN",
  },
  {
    name: "How-To & Guides",
    icon: FaBookOpen,
    label: "LEARN",
  },
  {
    name: "Reviews & Insights",
    icon: FaStar,
    label: "READ",
  },
];

const experiences = [
  {
    title: "BuyKit Is Born",
    company_name: "The Beginning",
    icon: "/buykit.jpg",
    iconBg: "#383E56",
    date: "Phase 01",
    skills: ["Vision", "Foundation", "Digital Platform", "BuyKit"],
    points: [
      "BuyKit was created with the vision of building a platform that could bring useful digital resources, people, and technology together under one roof.",
      "The initial concept focused on creating something flexible that could evolve with changing needs in the digital world.",
      "This foundation became the starting point for the different directions BuyKit would explore over time.",
    ],
  },

  {
    title: "Creator Connect",
    company_name: "Influencer Guiding Platform",
    icon: "/buykit.jpg",
    iconBg: "#E6DEDD",
    date: "Phase 02",
    skills: ["Influencers", "Freelancers", "Creators", "Collaboration"],
    points: [
      "BuyKit evolved into a platform designed to help influencers and creators find the right freelancers for their projects.",
      "The platform aimed to make it easier for creators to discover people with the skills needed to turn their ideas into reality.",
      "This phase focused on connecting creators with the right talent and making digital collaboration simpler.",
    ],
  },

  {
    title: "BuyKit Tools",
    company_name: "Digital Utility Platform",
    icon: "/buykit.jpg",
    iconBg: "#383E56",
    date: "Phase 03",
    skills: ["Tools", "Productivity", "Image To PDF", "Utilities"],
    points: [
      "BuyKit expanded beyond creator connections and began providing useful online tools for everyday digital tasks.",
      "Tools such as image-to-PDF conversion were introduced to make common file and productivity tasks faster and easier.",
      "The focus shifted toward building simple, accessible utilities that anyone could use without unnecessary complexity.",
    ],
  },

  {
    title: "BuyKit Insights",
    company_name: "Technology Blogging Platform",
    icon: "/buykit.jpg",
    iconBg: "#E6DEDD",
    date: "Phase 04 - Present",
    skills: ["Technology", "AI", "Gadgets", "Insights"],
    points: [
      "BuyKit is now evolving into a technology-focused blogging platform covering AI, software, gadgets, emerging technologies, and digital trends.",
      "The goal is to make technology easier to understand through useful insights, practical guides, discoveries, and engaging perspectives.",
      "This marks the next chapter of BuyKit — a platform built to explore what is happening in technology today and what could shape tomorrow.",
    ],
  },
];

const testimonials = [
  {
    testimonial:
      "I thought it was impossible to make a website as beautiful as our product, but Tanmay proved me wrong.",
    name: "Sara Lee",
    designation: "CFO",
    company: "Acme Co",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    date: "March 2024",
  },
  {
    testimonial:
      "I've never met a web developer who truly cares about their clients' success like Tanmay does.",
    name: "Chris Brown",
    designation: "COO",
    company: "DEF Corp",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    date: "July 2024",
  },
  {
    testimonial:
      "After Tanmay optimized our website, our traffic increased by 50%. We can't thank them enough!",
    name: "Lisa Wang",
    designation: "CTO",
    company: "456 Enterprises",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    date: "November 2024",
  },
];

const articles = [
  {
    slug: "future-of-ai",
    title: "The Future of AI",
    description:
      "Artificial intelligence is rapidly transforming the way we work, create, communicate, and interact with technology. Here's what the future could look like.",
    category: "AI & Future Tech",
    date: "October 2026",
    readTime: "6 min read",
    tags: [
      {
        name: "AI",
        color: "blue-text-gradient",
      },
      {
        name: "Future Tech",
        color: "green-text-gradient",
      },
      {
        name: "Innovation",
        color: "pink-text-gradient",
      },
    ],
    image: "/future of ai.webp",
  },

  {
    slug: "tech-tools-you-should-know",
    title: "Tech Tools You Should Know",
    description:
      "Discover powerful technology tools that can make everyday digital work faster, smarter, and more productive.",
    category: "Tech Tools",
    date: "October 2026",
    readTime: "5 min read",
    tags: [
      {
        name: "Tools",
        color: "blue-text-gradient",
      },
      {
        name: "Software",
        color: "green-text-gradient",
      },
      {
        name: "Productivity",
        color: "pink-text-gradient",
      },
    ],
    image: "/tech tools.jpg",
  },

  {
    slug: "ai-is-changing-how-we-work",
    title: "AI Is Changing How We Work",
    description:
      "AI is moving beyond experiments and becoming part of everyday workflows. Explore how intelligent tools are changing the way people work and create.",
    category: "Artificial Intelligence",
    date: "October 2026",
    readTime: "5 min read",
    tags: [
      {
        name: "AI",
        color: "blue-text-gradient",
      },
      {
        name: "Work",
        color: "green-text-gradient",
      },
      {
        name: "Technology",
        color: "pink-text-gradient",
      },
    ],
    image: "/working ai.jpg",
  },

  {
    slug: "gadgets-shaping-tomorrow",
    title: "The Gadgets Shaping Tomorrow",
    description:
      "From smarter devices to futuristic hardware, discover the gadgets pushing technology forward and changing how we interact with the digital world.",
    category: "Gadgets",
    date: "October 2026",
    readTime: "5 min read",
    tags: [
      {
        name: "Gadgets",
        color: "blue-text-gradient",
      },
      {
        name: "Hardware",
        color: "green-text-gradient",
      },
      {
        name: "Future Tech",
        color: "pink-text-gradient",
      },
    ],
    image: "/gadgets.webp",
  },

  {
    slug: "ai-changing-the-internet",
    title: "How AI Is Changing the Internet",
    description:
      "Search, content, social platforms, recommendations and the way we discover information are all being transformed by artificial intelligence.",
    category: "Internet & AI",
    date: "October 2026",
    readTime: "6 min read",
    tags: [
      {
        name: "AI",
        color: "blue-text-gradient",
      },
      {
        name: "Internet",
        color: "green-text-gradient",
      },
      {
        name: "Digital",
        color: "pink-text-gradient",
      },
    ],
    image: "/internet.jpg",
  },

  {
    slug: "cybersecurity-what-you-need-to-know",
    title: "Cybersecurity: What You Need to Know",
    description:
      "As more of our lives move online, understanding digital security is becoming essential. Here's what everyone should know about staying safer online.",
    category: "Cybersecurity",
    date: "October 2026",
    readTime: "7 min read",
    tags: [
      {
        name: "Security",
        color: "blue-text-gradient",
      },
      {
        name: "Privacy",
        color: "green-text-gradient",
      },
      {
        name: "Cybersecurity",
        color: "pink-text-gradient",
      },
    ],
    image: "/security.jpg",
  },
];

export { services, technologies, experiences, testimonials, articles };
