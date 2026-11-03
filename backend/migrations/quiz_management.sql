-- ============================================================
-- CyberSafe — Quiz Management Migration
-- ------------------------------------------------------------
-- Run this file manually in the Supabase SQL Editor.
-- It is safe to run more than once:
--   * Tables, indexes, triggers, and policies are created only
--     when they do not already exist.
--   * The six existing quizzes are inserted only when missing.
--   * Existing questions are never duplicated or overwritten.
--
-- This migration does NOT change the existing modules or lessons
-- tables, and it does not remove any existing content.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Quizzes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT quizzes_title_not_blank
        CHECK (char_length(btrim(title)) > 0),
    CONSTRAINT quizzes_description_not_blank
        CHECK (char_length(btrim(description)) > 0),
    CONSTRAINT quizzes_order_index_non_negative
        CHECK (order_index >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quizzes_slug_unique
    ON public.quizzes (slug);

CREATE INDEX IF NOT EXISTS idx_quizzes_order
    ON public.quizzes (order_index ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_quizzes_module_id
    ON public.quizzes (module_id);

-- ============================================================
-- 2. Quiz questions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_index INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT quiz_questions_text_not_blank
        CHECK (char_length(btrim(question_text)) > 0),
    CONSTRAINT quiz_questions_options_is_array
        CHECK (jsonb_typeof(options) = 'array'),
    CONSTRAINT quiz_questions_options_length
        CHECK (jsonb_array_length(options) BETWEEN 2 AND 6),
    CONSTRAINT quiz_questions_correct_index_valid
        CHECK (correct_index >= 0 AND correct_index < jsonb_array_length(options)),
    CONSTRAINT quiz_questions_order_index_non_negative
        CHECK (order_index >= 0)
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id
    ON public.quiz_questions (quiz_id);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_order
    ON public.quiz_questions (quiz_id, order_index ASC, created_at ASC);

-- ============================================================
-- 3. Automatic updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_quizzes_updated_at ON public.quizzes;
CREATE TRIGGER trg_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_quiz_questions_updated_at ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_updated_at
    BEFORE UPDATE ON public.quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. Row Level Security
-- ============================================================
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published quizzes" ON public.quizzes;
CREATE POLICY "Public can read published quizzes"
    ON public.quizzes
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

DROP POLICY IF EXISTS "Public can read questions for published quizzes" ON public.quiz_questions;
CREATE POLICY "Public can read questions for published quizzes"
    ON public.quiz_questions
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.quizzes q
            WHERE q.id = quiz_questions.quiz_id
              AND q.is_published = true
        )
    );

GRANT SELECT ON public.quizzes, public.quiz_questions TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.quizzes, public.quiz_questions FROM anon, authenticated;
GRANT ALL ON public.quizzes, public.quiz_questions TO service_role;

