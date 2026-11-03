const { supabase, pgPool } = require('../config/database');
const bcrypt = require('bcryptjs');

// In-memory default store used as initial fallback if external DB is not yet connected
const defaultModules = [
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const defaultLessons = [
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Optional in-memory administrator for local development only.
// Credentials must come from backend/.env; no defaults are hardcoded.
const configuredAdminUser = process.env.INITIAL_ADMIN_USERNAME;
const configuredAdminPass = process.env.INITIAL_ADMIN_PASSWORD;
let memoryAdmins = [];

if (configuredAdminUser && configuredAdminPass) {
  memoryAdmins = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      username: configuredAdminUser,
      password_hash: bcrypt.hashSync(configuredAdminPass, 10),
      created_at: new Date().toISOString()
    }
  ];
}

let memoryModules = JSON.parse(JSON.stringify(defaultModules));
let memoryLessons = JSON.parse(JSON.stringify(defaultLessons));

// Seeded default quizzes matching the frontend's built-in curriculum
const defaultQuizzes = [
  {
    id: '33333333-3333-3333-3333-000000000001',
    slug: 'passwords',
    title: 'Password Security',
    description: 'Test your understanding of Password Security with scenario-based questions.',
    category: 'Accounts',
    module_id: '11111111-1111-1111-1111-111111111103',
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: '44444444-4444-4444-4444-000000000001',
        quiz_id: '33333333-3333-3333-3333-000000000001',
        question_text: 'Which of these is the strongest password?',
        options: ['Summer2024!', 'BlueSky7', 'correct-horse-battery-staple', 'password123'],
        correct_index: 2,
        explanation: 'Length and unpredictability matter most. A long passphrase is much harder to guess than a short password with predictable substitutions.',
        order_index: 1
      },
      {
        id: '44444444-4444-4444-4444-000000000002',
        quiz_id: '33333333-3333-3333-3333-000000000001',
        question_text: 'What does two-factor authentication (2FA) add to your account?',
        options: ['A second proof, such as a code or security key', 'A shorter password', 'A public username', 'A backup email signature'],
        correct_index: 0,
        explanation: '2FA requires a second form of proof, so a stolen password alone is not enough to sign in.',
        order_index: 2
      },
      {
        id: '44444444-4444-4444-4444-000000000003',
        quiz_id: '33333333-3333-3333-3333-000000000001',
        question_text: 'Why should you use a different password for each important account?',
        options: ['So you can type faster', 'Because all websites require it', 'Because it makes passwords easier to remember', 'So a breach on one site cannot unlock your other accounts'],
        correct_index: 3,
        explanation: 'Reusing a password means one data breach can give attackers access to many accounts. Unique passwords limit the damage.',
        order_index: 3
      },
      {
        id: '44444444-4444-4444-4444-000000000004',
        quiz_id: '33333333-3333-3333-3333-000000000001',
        question_text: 'Where should you store many unique passwords?',
        options: ['In a note on your phone', 'In a reputable password manager', 'In a shared spreadsheet', "In your browser's saved passwords on a public computer"],
        correct_index: 1,
        explanation: 'A reputable password manager encrypts your vault and helps you use a different strong password for every account.',
        order_index: 4
      },
      {
        id: '44444444-4444-4444-4444-000000000005',
        quiz_id: '33333333-3333-3333-3333-000000000001',
        question_text: 'A website emails you asking for your password to verify your account. What should you do?',
        options: ['Reply with your password', 'Click the link and enter it', 'Never send your password; contact the service through its official website or app', 'Send only part of the password'],
        correct_index: 2,
        explanation: 'Legitimate services do not ask for your password by email. Verify the request through the service\'s official website or app.',
        order_index: 5
      }
    ]
  },
  {
    id: '33333333-3333-3333-3333-000000000002',
    slug: 'phishing',
    title: 'Phishing and Online Scams',
    description: 'Test your understanding of Phishing and Online Scams with scenario-based questions.',
    category: 'Threats',
    module_id: '11111111-1111-1111-1111-111111111102',
    order_index: 2,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: '44444444-4444-4444-4444-000000000006',
        quiz_id: '33333333-3333-3333-3333-000000000002',
        question_text: 'Which detail is the strongest warning sign of a phishing message?',
        options: ['It creates urgency and asks you to click a link or share information', 'It uses your first name', 'It includes a company logo', 'It arrived during the day'],
        correct_index: 0,
        explanation: 'Urgency and requests for credentials or clicks are classic phishing tactics. Logos and names are easy to fake.',
        order_index: 1
      },
      {
        id: '44444444-4444-4444-4444-000000000007',
        quiz_id: '33333333-3333-3333-3333-000000000002',
        question_text: 'A text says your package is delayed and asks you to pay a small fee through a link. What is the safest response?',
        options: ['Pay quickly to avoid more delays', 'Open the link on your phone', 'Reply with your card number', "Check the delivery company's official app or website using a known address"],
        correct_index: 3,
        explanation: 'Use a known, official channel to check the delivery. Scammers use small fees to collect payment details.',
        order_index: 2
      },
      {
        id: '44444444-4444-4444-4444-000000000008',
        quiz_id: '33333333-3333-3333-3333-000000000002',
        question_text: 'What should you check before clicking a link in an unexpected message?',
        options: ["The sender's display name only", 'The actual destination URL and whether it matches the organization', "The message's font", 'The number of emojis'],
        correct_index: 1,
        explanation: 'Display names can be spoofed. Inspect the real destination and confirm it matches the organization\'s official domain.',
        order_index: 3
      },
      {
        id: '44444444-4444-4444-4444-000000000009',
        quiz_id: '33333333-3333-3333-3333-000000000002',
        question_text: 'A caller claims to be from your bank and asks for a one-time code. What should you do?',
        options: ['Read the code to them', 'Text the code', 'Hang up and call the bank using the number on its official website or card', 'Share your account balance'],
        correct_index: 2,
        explanation: 'One-time codes are for you, not for callers. Hang up and contact the bank through a number you know is official.',
        order_index: 4
      },
      {
        id: '44444444-4444-4444-4444-000000000010',
        quiz_id: '33333333-3333-3333-3333-000000000002',
        question_text: 'Why can a message from a friend still be a phishing attempt?',
        options: ['Their account may be compromised, or the message may be spoofed', 'Friends never send links', 'Phishing only happens by email', 'Messages from friends are always safe'],
        correct_index: 0,
        explanation: 'If a friend\'s account is compromised, an attacker can send phishing messages from it. Verify unusual requests through another channel.',
        order_index: 5
      }
    ]
  },
  {
    id: '33333333-3333-3333-3333-000000000003',
    slug: 'privacy',
    title: 'Social Media Privacy',
    description: 'Test your understanding of Social Media Privacy with scenario-based questions.',
    category: 'Privacy',
    module_id: '11111111-1111-1111-1111-111111111104',
    order_index: 3,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: '44444444-4444-4444-4444-000000000011',
        quiz_id: '33333333-3333-3333-3333-000000000003',
        question_text: 'Which post shares the most sensitive information?',
        options: ['A photo of your lunch', 'A picture of a sunset', 'A screenshot of your boarding pass with a barcode', 'A song you like'],
        correct_index: 2,
        explanation: 'Boarding passes can contain booking references and personal details. Share travel photos only after you are home.',
        order_index: 1
      },
      {
        id: '44444444-4444-4444-4444-000000000012',
        quiz_id: '33333333-3333-3333-3333-000000000003',
        question_text: 'What is a digital footprint?',
        options: ['The trail of information you leave online through posts, comments, and activity', 'The number of devices you own', 'Your Wi-Fi password', 'A type of antivirus'],
        correct_index: 0,
        explanation: 'Your digital footprint is the record of what you do online. It can persist and be seen by people beyond your friends.',
        order_index: 2
      },
      {
        id: '44444444-4444-4444-4444-000000000013',
        quiz_id: '33333333-3333-3333-3333-000000000003',
        question_text: 'A quiz app asks for access to your contacts and location. What is the best move?',
        options: ['Allow everything; it is just a quiz', 'Share your login', 'Post your results publicly', 'Deny unnecessary permissions and review what the app really needs'],
        correct_index: 3,
        explanation: 'Apps should only get permissions they need to work. Deny unnecessary access, especially to contacts and location.',
        order_index: 3
      },
      {
        id: '44444444-4444-4444-4444-000000000014',
        quiz_id: '33333333-3333-3333-3333-000000000003',
        question_text: 'Why should you review your social media privacy settings regularly?',
        options: ['Platforms never change them', 'Defaults and features change, and old posts may become more visible than you intended', 'It makes your account faster', 'It hides your posts from you'],
        correct_index: 1,
        explanation: 'Platforms update defaults and features. A regular review keeps your old and new posts visible only to the audience you choose.',
        order_index: 4
      },
      {
        id: '44444444-4444-4444-4444-000000000015',
        quiz_id: '33333333-3333-3333-3333-000000000003',
        question_text: 'Which detail is safest to avoid sharing publicly?',
        options: ['Your favorite color', 'A movie recommendation', 'Your school schedule and live location', 'A photo of a pet without location data'],
        correct_index: 2,
        explanation: 'Schedules and live locations can reveal where you are and when. Share them only with people you trust.',
        order_index: 5
      }
    ]
  },
  {
    id: '33333333-3333-3333-3333-000000000004',
    slug: 'malware',
    title: 'Malware and Viruses',
    description: 'Test your understanding of Malware and Viruses with scenario-based questions.',
    category: 'Devices',
    module_id: '11111111-1111-1111-1111-111111111102',
    order_index: 4,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: '44444444-4444-4444-4444-000000000016',
        quiz_id: '33333333-3333-3333-3333-000000000004',
        question_text: 'What is malware?',
        options: ['Software that only slows down old computers', 'Malicious software designed to damage, disrupt, or gain unauthorized access', 'A type of password', 'A secure browser setting'],
        correct_index: 1,
        explanation: 'Malware is software written to cause harm or gain access without permission. It includes viruses, ransomware, and spyware.',
        order_index: 1
      },
      {
        id: '44444444-4444-4444-4444-000000000017',
        quiz_id: '33333333-3333-3333-3333-000000000004',
        question_text: 'Which download source is safest?',
        options: ['A pop-up ad offering a free game', 'An unofficial mirror site', 'An email attachment from an unknown sender', "The official app store or the developer's official website"],
        correct_index: 3,
        explanation: 'Official stores and developer sites reduce the risk of tampered installers. Avoid pop-ups, mirrors, and unexpected attachments.',
        order_index: 2
      },
      {
        id: '44444444-4444-4444-4444-000000000018',
        quiz_id: '33333333-3333-3333-3333-000000000004',
        question_text: 'Why are software updates important for security?',
        options: ['They often fix security holes that malware can exploit', 'They only change the look', 'They make your device waterproof', 'They remove the need for passwords'],
        correct_index: 0,
        explanation: 'Updates patch known vulnerabilities. Delaying them leaves an opening that attackers can use.',
        order_index: 3
      },
      {
        id: '44444444-4444-4444-4444-000000000019',
        quiz_id: '33333333-3333-3333-3333-000000000004',
        question_text: "You receive an unexpected email attachment named 'Invoice.exe'. What should you do?",
        options: ['Open it to see the invoice', 'Forward it to friends', 'Delete it or verify with the sender through another channel; do not run it', 'Rename it and open it'],
        correct_index: 2,
        explanation: 'Executable attachments can install malware. Do not run unexpected files; verify with the sender through a separate channel.',
        order_index: 4
      },
      {
        id: '44444444-4444-4444-4444-000000000020',
        quiz_id: '33333333-3333-3333-3333-000000000004',
        question_text: 'Which habit best reduces the risk of malware?',
        options: ['Clicking ads for faster browsers', 'Keeping the operating system and apps updated and avoiding untrusted downloads', 'Installing apps from unknown links', "Disabling your browser's security warnings"],
        correct_index: 1,
        explanation: 'Updates and trusted sources close the most common paths malware uses to get onto a device.',
        order_index: 5
      }
    ]
  },
  {
    id: '33333333-3333-3333-3333-000000000005',
    slug: 'browsing',
    title: 'Safe Browsing',
    description: 'Test your understanding of Safe Browsing with scenario-based questions.',
    category: 'Browsing',
    module_id: '11111111-1111-1111-1111-111111111105',
    order_index: 5,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: '44444444-4444-4444-4444-000000000021',
        quiz_id: '33333333-3333-3333-3333-000000000005',
        question_text: 'What does the padlock icon in a browser address bar mean?',
        options: ['The website is guaranteed safe and honest', 'The site has no ads', 'The site is government-approved', 'The connection is encrypted, but the site can still be malicious'],
        correct_index: 3,
        explanation: 'A padlock means the connection is encrypted. It does not prove the site is trustworthy or honest.',
        order_index: 1
      },
      {
        id: '44444444-4444-4444-4444-000000000022',
        quiz_id: '33333333-3333-3333-3333-000000000005',
        question_text: 'A page says your device is infected and you must call a number. What should you do?',
        options: ['Close the tab and run a trusted security scan; do not call the number', 'Call the number', 'Pay the fee', 'Enter your password'],
        correct_index: 0,
        explanation: 'This is a common tech-support scam. Close the page and use a trusted security tool or professional if you are worried.',
        order_index: 2
      },
      {
        id: '44444444-4444-4444-4444-000000000023',
        quiz_id: '33333333-3333-3333-3333-000000000005',
        question_text: 'Which URL is most likely to be a phishing site?',
        options: ['https://www.example.com/login', 'https://support.example.com', 'https://example.com.secure-login-verify.top', 'https://example.com/help'],
        correct_index: 2,
        explanation: 'The real domain is secure-login-verify.top; example.com is only a subdomain. Attackers use this trick to look familiar.',
        order_index: 3
      },
      {
        id: '44444444-4444-4444-4444-000000000024',
        quiz_id: '33333333-3333-3333-3333-000000000005',
        question_text: 'Why should you avoid sensitive logins on public Wi-Fi?',
        options: ['Public Wi-Fi is always faster', 'Others on the network may be able to intercept traffic, especially on unsecured networks', 'Public Wi-Fi deletes your files', 'It uses too much battery'],
        correct_index: 1,
        explanation: 'On an unsecured network, others may be able to monitor traffic. Use mobile data or a trusted VPN for sensitive logins.',
        order_index: 4
      },
      {
        id: '44444444-4444-4444-4444-000000000025',
        quiz_id: '33333333-3333-3333-3333-000000000005',
        question_text: "What is the safest way to visit your bank's website?",
        options: ['Type the known address or use a saved bookmark', 'Click a link in an email', 'Search for it and click the first ad', 'Use a link from a social media post'],
        correct_index: 0,
        explanation: 'Typing the known address or using a bookmark avoids malicious links and ads that imitate your bank.',
        order_index: 5
      }
    ]
  },
  {
    id: '33333333-3333-3333-3333-000000000006',
    slug: 'citizenship',
    title: 'Digital Citizenship',
    description: 'Test your understanding of Digital Citizenship with scenario-based questions.',
    category: 'Community',
    module_id: '11111111-1111-1111-1111-111111111106',
    order_index: 6,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: '44444444-4444-4444-4444-000000000026',
        quiz_id: '33333333-3333-3333-3333-000000000006',
        question_text: 'What does digital citizenship mean?',
        options: ['Using the internet only for school', 'Having many followers', 'Using technology responsibly, ethically, and respectfully', 'Knowing how to code'],
        correct_index: 2,
        explanation: 'Digital citizenship is about responsible, ethical, and respectful behavior online, not popularity or technical skill.',
        order_index: 1
      },
      {
        id: '44444444-4444-4444-4444-000000000027',
        quiz_id: '33333333-3333-3333-3333-000000000006',
        question_text: 'A friend asks you to share an embarrassing photo of a classmate. What is the responsible choice?',
        options: ['Ask for permission and respect the classmate\'s privacy; do not share without consent', 'Share it with everyone', 'Post it anonymously', 'Save it for later'],
        correct_index: 0,
        explanation: 'Sharing someone\'s image without consent can harm them and may break platform rules or laws. Respect their privacy.',
        order_index: 2
      },
      {
        id: '44444444-4444-4444-4444-000000000028',
        quiz_id: '33333333-3333-3333-3333-000000000006',
        question_text: 'You see harmful content or harassment online. What should you do?',
        options: ['Amplify it so others can see', 'Ignore it and encourage others to comment', 'Create a meme about it', "Report it using the platform's tools and support the person targeted"],
        correct_index: 3,
        explanation: 'Reporting harmful content and supporting the target is safer than spreading it. Amplifying it can make the harm worse.',
        order_index: 3
      },
      {
        id: '44444444-4444-4444-4444-000000000029',
        quiz_id: '33333333-3333-3333-3333-000000000006',
        question_text: 'Why does online anonymity not remove responsibility for your actions?',
        options: ['Because anonymity is impossible', 'Because your actions still affect real people and may have real consequences', 'Because the internet is monitored by schools', 'Because anonymous posts are always deleted'],
        correct_index: 1,
        explanation: 'Behind every account is a real person. Anonymity does not erase the impact of your words or the rules that apply.',
        order_index: 4
      },
      {
        id: '44444444-4444-4444-4444-000000000030',
        quiz_id: '33333333-3333-3333-3333-000000000006',
        question_text: 'Which is an example of good digital citizenship?',
        options: ['Sharing unverified news quickly', 'Using someone else\'s work without permission', 'Crediting sources and checking facts before sharing', 'Arguing aggressively in comments'],
        correct_index: 2,
        explanation: 'Checking facts and crediting sources slows misinformation and respects the work of others.',
        order_index: 5
      }
    ]
  }
];

