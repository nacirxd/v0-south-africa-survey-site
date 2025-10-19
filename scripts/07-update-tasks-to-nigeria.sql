-- Migration script to update all existing tasks from South Africa to Nigeria
-- This updates task titles, descriptions, and questions to reference Nigeria instead of South Africa

-- Update South African Cities Survey to Nigerian Cities Survey
UPDATE daily_tasks 
SET 
  title = 'Nigerian Cities Survey',
  description = 'Answer 5 questions about major cities in Nigeria including Lagos, Abuja, and Port Harcourt.',
  questions = '[
    {
      "id": "q1",
      "question": "Which Nigerian city is the largest by population?",
      "options": ["Lagos", "Abuja", "Port Harcourt", "Kano"],
      "correctAnswer": 0
    },
    {
      "id": "q2", 
      "question": "What is the capital city of Nigeria?",
      "options": ["Lagos", "Abuja", "Ibadan", "Benin City"],
      "correctAnswer": 1
    },
    {
      "id": "q3",
      "question": "Which city is known as the oil capital of Nigeria?",
      "options": ["Lagos", "Abuja", "Port Harcourt", "Warri"],
      "correctAnswer": 2
    },
    {
      "id": "q4",
      "question": "Which Nigerian city was the former capital before Abuja?",
      "options": ["Ibadan", "Lagos", "Kano", "Enugu"],
      "correctAnswer": 1
    },
    {
      "id": "q5",
      "question": "Which city is the commercial hub of Nigeria?",
      "options": ["Abuja", "Port Harcourt", "Lagos", "Kano"],
      "correctAnswer": 2
    }
  ]'::jsonb
WHERE title = 'South African Cities Survey';

-- Update Local Cuisine Preferences to Nigerian Cuisine
UPDATE daily_tasks
SET
  title = 'Local Cuisine Preferences',
  description = 'Share your thoughts on traditional Nigerian dishes like jollof rice, suya, and pounded yam.',
  questions = '[
    {
      "id": "q1",
      "question": "How often do you eat traditional Nigerian food?",
      "options": ["Daily", "Weekly", "Monthly", "Rarely"],
      "correctAnswer": 0
    },
    {
      "id": "q2",
      "question": "What is your favorite Nigerian dish?",
      "options": ["Jollof Rice", "Suya", "Pounded Yam & Egusi", "Pepper Soup"],
      "correctAnswer": 0
    },
    {
      "id": "q3",
      "question": "Do you prefer Nigerian or international cuisine?",
      "options": ["Nigerian", "International", "Both equally", "Depends on mood"],
      "correctAnswer": 0
    },
    {
      "id": "q4",
      "question": "Which Nigerian snack do you enjoy most?",
      "options": ["Puff Puff", "Chin Chin", "Akara", "Plantain Chips"],
      "correctAnswer": 0
    },
    {
      "id": "q5",
      "question": "How important is Nigerian food to your cultural identity?",
      "options": ["Very important", "Somewhat important", "Not very important", "Not important"],
      "correctAnswer": 0
    }
  ]'::jsonb
WHERE title = 'Local Cuisine Preferences' AND description LIKE '%bobotie%';

-- Update Technology Usage Poll
UPDATE daily_tasks
SET
  description = 'Survey about technology adoption and internet usage patterns in Nigeria.',
  questions = '[
    {
      "id": "q1",
      "question": "How many hours per day do you use the internet?",
      "options": ["Less than 1 hour", "1-3 hours", "3-6 hours", "More than 6 hours"],
      "correctAnswer": 2
    },
    {
      "id": "q2",
      "question": "What is your primary device for internet access?",
      "options": ["Smartphone", "Laptop", "Desktop", "Tablet"],
      "correctAnswer": 0
    },
    {
      "id": "q3",
      "question": "Which social media platform do you use most in Nigeria?",
      "options": ["WhatsApp", "Facebook", "Instagram", "Twitter/X"],
      "correctAnswer": 0
    },
    {
      "id": "q4",
      "question": "How would you rate internet connectivity in your area?",
      "options": ["Excellent", "Good", "Fair", "Poor"],
      "correctAnswer": 1
    },
    {
      "id": "q5",
      "question": "Do you use mobile money services in Nigeria?",
      "options": ["Yes, regularly", "Yes, occasionally", "Rarely", "Never"],
      "correctAnswer": 0
    }
  ]'::jsonb
WHERE title = 'Technology Usage Poll';

-- Update any remaining South Africa references in descriptions
UPDATE daily_tasks
SET description = REPLACE(description, 'South Africa', 'Nigeria')
WHERE description LIKE '%South Africa%';

UPDATE daily_tasks
SET description = REPLACE(description, 'South African', 'Nigerian')
WHERE description LIKE '%South African%';

-- Update questions JSON to replace South Africa references
UPDATE daily_tasks
SET questions = REPLACE(questions::text, 'South Africa', 'Nigeria')::jsonb
WHERE questions::text LIKE '%South Africa%';

UPDATE daily_tasks
SET questions = REPLACE(questions::text, 'South African', 'Nigerian')::jsonb
WHERE questions::text LIKE '%South African%';
