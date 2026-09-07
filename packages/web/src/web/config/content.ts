/**
 * DEFAULT CONTENT.
 *
 * Everything here is the fallback. Live text is stored in the database and
 * edited from /studio, then merged over these defaults at runtime. Editing this
 * file changes the fallback; editing /studio changes the site.
 */

export interface SiteContent {
  profile: {
    name: string;
    role: string;
    tagline: string;
    statusLabel: string;
    company: string;
    companyUrl: string;
    since: string;
    location: string;
    focus: string;
    email: string;
    githubUser: string;
    letterboxdUser: string;
    lastfmUser: string;
  };
  positioning: string[];
  bio: string[];
  quickFacts: string[];
  education: {
    school: string;
    degree: string;
    detail: string;
    period: string;
  };
  experience: Experience[];
  projects: Project[];
  skills: {
    growth: SkillColumn;
    engineering: SkillColumn;
  };
  sharpening: string;
  favouriteFilms: FavouriteFilm[];
  filmsIntro: string;
  musicIntro: string;
  writingIntro: string;
  writing: WritingEntry[];
  resumes: Resume[];
  guestbookIntro: string;
}

/**
 * One card in the home page photo stack. Drop more files into
 * packages/web/public/images/ and append them here (or in /studio) to grow the
 * deck. The first entry is the card on top.
 */
export interface Photo {
  src: string;
  alt?: string;
}

/**
 * Proof of work attached to a job: dashboards, post screenshots, charts.
 * Upload them from /studio, which writes the storage path in here. They render
 * as a thumbnail strip under the bullets and open full size in a lightbox.
 */
export interface Shot {
  src: string;
  caption?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  current?: boolean;
  kind: "growth" | "engineering" | "community";
  points: string[];
  stack?: string[];
  shots?: Shot[];
}

export interface Project {
  name: string;
  repo?: string;
  blurb: string;
  detail: string;
  stack: string[];
}

export interface SkillColumn {
  label: string;
  groups: { title: string; items: string[] }[];
}

export interface FavouriteFilm {
  title: string;
  year: string;
  director: string;
  note: string;
  poster: string;
  url: string;
}

export interface WritingEntry {
  name: string;
  handle: string;
  url: string;
  icon: string;
  blurb: string;
  topics: string[];
}

/**
 * A downloadable CV.
 *
 * ORDER IS MEANING: the first entry is the main CV and gets the prominent
 * treatment everywhere it appears. Everything after it is a secondary cut,
 * offered quietly for the people who want that angle instead. Reorder from
 * /studio to change which one leads.
 *
 * `href` is either a file in packages/web/public/files/ or an /api/files/...
 * path once a PDF has been uploaded from the studio.
 */
export interface Resume {
  label: string;
  note: string;
  href: string;
}