let memoryQuizzes = JSON.parse(JSON.stringify(defaultQuizzes));

// --- ADMIN REPOSITORY ---

function escapeLikePattern(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

async function findAdminByUsername(username) {
  if (supabase) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .ilike('username', escapeLikePattern(username))
      .limit(1);

    if (error) {
      throw new Error(`Database error while looking up administrator: ${error.message}`);
    }

    return data && data[0] ? data[0] : null;
  }

  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM admins WHERE LOWER(username) = LOWER($1) LIMIT 1', [username]);
    return res.rows[0] || null;
  }

  // Fallback to memory only when no external database is configured.
  return memoryAdmins.find(a => a.username.toLowerCase() === username.toLowerCase()) || null;
}

async function findAdminById(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, created_at')
      .eq('id', id)
      .limit(1);

    if (error) {
      throw new Error(`Database error while looking up administrator: ${error.message}`);
    }

    return data && data[0] ? data[0] : null;
  }

  if (pgPool) {
    const res = await pgPool.query('SELECT id, username, created_at FROM admins WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  const mem = memoryAdmins.find(a => a.id === id);
  if (mem) {
    return { id: mem.id, username: mem.username, created_at: mem.created_at };
  }
  return null;
}

async function createAdmin(username, passwordHash) {
  if (supabase) {
    const { data, error } = await supabase
      .from('admins')
      .insert([{ username, password_hash: passwordHash }])
      .select()
      .single();

    if (!error && data) {
      return data;
    }
    if (error) throw new Error(error.message);
  }

  if (pgPool) {
    const res = await pgPool.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING *',
      [username, passwordHash]
    );
    return res.rows[0];
  }

  const newAdmin = {
    id: `admin-${Date.now()}`,
    username,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };
  memoryAdmins.push(newAdmin);
  return newAdmin;
}

