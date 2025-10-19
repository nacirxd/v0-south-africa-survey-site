-- Comprehensive update: Replace ALL South Africa references with Nigeria
-- This script updates all existing tasks to focus on Nigeria

-- Update task titles
UPDATE daily_tasks SET title = 'Nigerian Cities Survey' WHERE title LIKE '%South African Cities%';
UPDATE daily_tasks SET title = 'Nigerian Cuisine Preferences' WHERE title LIKE '%South African%' AND category = 'Culture';
UPDATE daily_tasks SET title = 'Technology Usage in Nigeria' WHERE title LIKE '%Technology%' AND title LIKE '%South Africa%';
UPDATE daily_tasks SET title = 'Nigerian Tourism Destinations' WHERE title LIKE '%Tourism%' AND title LIKE '%South African%';
UPDATE daily_tasks SET title = 'Healthcare Access in Nigeria' WHERE title LIKE '%Healthcare%' AND title LIKE '%South African%';
UPDATE daily_tasks SET title = 'Language Diversity in Nigeria' WHERE title LIKE '%Language%' AND title LIKE '%South Africa%';
UPDATE daily_tasks SET title = 'Transportation in Nigerian Cities' WHERE title LIKE '%Transportation%' AND title LIKE '%South African%';
UPDATE daily_tasks SET title = 'Nigerian Climate and Weather' WHERE title LIKE '%Climate%' AND title LIKE '%South African%';
UPDATE daily_tasks SET title = 'Nigerian Economic Insights' WHERE title LIKE '%Economic%' AND title LIKE '%South African%';
UPDATE daily_tasks SET title = 'Nigerian Education System Feedback' WHERE title LIKE '%Education%' AND title LIKE '%South African%';

-- Update all descriptions to replace South Africa with Nigeria
UPDATE daily_tasks SET description = REPLACE(description, 'South Africa', 'Nigeria');
UPDATE daily_tasks SET description = REPLACE(description, 'South African', 'Nigerian');
UPDATE daily_tasks SET description = REPLACE(description, 'south africa', 'Nigeria');
UPDATE daily_tasks SET description = REPLACE(description, 'south african', 'Nigerian');

-- Update specific city references
UPDATE daily_tasks SET description = REPLACE(description, 'Cape Town', 'Lagos');
UPDATE daily_tasks SET description = REPLACE(description, 'Johannesburg', 'Abuja');
UPDATE daily_tasks SET description = REPLACE(description, 'Durban', 'Port Harcourt');
UPDATE daily_tasks SET description = REPLACE(description, 'Pretoria', 'Kano');

-- Update food references
UPDATE daily_tasks SET description = REPLACE(description, 'bobotie', 'jollof rice');
UPDATE daily_tasks SET description = REPLACE(description, 'biltong', 'suya');
UPDATE daily_tasks SET description = REPLACE(description, 'boerewors', 'pounded yam');

-- Update language references (South Africa has 11 official languages, Nigeria has over 500 languages with English as official)
UPDATE daily_tasks 
SET description = REPLACE(description, '11 official languages', 'over 500 languages including Hausa, Yoruba, and Igbo')
WHERE description LIKE '%11 official languages%';

-- Update questions JSON to replace South Africa with Nigeria
UPDATE daily_tasks 
SET questions = questions::text::jsonb 
WHERE questions::text LIKE '%South Africa%' OR questions::text LIKE '%South African%';

-- Specific task updates with complete Nigerian context

-- Geography task
UPDATE daily_tasks 
SET 
  title = 'Nigerian Cities Survey',
  description = 'Answer 5 questions about major cities in Nigeria including Lagos, Abuja, and Port Harcourt.',
  questions = '[
    {"id": 1, "text": "Which Nigerian city is the largest by population?", "type": "multiple_choice", "options": ["Lagos", "Abuja", "Port Harcourt", "Kano"]},
    {"id": 2, "text": "What is the capital city of Nigeria?", "type": "multiple_choice", "options": ["Lagos", "Abuja", "Kano", "Ibadan"]},
    {"id": 3, "text": "Which city is known as the oil capital of Nigeria?", "type": "multiple_choice", "options": ["Port Harcourt", "Lagos", "Abuja", "Warri"]},
    {"id": 4, "text": "How would you rate the infrastructure in Nigerian cities?", "type": "rating", "scale": 5},
    {"id": 5, "text": "What improvements would you like to see in Nigerian cities?", "type": "text"}
  ]'::jsonb
WHERE category = 'Geography' AND title LIKE '%Cities%';

