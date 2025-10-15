-- Create expanded pool of tasks for rotation
DELETE FROM daily_tasks;

-- Insert 36 diverse tasks about South Africa (3x more than current)
INSERT INTO daily_tasks (id, title, description, category, reward_amount, questions, max_completions, is_active) VALUES
-- Geography Tasks (12)
('task-geo-01', 'South African Provinces Survey', 'Answer questions about the 9 provinces of South Africa', 'Geography', 0.75, '[
  {"type": "multiple_choice", "question": "Which province is known as the ''Mother City'' province?", "options": ["Western Cape", "Eastern Cape", "Northern Cape", "Free State"], "correct": 0},
  {"type": "multiple_choice", "question": "What is the largest province by area?", "options": ["Limpopo", "Northern Cape", "Eastern Cape", "North West"], "correct": 1},
  {"type": "checkbox", "question": "Which provinces border the ocean? (Select all)", "options": ["Western Cape", "Eastern Cape", "KwaZulu-Natal", "Gauteng"], "correct": [0,1,2]},
  {"type": "text", "question": "Name the capital city of Mpumalanga province"},
  {"type": "rating", "question": "Rate your knowledge of South African geography (1-5)", "scale": 5}
]', 100, true),

('task-geo-02', 'Mountain Ranges and Landmarks', 'Explore South Africa''s natural landmarks and mountain ranges', 'Geography', 0.80, '[
  {"type": "multiple_choice", "question": "What is the highest mountain in South Africa?", "options": ["Mafadi", "Champagne Castle", "Thabana Ntlenyana", "Injasuti"], "correct": 0},
  {"type": "multiple_choice", "question": "Which mountain range runs along the coast?", "options": ["Drakensberg", "Magaliesberg", "Swartberg", "Outeniqua"], "correct": 3},
  {"type": "text", "question": "Name the famous flat-topped mountain in Cape Town"},
  {"type": "checkbox", "question": "Which are UNESCO World Heritage sites? (Select all)", "options": ["Table Mountain", "Drakensberg", "Vredefort Dome", "Cape Floral Region"], "correct": [1,2,3]},
  {"type": "rating", "question": "How interested are you in South African natural landmarks? (1-5)", "scale": 5}
]', 100, true),

('task-geo-03', 'Rivers and Water Bodies', 'Learn about South Africa''s rivers, dams and water systems', 'Geography', 0.70, '[
  {"type": "multiple_choice", "question": "Which is the longest river in South Africa?", "options": ["Orange River", "Vaal River", "Limpopo River", "Tugela River"], "correct": 0},
  {"type": "multiple_choice", "question": "The Orange River flows into which ocean?", "options": ["Indian Ocean", "Atlantic Ocean", "Both oceans", "Neither"], "correct": 1},
  {"type": "text", "question": "Name the largest dam in South Africa by volume"},
  {"type": "checkbox", "question": "Which rivers form international borders? (Select all)", "options": ["Orange River", "Limpopo River", "Vaal River", "Tugela River"], "correct": [0,1]},
  {"type": "rating", "question": "Rate the importance of water conservation in SA (1-5)", "scale": 5}
]', 100, true),

('task-geo-04', 'Climate and Weather Patterns', 'Understanding South Africa''s diverse climate zones', 'Geography', 0.85, '[
  {"type": "multiple_choice", "question": "Which city has a Mediterranean climate?", "options": ["Cape Town", "Johannesburg", "Durban", "Pretoria"], "correct": 0},
  {"type": "multiple_choice", "question": "When is winter in South Africa?", "options": ["Dec-Feb", "Mar-May", "Jun-Aug", "Sep-Nov"], "correct": 2},
  {"type": "checkbox", "question": "Which regions experience summer rainfall? (Select all)", "options": ["Western Cape", "Eastern Cape", "Gauteng", "KwaZulu-Natal"], "correct": [1,2,3]},
  {"type": "text", "question": "What weather phenomenon affects the Western Cape in summer?"},
  {"type": "rating", "question": "How much do you know about SA climate? (1-5)", "scale": 5}
]', 100, true),