// --- MODULES REPOSITORY ---

async function getAllModules() {
  if (supabase) {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Database error while loading modules: ${error.message}`);
    }

    return data || [];
  }

  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM modules ORDER BY order_index ASC, created_at ASC');
    return res.rows;
  }

  return memoryModules;
}

async function getModuleById(id) {
  if (supabase) {
    // Try by UUID or slug
    let query = supabase.from('modules').select('*');
    if (id.includes('-')) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }
    const { data, error } = await query.limit(1);

    if (error) {
      throw new Error(`Database error while loading module: ${error.message}`);
    }

    return data && data[0] ? data[0] : null;
  }

  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM modules WHERE id::text = $1 OR slug = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  return memoryModules.find(m => m.id === id || m.slug === id) || null;
}

async function createModule(moduleData) {
  const timestamp = new Date().toISOString();
  const slug = moduleData.slug || moduleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const record = {
    title: moduleData.title,
    description: moduleData.description,
    slug: slug,
    category: moduleData.category || 'Foundations',
    order_index: moduleData.order_index || (memoryModules.length + 1),
    points: moduleData.points || [],
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('modules')
      .insert([record])
      .select()
      .single();

    if (!error && data) return data;
    if (error) throw new Error(error.message);
  }

  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO modules (title, description, slug, category, order_index, points, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [record.title, record.description, record.slug, record.category, record.order_index, JSON.stringify(record.points), timestamp, timestamp]
    );
    return res.rows[0];
  }

  record.id = `mod-${Date.now()}`;
  memoryModules.push(record);
  return record;
}

async function updateModule(id, moduleData) {
  const timestamp = new Date().toISOString();
  const updatePayload = {
    ...(moduleData.title && { title: moduleData.title }),
    ...(moduleData.description && { description: moduleData.description }),
    ...(moduleData.category && { category: moduleData.category }),
    ...(moduleData.order_index !== undefined && { order_index: moduleData.order_index }),
    ...(moduleData.points !== undefined && { points: moduleData.points }),
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('modules')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) return data;
    if (error) throw new Error(error.message);
  }

  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE modules SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        points = COALESCE($4, points),
        updated_at = $5
       WHERE id::text = $6 RETURNING *`,
      [moduleData.title, moduleData.description, moduleData.category, moduleData.points ? JSON.stringify(moduleData.points) : null, timestamp, id]
    );
    if (res.rows.length > 0) return res.rows[0];
  }

  const idx = memoryModules.findIndex(m => m.id === id || m.slug === id);
  if (idx !== -1) {
    memoryModules[idx] = { ...memoryModules[idx], ...updatePayload };
    return memoryModules[idx];
  }
  return null;
}

