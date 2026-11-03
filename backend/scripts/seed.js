/**
 * CyberSafe Database Seed Script
 * Creates the initial administrator and populates existing educational modules and lessons.
 * Usage: node scripts/seed.js [username] [password]
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabase, pgPool, checkConnection } = require('../src/config/database');

const adminUsername = process.env.INITIAL_ADMIN_USERNAME || process.argv[2];
const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || process.argv[3];

const initialModules = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    slug: 'intro',
    title: 'Introduction to Cybersecurity',
    description: 'Understand what cybersecurity means, why it matters, and how awareness protects students online.',
    category: 'Foundations',
    order_index: 1,
    points: [
      'What cybersecurity means and why it matters to students.',
      'Core ideas such as protecting accounts, devices, and personal data.',
      'How everyday habits reduce risk online.',
      'Where to start with the CyberSafe lessons and quizzes.'
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    slug: 'threats',
    title: 'Common Cyber Threats',
    description: 'Recognize phishing, malware, ransomware, online scams, and social engineering before they catch you.',
    category: 'Threats',
    order_index: 2,
    points: [
      'Phishing attacks and urgent online scams.',
      'Malware, viruses, and ransomware.',
      'Social engineering tactics that exploit trust.',
      'How to verify messages and downloads before acting.'
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    slug: 'passwords',
    title: 'Password Security',
    description: 'Build strong password habits and add extra protection with multi-factor authentication.',
    category: 'Accounts',
    order_index: 3,
    points: [
      'Creating strong, unique passwords.',
      'Protecting passwords and using a password manager.',
      'Adding multi-factor authentication.',
      'Avoiding common password mistakes.'
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    slug: 'privacy',
    title: 'Online Privacy and Data Protection',
    description: 'Protect personal information, share safely on social media, and take control of privacy settings.',
    category: 'Privacy',
    order_index: 4,
    points: [
      'Protecting personal information.',
      'Understanding data privacy and your digital footprint.',
      'Sharing safely on social media.',
      'Reviewing privacy settings and app permissions.'
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    slug: 'browsing',
    title: 'Safe Internet Practices',
    description: 'Browse confidently, spot suspicious sites and links, and avoid unsafe downloads.',
    category: 'Browsing',
    order_index: 5,
    points: [
      'Safe browsing habits.',
      'Recognizing suspicious websites and links.',
      'Avoiding unsafe downloads.',
      'Using the internet responsibly.'
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    slug: 'citizenship',
    title: 'Cyber Ethics and Responsibility',
    description: 'Use technology responsibly, respect privacy, and practice ethical behavior online.',
    category: 'Community',
    order_index: 6,
    points: [
      'Responsible use of technology.',
      'Respecting other people\'s privacy.',
      'Cyberbullying awareness and support.',
      'Ethical online behavior.'
    ]
  }
];

const initialLessons = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    module_id: '11111111-1111-1111-1111-111111111103',
    slug: 'passwords',
    title: 'Password Security',
    description: 'Create strong, unique passwords and add an extra layer of protection with two-factor authentication.',
    content: 'A strong password is your first line of defense. The goal is to make each important account difficult to guess and impossible to reuse.\n\n• Use a long, unique passphrase for every important account.\n• Turn on two-factor authentication wherever it is offered.\n• Store passwords in a trusted password manager, not a notes app.',
    category: 'Accounts',
    order_index: 1,
    points: [
      'Use a long, unique passphrase for every important account.',
      'Turn on two-factor authentication wherever it is offered.',
      'Store passwords in a trusted password manager, not a notes app.'
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    module_id: '11111111-1111-1111-1111-111111111102',
    slug: 'phishing',
    title: 'Phishing and Online Scams',
    description: 'Spot suspicious messages, fake links, and urgent requests before they can catch you off guard.',
    content: 'Phishing messages imitate people or services you trust and use urgency to make you act before you think.\n\n• Check the sender address, not just the display name.\n• Hover over links to preview the real destination before clicking.\n• Verify unexpected requests through a separate, trusted channel.',
    category: 'Threats',
    order_index: 2,
    points: [
      'Check the sender address, not just the display name.',
      'Hover over links to preview the real destination before clicking.',
      'Verify unexpected requests through a separate, trusted channel.'
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    module_id: '11111111-1111-1111-1111-111111111104',
    slug: 'privacy',
    title: 'Social Media Privacy',
    description: 'Take control of what you share, who can see it, and how your online footprint grows.',
    content: 'Everything you post contributes to your digital footprint. Thoughtful privacy settings limit who can see it and how it can be used.\n\n• Review who can view your posts, stories, and tagged photos.\n• Avoid sharing your address, school schedule, or live location.\n• Audit connected apps and remove permissions you no longer need.',
    category: 'Privacy',
    order_index: 3,
    points: [
      'Review who can view your posts, stories, and tagged photos.',
      'Avoid sharing your address, school schedule, or live location.',
      'Audit connected apps and remove permissions you no longer need.'
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    module_id: '11111111-1111-1111-1111-111111111102',
    slug: 'malware',
    title: 'Malware and Viruses',
    description: 'Understand how malicious software spreads and how updates and safe downloads keep devices protected.',
    content: 'Malicious software often arrives through downloads, attachments, or outdated apps. A few cautious habits keep most of it away.\n\n• Keep your operating system, browser, and apps up to date.\n• Download software only from official or trusted sources.\n• Treat unexpected attachments and pop-up installers with suspicion.',
    category: 'Devices',
    order_index: 4,
    points: [
      'Keep your operating system, browser, and apps up to date.',
      'Download software only from official or trusted sources.',
      'Treat unexpected attachments and pop-up installers with suspicion.'
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    module_id: '11111111-1111-1111-1111-111111111105',
    slug: 'browsing',
    title: 'Safe Browsing',
    description: 'Recognize risky websites, insecure connections, and browser warnings while you explore online.',
    content: 'Not every website is what it appears to be. Paying attention to connection security and browser warnings helps you browse with confidence.\n\n• Look for HTTPS and a valid padlock before entering personal details.\n• Never ignore browser warnings about unsafe or deceptive sites.\n• Be cautious on public Wi-Fi and avoid sensitive logins on shared networks.',
    category: 'Browsing',
    order_index: 5,
    points: [
      'Look for HTTPS and a valid padlock before entering personal details.',
      'Never ignore browser warnings about unsafe or deceptive sites.',
      'Be cautious on public Wi-Fi and avoid sensitive logins on shared networks.'
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222206',
    module_id: '11111111-1111-1111-1111-111111111106',
    slug: 'citizenship',
    title: 'Digital Citizenship',
    description: 'Use technology ethically, respect others online, and contribute to healthier digital spaces.',
    content: 'Responsible technology use is about more than security. It is also about honesty, respect, and considering the impact of your actions online.\n\n• Think before you post, share, or forward something about another person.\n• Respect privacy and ask before sharing someone else\'s content or photos.\n• Report harmful content instead of amplifying it.',
    category: 'Community',
    order_index: 6,
    points: [
      'Think before you post, share, or forward something about another person.',
      'Respect privacy and ask before sharing someone else\'s content or photos.',
      'Report harmful content instead of amplifying it.'
    ]
  }
];

async function seedAdminIfConfigured() {
  if (!adminUsername || !adminPassword) {
    console.log('ℹ️  Administrator seeding skipped. Use "npm run create-admin -- <username>" to create an administrator securely.');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  if (supabase) {
    const { data: existing, error: lookupError } = await supabase
      .from('admins')
      .select('id, username')
      .ilike('username', adminUsername)
      .limit(1);

    if (lookupError) {
      throw new Error(`Could not check administrator: ${lookupError.message}`);
    }

    if (existing && existing.length > 0) {
      console.log(`ℹ️  Administrator "${existing[0].username}" already exists. No changes made.`);
      return;
    }

    const { error } = await supabase
      .from('admins')
      .insert([{ username: adminUsername, password_hash: passwordHash }]);

    if (error) {
      throw new Error(`Could not create administrator: ${error.message}`);
    }

    console.log(`✅ Administrator "${adminUsername}" created.`);
    return;
  }

  if (pgPool) {
    const existing = await pgPool.query(
      'SELECT id FROM admins WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [adminUsername]
    );

    if (existing.rows.length > 0) {
      console.log(`ℹ️  Administrator "${adminUsername}" already exists. No changes made.`);
      return;
    }

    await pgPool.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
      [adminUsername, passwordHash]
    );
    console.log(`✅ Administrator "${adminUsername}" created.`);
  }
}

async function seed() {
  console.log('🌱 Starting CyberSafe Database Seeding...');
  const connStatus = await checkConnection();
  console.log(`📡 Database status: ${connStatus.message || connStatus.error} (${connStatus.type})`);

  if (!connStatus.ok) {
    console.warn('⚠️  Database is not available. Configure backend/.env and run backend/schema.sql first.');
    console.log('ℹ️  In-memory fallback data is already available in dbService.js for local development.');
    process.exit(1);
  }

  if (supabase) {
    try {
      await seedAdminIfConfigured();

      console.log('📚 Seeding modules...');
      for (const mod of initialModules) {
        const { error: modErr } = await supabase
          .from('modules')
          .upsert([mod], { onConflict: 'slug', ignoreDuplicates: true });
        if (modErr) console.error(`Error inserting module ${mod.slug}:`, modErr.message);
      }
      console.log(`✅ ${initialModules.length} modules processed.`);

      const { data: moduleRows, error: moduleFetchError } = await supabase
        .from('modules')
        .select('id, slug');

      if (moduleFetchError) {
        throw new Error(`Could not load module IDs: ${moduleFetchError.message}`);
      }

      const moduleIdBySlug = Object.fromEntries((moduleRows || []).map((m) => [m.slug, m.id]));
      const fixedIdToSlug = Object.fromEntries(initialModules.map((m) => [m.id, m.slug]));

      console.log('📖 Seeding lessons...');
      for (const les of initialLessons) {
        const moduleSlug = fixedIdToSlug[les.module_id];
        const moduleId = moduleIdBySlug[moduleSlug] || les.module_id;
        const payload = { ...les, module_id: moduleId };

        const { error: lesErr } = await supabase
          .from('lessons')
          .upsert([payload], { onConflict: 'slug', ignoreDuplicates: true });
        if (lesErr) console.error(`Error inserting lesson ${les.slug}:`, lesErr.message);
      }
      console.log(`✅ ${initialLessons.length} lessons processed.`);

      console.log('🎉 Supabase database seeding complete!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Seeding failed with error:', err.message);
      process.exit(1);
    }
  } else if (pgPool) {
    try {
      await seedAdminIfConfigured();

      const fixedIdToSlug = Object.fromEntries(initialModules.map((m) => [m.id, m.slug]));

      console.log('📚 Seeding modules...');
      for (const mod of initialModules) {
        await pgPool.query(
          `INSERT INTO modules (id, slug, title, description, category, order_index, points)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (slug) DO NOTHING`,
          [mod.id, mod.slug, mod.title, mod.description, mod.category, mod.order_index, JSON.stringify(mod.points)]
        );
      }
      console.log(`✅ ${initialModules.length} modules seeded.`);

      console.log('📖 Seeding lessons...');
      for (const les of initialLessons) {
        const moduleSlug = fixedIdToSlug[les.module_id];
        await pgPool.query(
          `INSERT INTO lessons (id, module_id, slug, title, description, content, category, order_index, points)
           VALUES ($1, (SELECT id FROM modules WHERE slug = $2), $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (slug) DO NOTHING`,
          [les.id, moduleSlug, les.slug, les.title, les.description, les.content, les.category, les.order_index, JSON.stringify(les.points)]
        );
      }
      console.log(`✅ ${initialLessons.length} lessons seeded.`);

      console.log('🎉 PostgreSQL database seeding complete!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Seeding failed with error:', err.message);
      process.exit(1);
    }
  }
}

seed();