-- Culture/Cuisine task
UPDATE daily_tasks 
SET 
  title = 'Nigerian Cuisine Preferences',
  description = 'Share your thoughts on traditional Nigerian dishes like jollof rice, suya, and pounded yam.',
  questions = '[
    {"id": 1, "text": "Have you tried jollof rice?", "type": "multiple_choice", "options": ["Yes, I love it", "Yes, but not my favorite", "No, but I want to", "No, not interested"]},
    {"id": 2, "text": "What is your favorite Nigerian dish?", "type": "multiple_choice", "options": ["Jollof rice", "Suya", "Pounded yam with egusi", "Moi moi", "Other"]},
    {"id": 3, "text": "How often do you eat traditional Nigerian food?", "type": "multiple_choice", "options": ["Daily", "Weekly", "Monthly", "Rarely"]},
    {"id": 4, "text": "Rate the quality of Nigerian cuisine", "type": "rating", "scale": 5},
    {"id": 5, "text": "What Nigerian dish would you recommend to visitors?", "type": "text"}
  ]'::jsonb
WHERE category = 'Culture' AND (title LIKE '%Cuisine%' OR description LIKE '%dishes%');

-- Technology task
UPDATE daily_tasks 
SET 
  title = 'Technology Usage in Nigeria',
  description = 'Survey about technology adoption and internet usage patterns in Nigeria.',
  questions = '[
    {"id": 1, "text": "Do you have regular access to the internet?", "type": "multiple_choice", "options": ["Yes, always", "Yes, sometimes", "Rarely", "No"]},
    {"id": 2, "text": "What device do you primarily use for internet access?", "type": "multiple_choice", "options": ["Smartphone", "Computer/Laptop", "Tablet", "Other"]},
    {"id": 3, "text": "How would you rate internet connectivity in your area?", "type": "rating", "scale": 5},
    {"id": 4, "text": "Which online services do you use most?", "type": "multiple_choice", "options": ["Social media", "Banking", "Shopping", "Education", "Entertainment"]},
    {"id": 5, "text": "What technology improvements would benefit Nigeria most?", "type": "text"}
  ]'::jsonb
WHERE category = 'Technology';

-- Tourism task
UPDATE daily_tasks 
SET 
  title = 'Nigerian Tourism Destinations',
  description = 'Rate and review popular Nigerian tourist destinations and attractions.',
  questions = '[
    {"id": 1, "text": "Have you visited any tourist attractions in Nigeria?", "type": "multiple_choice", "options": ["Yes, many", "Yes, a few", "No, but I want to", "No, not interested"]},
    {"id": 2, "text": "Which Nigerian destination interests you most?", "type": "multiple_choice", "options": ["Yankari National Park", "Olumo Rock", "Lekki Conservation Centre", "Zuma Rock", "Other"]},
    {"id": 3, "text": "Rate Nigeria''s tourism infrastructure", "type": "rating", "scale": 5},
    {"id": 4, "text": "What would encourage more tourism in Nigeria?", "type": "multiple_choice", "options": ["Better infrastructure", "More promotion", "Improved security", "Lower costs", "All of the above"]},
    {"id": 5, "text": "Describe your ideal Nigerian tourist experience", "type": "text"}
  ]'::jsonb
WHERE category = 'Tourism';

-- Healthcare task
UPDATE daily_tasks 
SET 
  title = 'Healthcare Access in Nigeria',
  description = 'Questions about healthcare services and accessibility in Nigerian communities.',
  questions = '[
    {"id": 1, "text": "How would you rate healthcare access in your area?", "type": "rating", "scale": 5},
    {"id": 2, "text": "What is your primary healthcare facility?", "type": "multiple_choice", "options": ["Government hospital", "Private hospital", "Health clinic", "Pharmacy", "Traditional healer"]},
    {"id": 3, "text": "How far is the nearest healthcare facility?", "type": "multiple_choice", "options": ["Less than 1km", "1-5km", "5-10km", "More than 10km"]},
    {"id": 4, "text": "What is the biggest healthcare challenge in Nigeria?", "type": "multiple_choice", "options": ["Cost", "Distance", "Quality", "Availability", "All of the above"]},
    {"id": 5, "text": "What healthcare improvements are most needed?", "type": "text"}
  ]'::jsonb
WHERE category = 'Healthcare';

-- Language task
UPDATE daily_tasks 
SET 
  title = 'Language Diversity in Nigeria',
  description = 'Questions about the diverse languages of Nigeria including Hausa, Yoruba, Igbo, and English.',
  questions = '[
    {"id": 1, "text": "What is your primary language?", "type": "multiple_choice", "options": ["Hausa", "Yoruba", "Igbo", "English", "Other"]},
    {"id": 2, "text": "How many Nigerian languages can you speak?", "type": "multiple_choice", "options": ["1", "2", "3", "4 or more"]},
    {"id": 3, "text": "Should Nigerian languages be taught more in schools?", "type": "multiple_choice", "options": ["Yes, definitely", "Yes, somewhat", "No", "Not sure"]},
    {"id": 4, "text": "Rate the importance of preserving Nigerian languages", "type": "rating", "scale": 5},
    {"id": 5, "text": "How can Nigeria better preserve its linguistic diversity?", "type": "text"}
  ]'::jsonb