-- Culture Tasks (12)
('task-cul-01', 'Traditional Music and Dance', 'Explore South Africa''s rich musical heritage', 'Culture', 0.90, '[
  {"type": "multiple_choice", "question": "Which dance is traditionally performed by Zulu warriors?", "options": ["Gumboot", "Indlamu", "Pantsula", "Boeremusiek"], "correct": 1},
  {"type": "multiple_choice", "question": "What instrument is central to traditional Xhosa music?", "options": ["Marimba", "Uhadi", "Djembe", "Kalimba"], "correct": 1},
  {"type": "checkbox", "question": "Which are traditional SA music genres? (Select all)", "options": ["Kwaito", "Amapiano", "Boeremusiek", "Marabi"], "correct": [0,1,2,3]},
  {"type": "text", "question": "Name a famous South African jazz musician"},
  {"type": "rating", "question": "How much do you enjoy traditional SA music? (1-5)", "scale": 5}
]', 100, true),

('task-cul-02', 'Traditional Clothing and Attire', 'Learn about traditional dress across SA cultures', 'Culture', 0.75, '[
  {"type": "multiple_choice", "question": "What is the traditional Ndebele women''s blanket called?", "options": ["Ndau", "Nguni", "Ndebele blanket", "Shweshwe"], "correct": 2},
  {"type": "multiple_choice", "question": "Which fabric is iconic in South African fashion?", "options": ["Kente", "Shweshwe", "Bogolan", "Adinkra"], "correct": 1},
  {"type": "text", "question": "What colors are traditionally used in Ndebele art?"},
  {"type": "checkbox", "question": "Which are traditional SA accessories? (Select all)", "options": ["Isicholo", "Ibhayi", "Doek", "Dashiki"], "correct": [0,1,2]},
  {"type": "rating", "question": "Rate your interest in traditional SA fashion (1-5)", "scale": 5}
]', 100, true),

('task-cul-03', 'Festivals and Celebrations', 'Discover South Africa''s cultural festivals and holidays', 'Culture', 0.80, '[
  {"type": "multiple_choice", "question": "When is Heritage Day celebrated?", "options": ["March 21", "April 27", "September 24", "December 16"], "correct": 2},
  {"type": "multiple_choice", "question": "What is Heritage Day also known as?", "options": ["Braai Day", "Unity Day", "Culture Day", "Freedom Day"], "correct": 0},
  {"type": "checkbox", "question": "Which are major SA cultural festivals? (Select all)", "options": ["Arts Alive", "National Arts Festival", "Hermanus Whale Festival", "Oppikoppi"], "correct": [0,1,3]},
  {"type": "text", "question": "Name a traditional ceremony from any SA culture"},
  {"type": "rating", "question": "How important are cultural festivals to you? (1-5)", "scale": 5}
]', 100, true),

('task-cul-04', 'Art and Crafts Heritage', 'Explore traditional and contemporary SA arts', 'Culture', 0.85, '[
  {"type": "multiple_choice", "question": "Which art form is Ndebele culture famous for?", "options": ["Pottery", "Geometric wall painting", "Wood carving", "Beadwork"], "correct": 1},
  {"type": "multiple_choice", "question": "What material is traditionally used for Zulu beadwork?", "options": ["Glass beads", "Clay beads", "Wooden beads", "Metal beads"], "correct": 0},
  {"type": "text", "question": "Name a famous South African contemporary artist"},
  {"type": "checkbox", "question": "Which are traditional SA crafts? (Select all)", "options": ["Pottery", "Basket weaving", "Wire art", "Beadwork"], "correct": [0,1,2,3]},
  {"type": "rating", "question": "Rate your appreciation for SA traditional arts (1-5)", "scale": 5}
]', 100, true),

-- Economy Tasks (12)
('task-eco-01', 'Mining Industry Overview', 'Understanding SA''s mining sector and resources', 'Economy', 0.95, '[
  {"type": "multiple_choice", "question": "South Africa is the world''s largest producer of which mineral?", "options": ["Gold", "Diamonds", "Platinum", "Coal"], "correct": 2},
  {"type": "multiple_choice", "question": "Which city is known as the ''City of Gold''?", "options": ["Cape Town", "Johannesburg", "Pretoria", "Durban"], "correct": 1},
  {"type": "checkbox", "question": "Which minerals are mined in SA? (Select all)", "options": ["Platinum", "Gold", "Diamonds", "Iron ore"], "correct": [0,1,2,3]},
  {"type": "text", "question": "Name the world''s deepest gold mine located in SA"},
  {"type": "rating", "question": "Rate the importance of mining to SA economy (1-5)", "scale": 5}
]', 100, true),