async function deleteModule(id) {
  if (supabase) {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  if (pgPool) {
    await pgPool.query('DELETE FROM modules WHERE id::text = $1', [id]);
    return true;
  }

  const idx = memoryModules.findIndex(m => m.id === id || m.slug === id);
  if (idx !== -1) {
    const modId = memoryModules[idx].id;
    memoryModules.splice(idx, 1);
    // Cascade delete lessons in memory
    memoryLessons = memoryLessons.filter(l => l.module_id !== modId);
    return true;
  }
  return false;
}

// --- LESSONS REPOSITORY ---

async function getAllLessons() {
  if (supabase) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, modules(id, title, slug)')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Database error while loading lessons: ${error.message}`);
    }

    return data || [];
  }

  if (pgPool) {
    const res = await pgPool.query(`
      SELECT l.*, json_build_object('id', m.id, 'title', m.title, 'slug', m.slug) as modules
      FROM lessons l
      LEFT JOIN modules m ON l.module_id = m.id
      ORDER BY l.order_index ASC, l.created_at ASC
    `);
    return res.rows;
  }

  return memoryLessons.map(l => {
    const m = memoryModules.find(mod => mod.id === l.module_id);
    return { ...l, modules: m ? { id: m.id, title: m.title, slug: m.slug } : null };
  });
}