export const defaultContent: SiteContent = {
  profile: {
    name: "Aryan",
    role: "Growth Engineer",
    tagline: "Working with growth systems and learning how to scale them.",
    statusLabel: "Growth Engineer Intern",
    company: "Runable",
    companyUrl: "https://runable.com",
    since: "8 July 2026",
    location: "On-site, Bengaluru",
    focus: "Reddit Growth, Content Ops",
    email: "aryangrajput13@gmail.com",
    githubUser: "aryqn13",
    letterboxdUser: "aryqn13",
    lastfmUser: "aryan_91",
  },

  photos: [{ src: "/images/avatar.png", alt: "Aryan" }],

  positioning: [
    "I build the systems that distribute a product,",
    "and the software those systems run on.",
  ],

  /**
   * Wrap a phrase in **double asterisks** to render it in the accent colour.
   * Works here and in /studio. Keep it to a few phrases per paragraph.
   */
  bio: [
    "I work in **growth at Runable** and write the code around it, which is a polite way of saying I could not decide between the two and stopped pretending I had to.",
    "Most of my day is **Reddit**, the one channel that punishes marketing on sight. The only strategy that survives there is being genuinely useful and shutting up about your product roughly 80 percent of the time. That worked, so I moved into **Content Operations** and turned it into a workflow other people can run without me in the room.",
    "The engineering half is not decorative. I wrote an **autograd engine in plain Python**, rebuilt the Transformer straight from the paper, and shipped a FastAPI and Postgres backend with real auth and migrations, after five months of enterprise React. Outside that it is films, music and football, plus 18 months running a 200 member community, which taught me that community work and growth work are the same job in different clothes. Right now I am getting properly good at **full stack TypeScript**.",
  ],

  quickFacts: [
    "Applied AI training programme, SVNIT Surat, 2025",
    "Designer, Literature Club, SVIT Students' Committee",
    "Built a 200 member music community from zero",
    "A film a week, logged without exception",
    "Real Madrid, for my sins",
  ],

  education: {
    school: "Sardar Vallabhbhai Patel Institute of Technology",
    degree: "B.E. Computer Science and Design",
    detail: "CGPA 8.19 / 10, Gujarat Technological University",
    period: "Aug 2022 to Jul 2026",
  },

  experience: [
    {
      company: "Runable",
      role: "Growth Engineer Intern",
      period: "Jul 2026 to Present",
      location: "On-site, Bengaluru",
      current: true,
      kind: "growth",
      points: [
        "Joined on 8 July 2026 to run Reddit Growth, an organic community first distribution motion for an AI workspace product, built on being useful rather than promotional.",
        "Now also working inside the Growth Team's Content Operations, turning distribution learnings into repeatable workflows, briefs and cadences other contributors can execute without supervision.",
        "Own the operating layer end to end: weekly phased workflows, contributor tiers, content guidelines and the support loop that holds quality steady as the program scales.",
      ],
      stack: ["Reddit", "Content Ops", "Community-Led Growth", "Workflow Design"],
    },
    {
      company: "Runable",
      role: "Growth Affiliate Contributor",
      period: "Mar 2026 to Jul 2026",
      location: "Remote",
      kind: "growth",
      points: [
        "Ran a Reddit first organic motion across tech communities, surfacing real use cases without tripping spam signals, with promotional mentions held under a quarter of everything posted.",
        "Recognised as a top performing contributor across the affiliate program for consistency, engagement quality and non promotional reach.",
        "Converted into the Growth Engineer Intern role off the back of it.",
      ],
      stack: ["Reddit", "Organic Distribution", "Audience Research"],
    },
    {
      company: "Horizontal Integration India",
      role: "SDE / DX Intern",
      period: "Jan 2026 to May 2026",
      location: "Vadodara",
      kind: "engineering",
      points: [
        "Built a modular frontend system for an enterprise training portal across 10+ routed views using React, TypeScript, Tailwind and React Router.",
        "Shipped 25+ reusable components on Atomic Design principles, cutting UI duplication by around 30 percent.",
        "Built JSON driven rendering and a component registry so navigation, categories and training content generated dynamically instead of being hardcoded.",
        "Structured state handling plus TypeScript driven validation cut development turnaround by around 20 percent.",
      ],
      stack: ["React", "TypeScript", "Tailwind", "Atomic Design"],
    },
    {
      company: "B-Leaf Music Community",
      role: "Community Admin",
      period: "Oct 2024 to Apr 2026",
      location: "Discord, Remote",
      kind: "community",
      points: [
        "Built and scaled a 200+ member fan community for independent musician B-Leaf, including onboarding flows, role structures, moderation workflows and guidelines from scratch.",
        "Hosted recurring live sessions drawing 15 to 40 participants, coordinating directly with the artist on drops and engagement pushes.",
      ],
      stack: ["Discord", "Moderation", "Events"],
    },
    {
      company: "Rasla & Bhadrankar",
      role: "Event Operations & Partnerships",
      period: "May 2026",
      location: "Vadodara",
      kind: "community",
      points: [
        "Co-organised a 50+ attendee album listening party inside a three day planning window, covering venue, artist requirements, audience logistics and partnerships.",
        "Negotiated venue partnerships that brought total event cost to zero while keeping terms favourable for everyone involved.",
      ],
      stack: ["Ops", "Partnerships"],
    },
  ],

  projects: [
    {
      name: "Gradcore",
      repo: "gradcore",
      blurb: "A scalar autograd engine and mini neural net library, built from nothing.",
      detail:
        "Wrote the backward pass by hand in plain Python with NumPy and no ML libraries, because using backprop without understanding it felt like cheating.",
      stack: ["Python", "NumPy"],
    },
    {
      name: "ML Paper Reproductions",
      blurb: "Foundational architectures rebuilt straight from the papers.",
      detail:
        "Implemented the Transformer from Attention Is All You Need, including positional encodings, multi head attention, masking and encoder decoder attention, plus other reproductions, to build real intuition for sequence modelling and gradient flow.",
      stack: ["PyTorch", "NumPy", "Deep Learning"],
    },
    {
      name: "AddStack",
      repo: "addstack",
      blurb: "A RESTful backend with 15+ endpoints, done properly.",
      detail:
        "Auth, post management, voting and content retrieval on FastAPI and PostgreSQL. Normalised schema with SQLAlchemy and Alembic migrations, JWT auth with password hashing, Pydantic validation throughout.",
      stack: ["FastAPI", "PostgreSQL", "SQLAlchemy", "Alembic", "JWT"],
    },
  ],

  skills: {
    growth: {
      label: "Growth & GTM",
      groups: [
        {
          title: "Distribution",
          items: [
            "Reddit Marketing",
            "Community-Led Growth",
            "Organic Product Distribution",
            "Spam-Safe Content Strategy",
            "Subreddit Dynamics",
          ],
        },
        {
          title: "Operations",
          items: [
            "Content Operations",
            "Workflow Design",
            "Affiliate Programs",
            "Creator Relations",
            "Event Operations",
          ],
        },
        {
          title: "Research",
          items: ["Audience Research", "Positioning", "ICP Mapping", "Reporting"],
        },
      ],
    },
    engineering: {
      label: "Engineering",
      groups: [
        {
          title: "Languages",
          items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML/CSS"],
        },
        {
          title: "Web",
          items: ["React", "Tailwind CSS", "FastAPI", "REST APIs"],
        },
        {
          title: "Data & ML",
          items: [
            "PostgreSQL",
            "SQLAlchemy",
            "SQLite",
            "PyTorch",
            "Scikit-learn",
            "Hugging Face",
            "NumPy",
            "Pandas",
          ],
        },
        {
          title: "Tooling",
          items: ["Git / GitHub", "bash", "npm", "uv", "Figma", "Notion", "LaTeX"],
        },
      ],
    },
  },

  sharpening:
    "Currently sharpening full stack TypeScript, so the distance between an idea and something running in production keeps getting shorter.",

  favouriteFilms: [
    {
      title: "Pyaasa",
      year: "1957",
      director: "Guru Dutt",
      note: "Nobody has framed loneliness that beautifully since.",
      poster: "/images/films/pyaasa.jpg",
      url: "https://letterboxd.com/film/pyaasa/",
    },
    {
      title: "Fallen Angels",
      year: "1995",
      director: "Wong Kar-wai",
      note: "Doyle shooting neon like it owes him money.",
      poster: "/images/films/fallen-angels.jpg",
      url: "https://letterboxd.com/film/fallen-angels/",
    },
    {
      title: "Rashomon",
      year: "1950",
      director: "Akira Kurosawa",
      note: "Four people, one crime, zero reliable narrators.",
      poster: "/images/films/rashomon.jpg",
      url: "https://letterboxd.com/film/rashomon/",
    },
    {
      title: "No Other Choice",
      year: "2025",
      director: "Park Chan-wook",
      note: "Job market so bad, bro had to eliminate his competition.",
      poster: "/images/films/no-other-choice.jpg",
      url: "https://letterboxd.com/film/no-other-choice-2025/",
    },
  ],

  filmsIntro:
    "Roughly a film a week, logged without exception and reviewed with more confidence than qualification. Pulled live from Letterboxd.",

  musicIntro:
    "Mostly Indian hip hop, film scores and whatever the algorithm cannot explain. The scrobbles are the honest version, the playlists are the curated lie.",

  writingIntro:
    "Two places, two moods. Substack is where the thinking goes when it needs room. Medium is the older technical stuff I have not deleted.",

  writing: [
    {
      name: "Substack",
      handle: "@aryqn",
      url: "https://substack.com/@aryqn",
      icon: "substack",
      blurb:
        "Longer pieces on growth systems, distribution and why most marketing advice does not survive contact with Reddit.",
      topics: ["Growth Systems", "Distribution", "Content Ops", "Film Tangents"],
    },
    {
      name: "Medium",
      handle: "@aryangrajput13",
      url: "https://medium.com/@aryangrajput13",
      icon: "medium",
      blurb:
        "Older technical writing from the machine learning and backend rabbit holes, kept up mostly for the receipts.",
      topics: ["Machine Learning", "Backend", "Python", "Notes"],
    },
  ],

  resumes: [
    {
      label: "Growth / GTM",
      note: "Distribution, content ops, community",
      href: "/files/Aryan-Rajput-Growth-GTM.pdf",
    },
    {
      label: "Software Engineering",
      note: "Backend, frontend, applied ML",
      href: "/files/Aryan-Rajput-SWE.pdf",
    },
  ],

  guestbookIntro:
    "No login, no email capture. Leave a mark, a recommendation, or an argument about a film.",
};

export const pages = [
  { path: "/", label: "Home", index: "01" },
  { path: "/work", label: "Work", index: "02" },
  { path: "/interests", label: "Interests", index: "03" },
  { path: "/writing", label: "Writing", index: "04" },
  { path: "/elsewhere", label: "Elsewhere", index: "05" },
];