('task-eco-02', 'Agriculture and Farming', 'Explore SA''s agricultural sector and products', 'Economy', 0.70, '[
  {"type": "multiple_choice", "question": "Which province is SA''s largest maize producer?", "options": ["Free State", "North West", "Mpumalanga", "Limpopo"], "correct": 0},
  {"type": "multiple_choice", "question": "SA is famous for which agricultural export?", "options": ["Coffee", "Wine", "Tea", "Cocoa"], "correct": 1},
  {"type": "text", "question": "Name a major wine region in South Africa"},
  {"type": "checkbox", "question": "Which crops are grown in SA? (Select all)", "options": ["Maize", "Wheat", "Sugarcane", "Citrus fruits"], "correct": [0,1,2,3]},
  {"type": "rating", "question": "How important is agriculture to rural communities? (1-5)", "scale": 5}
]', 100, true),

('task-eco-03', 'Tourism Industry Impact', 'Understanding tourism''s role in SA economy', 'Economy', 0.80, '[
  {"type": "multiple_choice", "question": "Which is SA''s most visited tourist attraction?", "options": ["Table Mountain", "Kruger National Park", "Robben Island", "Victoria Falls"], "correct": 0},
  {"type": "multiple_choice", "question": "What type of tourism is SA most famous for?", "options": ["Beach tourism", "Safari tourism", "Cultural tourism", "Adventure tourism"], "correct": 1},
  {"type": "checkbox", "question": "Which contribute to SA tourism? (Select all)", "options": ["Wildlife", "Wine routes", "Beaches", "History"], "correct": [0,1,2,3]},
  {"type": "text", "question": "Name a popular safari destination in SA"},
  {"type": "rating", "question": "Rate SA as a tourist destination (1-5)", "scale": 5}
]', 100, true),

('task-eco-04', 'Manufacturing and Industry', 'Learn about SA''s industrial and manufacturing sectors', 'Economy', 0.85, '[
  {"type": "multiple_choice", "question": "Which city is SA''s main industrial hub?", "options": ["Cape Town", "Johannesburg", "Durban", "Port Elizabeth"], "correct": 1},
  {"type": "multiple_choice", "question": "What is SA''s largest manufacturing industry?", "options": ["Automotive", "Food processing", "Textiles", "Chemicals"], "correct": 0},
  {"type": "text", "question": "Name a major SA automotive manufacturer"},
  {"type": "checkbox", "question": "Which industries are important in SA? (Select all)", "options": ["Steel", "Chemicals", "Automotive", "Electronics"], "correct": [0,1,2,3]},
  {"type": "rating", "question": "Rate the importance of manufacturing jobs (1-5)", "scale": 5}
]', 100, true);

-- Create function to get daily tasks based on rotation
CREATE OR REPLACE FUNCTION get_daily_tasks(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  reward_amount DECIMAL,
  questions JSONB,
  max_completions INTEGER,
  is_active BOOLEAN
) AS $$
DECLARE
  day_offset INTEGER;
  tasks_per_day INTEGER := 10; -- Show 10 tasks per day
BEGIN
  -- Calculate day offset from a reference date (e.g., 2024-01-01)
  day_offset := (target_date - DATE '2024-01-01')::INTEGER;
  
  -- Return rotated selection of tasks
  RETURN QUERY
  SELECT dt.id, dt.title, dt.description, dt.category, dt.reward_amount, dt.questions, dt.max_completions, dt.is_active
  FROM daily_tasks dt
  WHERE dt.is_active = true
  ORDER BY 
    -- Use modulo to create rotation based on day
    (ABS(HASHTEXT(dt.id::TEXT) + day_offset) % 1000)
  LIMIT tasks_per_day;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user can do task (24 hour cooldown)
CREATE OR REPLACE FUNCTION can_user_do_task(user_id UUID, task_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_completion TIMESTAMP;
BEGIN
  -- Get the most recent completion of this task by this user
  SELECT MAX(completed_at) INTO last_completion
  FROM task_completions tc
  WHERE tc.user_id = can_user_do_task.user_id 
    AND tc.task_id = can_user_do_task.task_id;
  
  -- If never completed, or completed more than 24 hours ago, allow
  RETURN (last_completion IS NULL OR last_completion < NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;