async function getLessonById(id) {
  if (supabase) {
    let query = supabase.from('lessons').select('*, modules(id, title, slug)');
    if (id.includes('-')) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }
    const { data, error } = await query.limit(1);

    if (error) {
      throw new Error(`Database error while loading lesson: ${error.message}`);
    }

    return data && data[0] ? data[0] : null;
  }

  if (pgPool) {
    const res = await pgPool.query(`
      SELECT l.*, json_build_object('id', m.id, 'title', m.title, 'slug', m.slug) as modules
      FROM lessons l
      LEFT JOIN modules m ON l.module_id = m.id
      WHERE l.id::text = $1 OR l.slug = $1
      LIMIT 1
    `, [id]);
    return res.rows[0] || null;
  }

  const lesson = memoryLessons.find(l => l.id === id || l.slug === id);
  if (!lesson) return null;
  const m = memoryModules.find(mod => mod.id === lesson.module_id);
  return { ...lesson, modules: m ? { id: m.id, title: m.title, slug: m.slug } : null };
}

async function getLessonsByModuleId(moduleId) {
  if (supabase) {
    // Check if moduleId is UUID or slug
    let mod = moduleId;
    if (!moduleId.includes('-')) {
      const { data: mData, error: moduleError } = await supabase
        .from('modules')
        .select('id')
        .eq('slug', moduleId)
        .limit(1);

      if (moduleError) {
        throw new Error(`Database error while loading module lessons: ${moduleError.message}`);
      }
      if (mData && mData[0]) mod = mData[0].id;
    }

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', mod)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Database error while loading module lessons: ${error.message}`);
    }

    return data || [];
  }

  if (pgPool) {
    const res = await pgPool.query(`
      SELECT l.* FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE m.id::text = $1 OR m.slug = $1
      ORDER BY l.order_index ASC
    `, [moduleId]);
    return res.rows;
  }

  const mod = memoryModules.find(m => m.id === moduleId || m.slug === moduleId);
  if (!mod) return [];
  return memoryLessons.filter(l => l.module_id === mod.id);
}

