import { FaReact, FaVuejs, FaAngular, FaNodeJs, FaPython, FaDocker, FaAws, FaJsSquare, FaCss3Alt, FaHtml5 } from 'react-icons/fa';
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiSupabase, SiExpress, SiFigma, SiFirebase, SiPostgresql, SiMongodb } from 'react-icons/si';

// Map stack names to their corresponding React Icon components
export const stackIcons: { [key: string]: React.ElementType } = {
  'Next.js': SiNextdotjs,
  'React.js': FaReact,
  'TypeScript': SiTypescript,
  'TailwindCSS': SiTailwindcss,
  'Supabase': SiSupabase,
  'Node.js': FaNodeJs,
  'Express.js': SiExpress,
  'Python': FaPython,
  'Docker': FaDocker,
  'AWS': FaAws,
  'JavaScript': FaJsSquare,
  'CSS': FaCss3Alt,
  'HTML': FaHtml5,
  'Vue.js': FaVuejs,
  'Angular': FaAngular,
  'Figma': SiFigma,
  'Firebase': SiFirebase,
  'PostgreSQL': SiPostgresql,
  'MongoDB': SiMongodb,
  // Add more as needed
};


export const mockPortfolios = [
  {
    "id": "1be34e0f-1378-4150-8f2a-c680f8ee53cb",
    "title": "Pomoro",
    "slug": "pomoro",
    "description": "Simple Pomodoro and Todo List App built with Next.js, TS, Tailwind CSS and Zustand.",
    "image": "https://cdn.aulianza.com/website/portfolio/7aec1ff7-3c26-47cb-b2f1-997d89fc7a8d.webp",
    "link_demo": "https://pomoro.vercel.app/",
    "link_github": "https://github.com/aulianza/pomoro",
    "is_show": 1,
    "updated_at": "2025-12-19T06:00:27.896Z",
    "content": "",
    "is_featured": 1,
    "color": "#3b82f6",
    "client": "",
    "created_at": "2023-07-20T12:29:09.882Z",
    "deliverables": [],
    "services": [],
    "video": "",
    "stacks": [
      "Next.js",
      "React.js",
      "TypeScript",
      "TailwindCSS",
      "Zustand"
    ]
  },
  {
    "id": "2c5d6e7f-4567-8901-2345-67890abcdef1",
    "title": "E-commerce Store",
    "slug": "ecommerce-store",
    "description": "Full-stack e-commerce platform with user authentication, product catalog, and payment gateway integration.",
    "image": "https://images.unsplash.com/photo-1572973741165-cd66810c0e5a?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "link_demo": "https://ecommerce.example.com/",
    "link_github": "https://github.com/example/ecommerce",
    "is_show": 1,
    "updated_at": "2025-11-01T10:30:00.000Z",
    "content": "",
    "is_featured": 0,
    "color": "#f97316",
    "client": "Retail Co.",
    "created_at": "2024-01-15T09:00:00.000Z",
    "deliverables": ["Web Application", "Admin Panel"],
    "services": ["Development", "Consulting"],
    "video": "",
    "stacks": [
      "Next.js",
      "React.js",
      "TypeScript",
      "TailwindCSS",
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Stripe"
    ]
  },
  {
    "id": "3d6e7f8a-1234-5678-9012-34567bcdef2a",
    "title": "Task Manager API",
    "slug": "task-manager-api",
    "description": "Robust RESTful API for managing tasks, users, and projects with authentication and authorization.",
    "image": "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1812&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "link_demo": "",
    "link_github": "https://github.com/example/task-api",
    "is_show": 1,
    "updated_at": "2025-10-20T14:15:00.000Z",
    "content": "",
    "is_featured": 1,
    "color": "#10b981",
    "client": "Internal",
    "created_at": "2023-11-01T11:00:00.000Z",
    "deliverables": ["API Documentation"],
    "services": ["Backend Development"],
    "video": "",
    "stacks": [
      "Node.js",
      "Express.js",
      "TypeScript",
      "MongoDB",
      "Docker"
    ]
  },
  {
    "id": "4e7f8a9b-2345-6789-0123-45678cdef3b",
    "title": "Blog Platform",
    "slug": "blog-platform",
    "description": "Modern blog platform with rich text editor, SEO optimization, and comment system.",
    "image": "https://images.unsplash.com/photo-1504711432028-202242fd198d?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "link_demo": "https://blog.example.com/",
    "link_github": "https://github.com/example/blog",
    "is_show": 0,
    "updated_at": "2025-09-10T16:00:00.000Z",
    "content": "",
    "is_featured": 0,
    "color": "#ec4899",
    "client": "Personal Project",
    "created_at": "2024-03-01T13:00:00.000Z",
    "deliverables": ["Web Application"],
    "services": ["Development"],
    "video": "",
    "stacks": [
      "React.js",
      "JavaScript",
      "TailwindCSS",
      "Firebase"
    ]
  }
];