WHERE category = 'Culture' AND title LIKE '%Language%';

-- Transportation task
UPDATE daily_tasks 
SET 
  title = 'Transportation in Nigerian Cities',
  description = 'Share your experience with public and private transportation in Nigerian cities.',
  questions = '[
    {"id": 1, "text": "What is your primary mode of transportation?", "type": "multiple_choice", "options": ["Personal car", "Okada (motorcycle)", "Danfo (bus)", "Keke (tricycle)", "Walking"]},
    {"id": 2, "text": "How would you rate public transportation in your city?", "type": "rating", "scale": 5},
    {"id": 3, "text": "What is the biggest transportation challenge?", "type": "multiple_choice", "options": ["Traffic congestion", "Cost", "Safety", "Availability", "Poor roads"]},
    {"id": 4, "text": "Would you use a metro/rail system if available?", "type": "multiple_choice", "options": ["Yes, definitely", "Yes, probably", "No", "Not sure"]},
    {"id": 5, "text": "What transportation improvements does Nigeria need most?", "type": "text"}
  ]'::jsonb
WHERE category = 'Infrastructure' AND title LIKE '%Transportation%';

-- Climate task
UPDATE daily_tasks 
SET 
  title = 'Nigerian Climate and Weather',
  description = 'Answer questions about Nigerian climate patterns and seasonal preferences.',
  questions = '[
    {"id": 1, "text": "Which season do you prefer in Nigeria?", "type": "multiple_choice", "options": ["Dry season", "Rainy season", "No preference"]},
    {"id": 2, "text": "How does weather affect your daily activities?", "type": "multiple_choice", "options": ["Significantly", "Somewhat", "Not much", "Not at all"]},
    {"id": 3, "text": "Have you noticed climate changes in recent years?", "type": "multiple_choice", "options": ["Yes, significant changes", "Yes, some changes", "No changes", "Not sure"]},
    {"id": 4, "text": "Rate your concern about climate change in Nigeria", "type": "rating", "scale": 5},
    {"id": 5, "text": "What climate adaptation measures should Nigeria prioritize?", "type": "text"}
  ]'::jsonb
WHERE category = 'Environment';

-- Economy task
UPDATE daily_tasks 
SET 
  title = 'Nigerian Economic Insights',
  description = 'Share your views on Nigerian economy, employment, and business opportunities.',
  questions = '[
    {"id": 1, "text": "How would you rate the current economic situation in Nigeria?", "type": "rating", "scale": 5},
    {"id": 2, "text": "What is your employment status?", "type": "multiple_choice", "options": ["Employed full-time", "Employed part-time", "Self-employed", "Student", "Unemployed"]},
    {"id": 3, "text": "What sector offers the best opportunities in Nigeria?", "type": "multiple_choice", "options": ["Technology", "Agriculture", "Oil & Gas", "Services", "Manufacturing"]},
    {"id": 4, "text": "What is the biggest economic challenge facing Nigeria?", "type": "multiple_choice", "options": ["Unemployment", "Inflation", "Infrastructure", "Corruption", "All of the above"]},
    {"id": 5, "text": "What economic policies would benefit Nigeria most?", "type": "text"}
  ]'::jsonb
WHERE category = 'Economy';

-- Education task
UPDATE daily_tasks 
SET 
  title = 'Nigerian Education System Feedback',
  description = 'Provide feedback on the Nigerian education system and learning experiences.',
  questions = '[
    {"id": 1, "text": "What is your highest level of education?", "type": "multiple_choice", "options": ["Primary", "Secondary", "Tertiary", "Postgraduate", "None"]},
    {"id": 2, "text": "How would you rate the quality of education in Nigeria?", "type": "rating", "scale": 5},
    {"id": 3, "text": "What is the biggest challenge in Nigerian education?", "type": "multiple_choice", "options": ["Quality of teaching", "Infrastructure", "Cost", "Access", "All of the above"]},
    {"id": 4, "text": "Should Nigeria invest more in education?", "type": "multiple_choice", "options": ["Yes, much more", "Yes, somewhat more", "Current level is fine", "Not sure"]},
    {"id": 5, "text": "What education reforms would benefit Nigeria most?", "type": "text"}
  ]'::jsonb
WHERE category = 'Education';

-- Final cleanup: catch any remaining South Africa references
UPDATE daily_tasks 
SET questions = REPLACE(questions::text, 'South Africa', 'Nigeria')::jsonb
WHERE questions::text LIKE '%South Africa%';

UPDATE daily_tasks 
SET questions = REPLACE(questions::text, 'South African', 'Nigerian')::jsonb
WHERE questions::text LIKE '%South African%';