async function createLesson(lessonData) {
  const timestamp = new Date().toISOString();
  const slug = lessonData.slug || lessonData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const record = {
    title: lessonData.title,
    description: lessonData.description,
    content: lessonData.content,
    module_id: lessonData.module_id || null,
    slug: slug,
    category: lessonData.category || 'Accounts',
    order_index: lessonData.order_index || (memoryLessons.length + 1),
    points: lessonData.points || [],
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([record])
      .select('*, modules(id, title, slug)')
      .single();

    if (!error && data) return data;
    if (error) throw new Error(error.message);
  }

  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO lessons (title, description, content, module_id, slug, category, order_index, points, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [record.title, record.description, record.content, record.module_id, record.slug, record.category, record.order_index, JSON.stringify(record.points), timestamp, timestamp]
    );
    return res.rows[0];
  }

  record.id = `les-${Date.now()}`;
  memoryLessons.push(record);
  const m = memoryModules.find(mod => mod.id === record.module_id);
  return { ...record, modules: m ? { id: m.id, title: m.title, slug: m.slug } : null };
}

async function updateLesson(id, lessonData) {
  const timestamp = new Date().toISOString();
  const updatePayload = {
    ...(lessonData.title && { title: lessonData.title }),
    ...(lessonData.description && { description: lessonData.description }),
    ...(lessonData.content && { content: lessonData.content }),
    ...(lessonData.module_id !== undefined && { module_id: lessonData.module_id }),
    ...(lessonData.category && { category: lessonData.category }),
    ...(lessonData.order_index !== undefined && { order_index: lessonData.order_index }),
    ...(lessonData.points !== undefined && { points: lessonData.points }),
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updatePayload)
      .eq('id', id)
      .select('*, modules(id, title, slug)')
      .single();

    if (!error && data) return data;
    if (error) throw new Error(error.message);
  }

  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE lessons SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        content = COALESCE($3, content),
        module_id = COALESCE($4, module_id),
        category = COALESCE($5, category),
        points = COALESCE($6, points),
        updated_at = $7
       WHERE id::text = $8 RETURNING *`,
      [lessonData.title, lessonData.description, lessonData.content, lessonData.module_id, lessonData.category, lessonData.points ? JSON.stringify(lessonData.points) : null, timestamp, id]
    );
    if (res.rows.length > 0) return res.rows[0];
  }

  const idx = memoryLessons.findIndex(l => l.id === id || l.slug === id);
  if (idx !== -1) {
    memoryLessons[idx] = { ...memoryLessons[idx], ...updatePayload };
    const m = memoryModules.find(mod => mod.id === memoryLessons[idx].module_id);
    return { ...memoryLessons[idx], modules: m ? { id: m.id, title: m.title, slug: m.slug } : null };
  }
  return null;
}

async function deleteLesson(id) {
  if (supabase) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  if (pgPool) {
    await pgPool.query('DELETE FROM lessons WHERE id::text = $1', [id]);
    return true;
  }

  const idx = memoryLessons.findIndex(l => l.id === id || l.slug === id);
  if (idx !== -1) {
    memoryLessons.splice(idx, 1);
    return true;
  }
  return false;
}

// --- QUIZ REPOSITORY ---

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `quiz-${Date.now()}`;
}

function dbError(message, error) {
  const err = new Error(`${message}: ${error.message}`);
  if (error && error.code) {
    err.code = error.code;
  }
  return err;
}

function sortQuestions(questions) {
  return [...questions].sort((a, b) => {
    const orderDiff = (Number(a.order_index) || 0) - (Number(b.order_index) || 0);
    if (orderDiff !== 0) return orderDiff;
    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });
}

function normalizeQuestionList(value) {
  if (Array.isArray(value)) return sortQuestions(value);
  if (value) return [value];
  return [];
}

function mapQuizRow(row) {
  const { quiz_questions, ...quiz } = row;
  return { ...quiz, questions: normalizeQuestionList(quiz_questions) };
}

function mapMemoryQuiz(quiz) {
  return { ...quiz, questions: sortQuestions(quiz.questions || []) };
}

async function getAllQuizzes() {
  if (supabase) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw dbError('Database error while loading quizzes', error);
    }

    return (data || []).map(mapQuizRow);
  }

  if (pgPool) {
    const [quizRes, questionRes] = await Promise.all([
      pgPool.query('SELECT * FROM quizzes ORDER BY order_index ASC, created_at ASC'),
      pgPool.query('SELECT * FROM quiz_questions ORDER BY order_index ASC, created_at ASC')
    ]);

    return quizRes.rows.map((quiz) => ({
      ...quiz,
      questions: questionRes.rows.filter((question) => question.quiz_id === quiz.id)
    }));
  }

  return memoryQuizzes.map(mapMemoryQuiz);
}

async function getQuizById(idOrSlug) {
  if (supabase) {
    let query = supabase.from('quizzes').select('*, quiz_questions(*)');
    query = isUuid(idOrSlug) ? query.eq('id', idOrSlug) : query.eq('slug', idOrSlug);
    const { data, error } = await query.limit(1);

    if (error) {
      throw dbError('Database error while loading quiz', error);
    }

    return data && data[0] ? mapQuizRow(data[0]) : null;
  }

  if (pgPool) {
    const quizRes = await pgPool.query(
      'SELECT * FROM quizzes WHERE id::text = $1 OR slug = $1 LIMIT 1',
      [idOrSlug]
    );
    const quiz = quizRes.rows[0];
    if (!quiz) return null;

    const questionRes = await pgPool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index ASC, created_at ASC',
      [quiz.id]
    );
    return { ...quiz, questions: questionRes.rows };
  }

  const quiz = memoryQuizzes.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  return quiz ? mapMemoryQuiz(quiz) : null;
}

async function createQuiz(quizData) {
  const timestamp = new Date().toISOString();
  const record = {
    slug: quizData.slug || slugify(quizData.title),
    title: quizData.title,
    description: quizData.description,
    category: quizData.category || 'General',
    module_id: quizData.module_id || null,
    order_index: Number.isFinite(Number(quizData.order_index))
      ? Number(quizData.order_index)
      : memoryQuizzes.length + 1,
    is_published: quizData.is_published !== false,
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([record])
      .select('*, quiz_questions(*)')
      .single();

    if (error) {
      throw dbError('Could not create quiz', error);
    }
    return mapQuizRow(data);
  }

  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO quizzes (slug, title, description, category, module_id, order_index, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [record.slug, record.title, record.description, record.category, record.module_id, record.order_index, record.is_published, timestamp, timestamp]
    );
    return { ...res.rows[0], questions: [] };
  }

  let slug = record.slug;
  let suffix = 2;
  while (memoryQuizzes.some((quiz) => quiz.slug === slug)) {
    slug = `${record.slug}-${suffix}`;
    suffix += 1;
  }

  const quiz = {
    ...record,
    slug,
    id: `quiz-${Date.now()}`,
    questions: []
  };
  memoryQuizzes.push(quiz);
  return mapMemoryQuiz(quiz);
}

async function updateQuiz(id, quizData) {
  const payload = {
    ...(quizData.title !== undefined && { title: quizData.title }),
    ...(quizData.description !== undefined && { description: quizData.description }),
    ...(quizData.category !== undefined && { category: quizData.category }),
    ...(quizData.module_id !== undefined && { module_id: quizData.module_id || null }),
    ...(quizData.order_index !== undefined && { order_index: Number(quizData.order_index) }),
    ...(quizData.is_published !== undefined && { is_published: Boolean(quizData.is_published) }),
    ...(quizData.slug !== undefined && { slug: quizData.slug }),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(payload)
      .eq('id', id)
      .select('*, quiz_questions(*)')
      .single();

    if (error) {
      throw dbError('Could not update quiz', error);
    }
    return mapQuizRow(data);
  }

  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE quizzes SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        module_id = CASE WHEN $4 THEN $5 ELSE module_id END,
        order_index = COALESCE($6, order_index),
        is_published = COALESCE($7, is_published),
        updated_at = $8
       WHERE id::text = $9
       RETURNING *`,
      [
        quizData.title ?? null,
        quizData.description ?? null,
        quizData.category ?? null,
        quizData.module_id !== undefined,
        quizData.module_id !== undefined ? (quizData.module_id || null) : null,
        quizData.order_index !== undefined ? Number(quizData.order_index) : null,
        quizData.is_published !== undefined ? Boolean(quizData.is_published) : null,
        payload.updated_at,
        id
      ]
    );

    if (!res.rows[0]) return null;
    const questions = await pgPool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index ASC, created_at ASC',
      [res.rows[0].id]
    );
    return { ...res.rows[0], questions: questions.rows };
  }

  const quiz = memoryQuizzes.find((item) => item.id === id || item.slug === id);
  if (!quiz) return null;
  Object.assign(quiz, payload);
  return mapMemoryQuiz(quiz);
}