-- ============================================================
-- 5. Existing CyberSafe quizzes and questions (idempotent seed)
-- ------------------------------------------------------------
-- Slugs match the original frontend quiz keys so the existing
-- "Take Quiz" buttons keep working. Existing rows are preserved.
-- ============================================================
INSERT INTO public.quizzes (slug, title, description, category, module_id, order_index, is_published)
VALUES (
    'passwords',
    'Password Security',
    'Test your understanding of Password Security with scenario-based questions.',
    'Accounts',
    (SELECT id FROM public.modules WHERE slug = 'passwords'),
    1,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.quiz_questions (id, quiz_id, question_text, options, correct_index, explanation, order_index)
SELECT v.id, q.id, v.question_text, v.options, v.correct_index, v.explanation, v.order_index
FROM (VALUES
    ('44444444-4444-4444-4444-000000000001'::uuid, 'Which of these is the strongest password?', '["Summer2024!","BlueSky7","correct-horse-battery-staple","password123"]'::jsonb, 2, 'Length and unpredictability matter most. A long passphrase is much harder to guess than a short password with predictable substitutions.', 1),
    ('44444444-4444-4444-4444-000000000002'::uuid, 'What does two-factor authentication (2FA) add to your account?', '["A second proof, such as a code or security key","A shorter password","A public username","A backup email signature"]'::jsonb, 0, '2FA requires a second form of proof, so a stolen password alone is not enough to sign in.', 2),
    ('44444444-4444-4444-4444-000000000003'::uuid, 'Why should you use a different password for each important account?', '["So you can type faster","Because all websites require it","Because it makes passwords easier to remember","So a breach on one site cannot unlock your other accounts"]'::jsonb, 3, 'Reusing a password means one data breach can give attackers access to many accounts. Unique passwords limit the damage.', 3),
    ('44444444-4444-4444-4444-000000000004'::uuid, 'Where should you store many unique passwords?', '["In a note on your phone","In a reputable password manager","In a shared spreadsheet","In your browser''s saved passwords on a public computer"]'::jsonb, 1, 'A reputable password manager encrypts your vault and helps you use a different strong password for every account.', 4),
    ('44444444-4444-4444-4444-000000000005'::uuid, 'A website emails you asking for your password to verify your account. What should you do?', '["Reply with your password","Click the link and enter it","Never send your password; contact the service through its official website or app","Send only part of the password"]'::jsonb, 2, 'Legitimate services do not ask for your password by email. Verify the request through the service''s official website or app.', 5)
) AS v(id, question_text, options, correct_index, explanation, order_index)
JOIN public.quizzes q ON q.slug = 'passwords'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quizzes (slug, title, description, category, module_id, order_index, is_published)
VALUES (
    'phishing',
    'Phishing and Online Scams',
    'Test your understanding of Phishing and Online Scams with scenario-based questions.',
    'Threats',
    (SELECT id FROM public.modules WHERE slug = 'threats'),
    2,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.quiz_questions (id, quiz_id, question_text, options, correct_index, explanation, order_index)
SELECT v.id, q.id, v.question_text, v.options, v.correct_index, v.explanation, v.order_index
FROM (VALUES
    ('44444444-4444-4444-4444-000000000006'::uuid, 'Which detail is the strongest warning sign of a phishing message?', '["It creates urgency and asks you to click a link or share information","It uses your first name","It includes a company logo","It arrived during the day"]'::jsonb, 0, 'Urgency and requests for credentials or clicks are classic phishing tactics. Logos and names are easy to fake.', 1),
    ('44444444-4444-4444-4444-000000000007'::uuid, 'A text says your package is delayed and asks you to pay a small fee through a link. What is the safest response?', '["Pay quickly to avoid more delays","Open the link on your phone","Reply with your card number","Check the delivery company''s official app or website using a known address"]'::jsonb, 3, 'Use a known, official channel to check the delivery. Scammers use small fees to collect payment details.', 2),
    ('44444444-4444-4444-4444-000000000008'::uuid, 'What should you check before clicking a link in an unexpected message?', '["The sender''s display name only","The actual destination URL and whether it matches the organization","The message''s font","The number of emojis"]'::jsonb, 1, 'Display names can be spoofed. Inspect the real destination and confirm it matches the organization''s official domain.', 3),
    ('44444444-4444-4444-4444-000000000009'::uuid, 'A caller claims to be from your bank and asks for a one-time code. What should you do?', '["Read the code to them","Text the code","Hang up and call the bank using the number on its official website or card","Share your account balance"]'::jsonb, 2, 'One-time codes are for you, not for callers. Hang up and contact the bank through a number you know is official.', 4),
    ('44444444-4444-4444-4444-000000000010'::uuid, 'Why can a message from a friend still be a phishing attempt?', '["Their account may be compromised, or the message may be spoofed","Friends never send links","Phishing only happens by email","Messages from friends are always safe"]'::jsonb, 0, 'If a friend''s account is compromised, an attacker can send phishing messages from it. Verify unusual requests through another channel.', 5)
) AS v(id, question_text, options, correct_index, explanation, order_index)
JOIN public.quizzes q ON q.slug = 'phishing'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quizzes (slug, title, description, category, module_id, order_index, is_published)
VALUES (
    'privacy',
    'Social Media Privacy',
    'Test your understanding of Social Media Privacy with scenario-based questions.',
    'Privacy',
    (SELECT id FROM public.modules WHERE slug = 'privacy'),
    3,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.quiz_questions (id, quiz_id, question_text, options, correct_index, explanation, order_index)
SELECT v.id, q.id, v.question_text, v.options, v.correct_index, v.explanation, v.order_index
FROM (VALUES
    ('44444444-4444-4444-4444-000000000011'::uuid, 'Which post shares the most sensitive information?', '["A photo of your lunch","A picture of a sunset","A screenshot of your boarding pass with a barcode","A song you like"]'::jsonb, 2, 'Boarding passes can contain booking references and personal details. Share travel photos only after you are home.', 1),
    ('44444444-4444-4444-4444-000000000012'::uuid, 'What is a digital footprint?', '["The trail of information you leave online through posts, comments, and activity","The number of devices you own","Your Wi-Fi password","A type of antivirus"]'::jsonb, 0, 'Your digital footprint is the record of what you do online. It can persist and be seen by people beyond your friends.', 2),
    ('44444444-4444-4444-4444-000000000013'::uuid, 'A quiz app asks for access to your contacts and location. What is the best move?', '["Allow everything; it is just a quiz","Share your login","Post your results publicly","Deny unnecessary permissions and review what the app really needs"]'::jsonb, 3, 'Apps should only get permissions they need to work. Deny unnecessary access, especially to contacts and location.', 3),
    ('44444444-4444-4444-4444-000000000014'::uuid, 'Why should you review your social media privacy settings regularly?', '["Platforms never change them","Defaults and features change, and old posts may become more visible than you intended","It makes your account faster","It hides your posts from you"]'::jsonb, 1, 'Platforms update defaults and features. A regular review keeps your old and new posts visible only to the audience you choose.', 4),
    ('44444444-4444-4444-4444-000000000015'::uuid, 'Which detail is safest to avoid sharing publicly?', '["Your favorite color","A movie recommendation","Your school schedule and live location","A photo of a pet without location data"]'::jsonb, 2, 'Schedules and live locations can reveal where you are and when. Share them only with people you trust.', 5)
) AS v(id, question_text, options, correct_index, explanation, order_index)
JOIN public.quizzes q ON q.slug = 'privacy'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quizzes (slug, title, description, category, module_id, order_index, is_published)
VALUES (
    'malware',
    'Malware and Viruses',
    'Test your understanding of Malware and Viruses with scenario-based questions.',
    'Devices',
    (SELECT id FROM public.modules WHERE slug = 'threats'),
    4,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.quiz_questions (id, quiz_id, question_text, options, correct_index, explanation, order_index)
SELECT v.id, q.id, v.question_text, v.options, v.correct_index, v.explanation, v.order_index
FROM (VALUES
    ('44444444-4444-4444-4444-000000000016'::uuid, 'What is malware?', '["Software that only slows down old computers","Malicious software designed to damage, disrupt, or gain unauthorized access","A type of password","A secure browser setting"]'::jsonb, 1, 'Malware is software written to cause harm or gain access without permission. It includes viruses, ransomware, and spyware.', 1),
    ('44444444-4444-4444-4444-000000000017'::uuid, 'Which download source is safest?', '["A pop-up ad offering a free game","An unofficial mirror site","An email attachment from an unknown sender","The official app store or the developer''s official website"]'::jsonb, 3, 'Official stores and developer sites reduce the risk of tampered installers. Avoid pop-ups, mirrors, and unexpected attachments.', 2),
    ('44444444-4444-4444-4444-000000000018'::uuid, 'Why are software updates important for security?', '["They often fix security holes that malware can exploit","They only change the look","They make your device waterproof","They remove the need for passwords"]'::jsonb, 0, 'Updates patch known vulnerabilities. Delaying them leaves an opening that attackers can use.', 3),
    ('44444444-4444-4444-4444-000000000019'::uuid, 'You receive an unexpected email attachment named ''Invoice.exe''. What should you do?', '["Open it to see the invoice","Forward it to friends","Delete it or verify with the sender through another channel; do not run it","Rename it and open it"]'::jsonb, 2, 'Executable attachments can install malware. Do not run unexpected files; verify with the sender through a separate channel.', 4),
    ('44444444-4444-4444-4444-000000000020'::uuid, 'Which habit best reduces the risk of malware?', '["Clicking ads for faster browsers","Keeping the operating system and apps updated and avoiding untrusted downloads","Installing apps from unknown links","Disabling your browser''s security warnings"]'::jsonb, 1, 'Updates and trusted sources close the most common paths malware uses to get onto a device.', 5)
) AS v(id, question_text, options, correct_index, explanation, order_index)
JOIN public.quizzes q ON q.slug = 'malware'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quizzes (slug, title, description, category, module_id, order_index, is_published)
VALUES (
    'browsing',
    'Safe Browsing',
    'Test your understanding of Safe Browsing with scenario-based questions.',
    'Browsing',
    (SELECT id FROM public.modules WHERE slug = 'browsing'),
    5,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.quiz_questions (id, quiz_id, question_text, options, correct_index, explanation, order_index)
SELECT v.id, q.id, v.question_text, v.options, v.correct_index, v.explanation, v.order_index
FROM (VALUES
    ('44444444-4444-4444-4444-000000000021'::uuid, 'What does the padlock icon in a browser address bar mean?', '["The website is guaranteed safe and honest","The site has no ads","The site is government-approved","The connection is encrypted, but the site can still be malicious"]'::jsonb, 3, 'A padlock means the connection is encrypted. It does not prove the site is trustworthy or honest.', 1),
    ('44444444-4444-4444-4444-000000000022'::uuid, 'A page says your device is infected and you must call a number. What should you do?', '["Close the tab and run a trusted security scan; do not call the number","Call the number","Pay the fee","Enter your password"]'::jsonb, 0, 'This is a common tech-support scam. Close the page and use a trusted security tool or professional if you are worried.', 2),
    ('44444444-4444-4444-4444-000000000023'::uuid, 'Which URL is most likely to be a phishing site?', '["https://www.example.com/login","https://support.example.com","https://example.com.secure-login-verify.top","https://example.com/help"]'::jsonb, 2, 'The real domain is secure-login-verify.top; example.com is only a subdomain. Attackers use this trick to look familiar.', 3),
    ('44444444-4444-4444-4444-000000000024'::uuid, 'Why should you avoid sensitive logins on public Wi-Fi?', '["Public Wi-Fi is always faster","Others on the network may be able to intercept traffic, especially on unsecured networks","Public Wi-Fi deletes your files","It uses too much battery"]'::jsonb, 1, 'On an unsecured network, others may be able to monitor traffic. Use mobile data or a trusted VPN for sensitive logins.', 4),
    ('44444444-4444-4444-4444-000000000025'::uuid, 'What is the safest way to visit your bank''s website?', '["Type the known address or use a saved bookmark","Click a link in an email","Search for it and click the first ad","Use a link from a social media post"]'::jsonb, 0, 'Typing the known address or using a bookmark avoids malicious links and ads that imitate your bank.', 5)
) AS v(id, question_text, options, correct_index, explanation, order_index)
JOIN public.quizzes q ON q.slug = 'browsing'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quizzes (slug, title, description, category, module_id, order_index, is_published)
VALUES (
    'citizenship',
    'Digital Citizenship',
    'Test your understanding of Digital Citizenship with scenario-based questions.',
    'Community',
    (SELECT id FROM public.modules WHERE slug = 'citizenship'),
    6,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.quiz_questions (id, quiz_id, question_text, options, correct_index, explanation, order_index)
SELECT v.id, q.id, v.question_text, v.options, v.correct_index, v.explanation, v.order_index
FROM (VALUES
    ('44444444-4444-4444-4444-000000000026'::uuid, 'What does digital citizenship mean?', '["Using the internet only for school","Having many followers","Using technology responsibly, ethically, and respectfully","Knowing how to code"]'::jsonb, 2, 'Digital citizenship is about responsible, ethical, and respectful behavior online, not popularity or technical skill.', 1),
    ('44444444-4444-4444-4444-000000000027'::uuid, 'A friend asks you to share an embarrassing photo of a classmate. What is the responsible choice?', '["Ask for permission and respect the classmate''s privacy; do not share without consent","Share it with everyone","Post it anonymously","Save it for later"]'::jsonb, 0, 'Sharing someone''s image without consent can harm them and may break platform rules or laws. Respect their privacy.', 2),
    ('44444444-4444-4444-4444-000000000028'::uuid, 'You see harmful content or harassment online. What should you do?', '["Amplify it so others can see","Ignore it and encourage others to comment","Create a meme about it","Report it using the platform''s tools and support the person targeted"]'::jsonb, 3, 'Reporting harmful content and supporting the target is safer than spreading it. Amplifying it can make the harm worse.', 3),
    ('44444444-4444-4444-4444-000000000029'::uuid, 'Why does online anonymity not remove responsibility for your actions?', '["Because anonymity is impossible","Because your actions still affect real people and may have real consequences","Because the internet is monitored by schools","Because anonymous posts are always deleted"]'::jsonb, 1, 'Behind every account is a real person. Anonymity does not erase the impact of your words or the rules that apply.', 4),
    ('44444444-4444-4444-4444-000000000030'::uuid, 'Which is an example of good digital citizenship?', '["Sharing unverified news quickly","Using someone else''s work without permission","Crediting sources and checking facts before sharing","Arguing aggressively in comments"]'::jsonb, 2, 'Checking facts and crediting sources slows misinformation and respects the work of others.', 5)
) AS v(id, question_text, options, correct_index, explanation, order_index)
JOIN public.quizzes q ON q.slug = 'citizenship'
ON CONFLICT (id) DO NOTHING;

COMMIT;