async function deleteQuiz(id) {
  if (supabase) {
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (error) {
      throw dbError('Could not delete quiz', error);
    }
    return true;
  }

  if (pgPool) {
    await pgPool.query('DELETE FROM quizzes WHERE id::text = $1', [id]);
    return true;
  }

  const index = memoryQuizzes.findIndex((quiz) => quiz.id === id || quiz.slug === id);
  if (index === -1) return false;
  memoryQuizzes.splice(index, 1);
  return true;
}

async function getQuestionsByQuizId(quizId) {
  if (supabase) {
    let resolvedId = quizId;

    if (!isUuid(quizId)) {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id')
        .eq('slug', quizId)
        .limit(1);

      if (error) {
        throw dbError('Database error while loading quiz questions', error);
      }
      if (data && data[0]) resolvedId = data[0].id;
    }

    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', resolvedId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw dbError('Database error while loading quiz questions', error);
    }
    return data || [];
  }

  if (pgPool) {
    const res = await pgPool.query(
      `SELECT qq.*
       FROM quiz_questions qq
       JOIN quizzes q ON q.id = qq.quiz_id
       WHERE q.id::text = $1 OR q.slug = $1
       ORDER BY qq.order_index ASC, qq.created_at ASC`,
      [quizId]
    );
    return res.rows;
  }

  const quiz = memoryQuizzes.find((item) => item.id === quizId || item.slug === quizId);
  return quiz ? sortQuestions(quiz.questions || []) : [];
}

async function getQuestionById(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (error) {
      throw dbError('Database error while loading quiz question', error);
    }
    return data && data[0] ? data[0] : null;
  }

  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM quiz_questions WHERE id::text = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  for (const quiz of memoryQuizzes) {
    const question = (quiz.questions || []).find((item) => item.id === id);
    if (question) return question;
  }
  return null;
}

async function createQuestion(quizId, questionData) {
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const record = {
    quiz_id: quiz.id,
    question_text: questionData.question_text,
    options: questionData.options,
    correct_index: Number(questionData.correct_index),
    explanation: questionData.explanation || '',
    order_index: Number.isFinite(Number(questionData.order_index))
      ? Number(questionData.order_index)
      : (quiz.questions ? quiz.questions.length : 0) + 1,
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert([record])
      .select()
      .single();

    if (error) {
      throw dbError('Could not create quiz question', error);
    }
    return data;
  }

  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, order_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [record.quiz_id, record.question_text, JSON.stringify(record.options), record.correct_index, record.explanation, record.order_index, timestamp, timestamp]
    );
    return res.rows[0];
  }

  const memoryQuiz = memoryQuizzes.find((item) => item.id === quiz.id);
  const question = {
    ...record,
    id: `question-${Date.now()}`
  };
  memoryQuiz.questions.push(question);
  return question;
}

async function updateQuestion(id, questionData) {
  const payload = {
    ...(questionData.question_text !== undefined && { question_text: questionData.question_text }),
    ...(questionData.options !== undefined && { options: questionData.options }),
    ...(questionData.correct_index !== undefined && { correct_index: Number(questionData.correct_index) }),
    ...(questionData.explanation !== undefined && { explanation: questionData.explanation }),
    ...(questionData.order_index !== undefined && { order_index: Number(questionData.order_index) }),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw dbError('Could not update quiz question', error);
    }
    return data;
  }

  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE quiz_questions SET
        question_text = COALESCE($1, question_text),
        options = COALESCE($2, options),
        correct_index = COALESCE($3, correct_index),
        explanation = COALESCE($4, explanation),
        order_index = COALESCE($5, order_index),
        updated_at = $6
       WHERE id::text = $7
       RETURNING *`,
      [
        questionData.question_text ?? null,
        questionData.options !== undefined ? JSON.stringify(questionData.options) : null,
        questionData.correct_index !== undefined ? Number(questionData.correct_index) : null,
        questionData.explanation ?? null,
        questionData.order_index !== undefined ? Number(questionData.order_index) : null,
        payload.updated_at,
        id
      ]
    );
    return res.rows[0] || null;
  }

  for (const quiz of memoryQuizzes) {
    const index = (quiz.questions || []).findIndex((item) => item.id === id);
    if (index !== -1) {
      quiz.questions[index] = { ...quiz.questions[index], ...payload };
      return quiz.questions[index];
    }
  }
  return null;
}

async function deleteQuestion(id) {
  if (supabase) {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (error) {
      throw dbError('Could not delete quiz question', error);
    }
    return true;
  }

  if (pgPool) {
    await pgPool.query('DELETE FROM quiz_questions WHERE id::text = $1', [id]);
    return true;
  }

  for (const quiz of memoryQuizzes) {
    const index = (quiz.questions || []).findIndex((item) => item.id === id);
    if (index !== -1) {
      quiz.questions.splice(index, 1);
      return true;
    }
  }
  return false;
}

// --- DASHBOARD STATS REPOSITORY ---

async function getDashboardStats() {
  const [modules, lessons, quizzes] = await Promise.all([
    getAllModules(),
    getAllLessons(),
    getAllQuizzes()
  ]);

  // Combine and sort by updated_at or created_at desc
  const allContent = [
    ...modules.map(m => ({ ...m, kind: 'module' })),
    ...lessons.map(l => ({ ...l, kind: 'lesson' })),
    ...quizzes.map(q => ({ ...q, kind: 'quiz' }))
  ].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

  return {
    totalModules: modules.length,
    totalLessons: lessons.length,
    totalQuizzes: quizzes.length,
    recentContent: allContent.slice(0, 5)
  };
}

module.exports = {
  findAdminByUsername,
  findAdminById,
  createAdmin,
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getAllLessons,
  getLessonById,
  getLessonsByModuleId,
  createLesson,
  updateLesson,
  deleteLesson,
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuestionsByQuizId,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getDashboardStats
};
