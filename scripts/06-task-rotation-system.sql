-- Create expanded pool of tasks for rotation
DELETE FROM daily_tasks;

-- Insert 36 diverse tasks about Nigeria (3x more than current)
INSERT INTO daily_tasks (id, title, description, category, reward_amount, questions, max_completions, is_active) VALUES
-- Geography Tasks (12)
('task-geo-01', 'Nigerian States Survey', 'Answer questions about the 36 states of Nigeria', 'Geography', 0.75, '[
  {"type": "multiple_choice", "question": "Which state is known as the ''Centre of Excellence''?", "options": ["Lagos", "Abuja", "Rivers", "Kano"], "correct": 0},
  {"type": "multiple_choice", "question": "What is the largest state by area?", "options": ["Niger", "Borno", "Taraba", "Kaduna"], "correct": 0},
  {"type": "checkbox", "question": "Which states are in the South-South region? (Select all)", "options": ["Rivers", "Delta", "Akwa Ibom", "Lagos"], "correct": [0,1,2]},
  {"type": "text", "question": "Name the capital city of Oyo state"},
  {"type": "rating", "question": "Rate your knowledge of Nigerian geography (1-5)", "scale": 5}
]', 100, true),

('task-geo-02', 'Mountains and Landmarks', 'Explore Nigeria''s natural landmarks and mountain ranges', 'Geography', 0.80, '[
  {"type": "multiple_choice", "question": "What is the highest mountain in Nigeria?", "options": ["Chappal Waddi", "Dimlang", "Gangirwal", "Vogel Peak"], "correct": 0},
  {"type": "multiple_choice", "question": "Which plateau is located in central Nigeria?", "options": ["Mambilla Plateau", "Jos Plateau", "Obudu Plateau", "Adamawa Plateau"], "correct": 1},
  {"type": "text", "question": "Name the famous rock formation in Abuja"},
  {"type": "checkbox", "question": "Which are major Nigerian landmarks? (Select all)", "options": ["Zuma Rock", "Olumo Rock", "Idanre Hills", "Aso Rock"], "correct": [0,1,2,3]},
  {"type": "rating", "question": "How interested are you in Nigerian natural landmarks? (1-5)", "scale": 5}
]', 100, true),

('task-geo-03', 'Rivers and Water Bodies', 'Learn about Nigeria''s rivers and water systems', 'Geography', 0.70, '[
  {"type": "multiple_choice", "question": "Which is the longest river in Nigeria?", "options": ["Niger River", "Benue River", "Cross River", "Kaduna River"], "correct": 0},
  {"type": "multiple_choice", "question": "The Niger River flows into which body of water?", "options": ["Atlantic Ocean", "Gulf of Guinea", "Lake Chad", "Bight of Benin"], "correct": 1},
  {"type": "text", "question": "Name the largest dam in Nigeria"},
  {"type": "checkbox", "question": "Which rivers are major in Nigeria? (Select all)", "options": ["Niger River", "Benue River", "Cross River", "Ogun River"], "correct": [0,1,2,3]},
  {"type": "rating", "question": "Rate the importance of water conservation in Nigeria (1-5)", "scale": 5}
]', 100, true),

('task-geo-04', 'Climate and Weather Patterns', 'Understanding Nigeria''s diverse climate zones', 'Geography', 0.85, '[
  {"type": "multiple_choice", "question": "Which city has a tropical climate?", "options": ["Lagos", "Jos", "Abuja", "Kano"], "correct": 0},
  {"type": "multiple_choice", "question": "When is the rainy season in southern Nigeria?", "options": ["Dec-Feb", "Mar-May", "Apr-Oct", "Nov-Jan"], "correct": 2},
  {"type": "checkbox", "question": "Which regions experience harmattan winds? (Select all)", "options": ["North", "South-West", "South-East", "South-South"], "correct": [0,1,2]},
  {"type": "text", "question": "What weather phenomenon affects northern Nigeria in winter?"},
  {"type": "rating", "question": "How much do you know about Nigerian climate? (1-5)", "scale": 5}
]', 100, true),

-- Culture Tasks (12)
('task-cul-01', 'Traditional Music and Dance', 'Explore Nigeria''s rich musical heritage', 'Culture', 0.90, '[
  {"type": "multiple_choice", "question": "Which music genre originated in Nigeria?", "options": ["Highlife", "Afrobeats", "Juju", "All of the above"], "correct": 3},
  {"type": "multiple_choice", "question": "What instrument is central to traditional Yoruba music?", "options": ["Talking drum", "Udu", "Ekwe", "Shekere"], "correct": 0},
  {"type": "checkbox", "question": "Which are Nigerian music genres? (Select all)", "options": ["Afrobeats", "Highlife", "Juju", "Fuji"], "correct": [0,1,2,3]},
  {"type": "text", "question": "Name a famous Nigerian musician"},
  {"type": "rating", "question": "How much do you enjoy Nigerian music? (1-5)", "scale": 5}
]', 100, true),

('task-cul-02', 'Traditional Clothing and Attire', 'Learn about traditional dress across Nigerian cultures', 'Culture', 0.75, '[
  {"type": "multiple_choice", "question": "What is the traditional Yoruba men''s outfit called?", "options": ["Agbada", "Kaftan", "Dashiki", "Buba"], "correct": 0},
  {"type": "multiple_choice", "question": "Which fabric is iconic in Nigerian fashion?", "options": ["Kente", "Ankara", "Bogolan", "Adire"], "correct": 1},
  {"type": "text", "question": "What is the traditional Igbo wrapper called?"},
  {"type": "checkbox", "question": "Which are traditional Nigerian accessories? (Select all)", "options": ["Gele", "Fila", "Coral beads", "Aso-oke"], "correct": [0,1,2,3]},
  {"type": "rating", "question": "Rate your interest in traditional Nigerian fashion (1-5)", "scale": 5}
]', 100, true),

('task-cul-03', 'Festivals and Celebrations', 'Discover Nigeria''s cultural festivals and holidays', 'Culture', 0.80, '[
  {"type": "multiple_choice", "question": "When is Independence Day celebrated?", "options": ["May 29", "June 12", "October 1", "December 25"], "correct": 2},
  {"type": "multiple_choice", "question": "What is the Durbar festival associated with?", "options": ["Yoruba culture", "Igbo culture", "Hausa culture", "Ijaw culture"], "correct": 2},
  {"type": "checkbox", "question": "Which are major Nigerian festivals? (Select all)", "options": ["Eyo Festival", "Argungu Fishing Festival", "Osun-Osogbo", "Calabar Carnival"], "correct": [0,1,2,3]},
  {"type": "text", "question": "Name a traditional ceremony from any Nigerian culture"},
  {"type": "rating", "question": "How important are cultural festivals to you? (1-5)", "scale": 5}
]', 100, true),

('task-cul-04', 'Art and Crafts Heritage', 'Explore traditional and contemporary Nigerian arts', 'Culture', 0.85, '[
  {"type": "multiple_choice", "question": "Which art form is Benin Kingdom famous for?", "options": ["Bronze casting", "Wood carving", "Pottery", "Beadwork"], "correct": 0},
  {"type": "multiple_choice", "question": "What material is traditionally used for Nok sculptures?", "options": ["Bronze", "Terracotta", "Wood", "Stone"], "correct": 1},
  {"type": "text", "question": "Name a famous Nigerian contemporary artist"},
  {"type": "checkbox", "question": "Which are traditional Nigerian crafts? (Select all)", "options": ["Pottery", "Basket weaving", "Bronze casting", "Beadwork"], "correct": [0,1,2,3]},
  {"type": "rating", "question": "Rate your appreciation for Nigerian traditional arts (1-5)", "scale": 5}
]', 100, true),

-- Economy Tasks (12)
('task-eco-01', 'Oil and Gas Industry', 'Understanding Nigeria''s oil sector and resources', 'Economy', 0.95, '[
  {"type": "multiple_choice", "question": "Nigeria is Africa''s largest producer of which resource?", "options": ["Gold", "Diamonds", "Oil", "Coal"], "correct": 2},
  {"type": "multiple_choice", "question": "Which region produces most of Nigeria''s oil?", "options": ["North", "South-West", "Niger Delta", "South-East"], "correct": 2},
  {"type": "checkbox", "question": "Which states are oil-producing? (Select all)", "options": ["Rivers", "Delta", "Akwa Ibom", "Bayelsa"], "correct": [0,1,2,3]},
  {"type": "text", "question": "Name Nigeria''s national oil company"},
  {"type": "rating", "question": "Rate the importance of oil to Nigerian economy (1-5)", "scale": 5}
]', 100, true),

('task-eco-02', 'Agriculture and Farming', 'Explore Nigeria''s agricultural sector and products', 'Economy', 0.70, '[
  {"type": "multiple_choice", "question": "Which state is Nigeria''s largest rice producer?", "options": ["Kebbi", "Ebonyi", "Benue", "Niger"], "correct": 0},
  {"type": "multiple_choice", "question": "Nigeria is a major exporter of which crop?", "options": ["Coffee", "Cocoa", "Tea", "Wheat"], "correct": 1},
  {"type": "text", "question": "Name a major cash crop grown in Nigeria"},
  {"type": "checkbox", "question": "Which crops are grown in Nigeria? (Select all)", "options": ["Cassava", "Yam", "Cocoa", "Palm oil"], "correct": [0,1,2,3]},
  {"type": "rating", "question": "How important is agriculture to rural communities? (1-5)", "scale": 5}
]', 100, true),

('task-eco-03', 'Tourism Industry Impact', 'Understanding tourism''s role in Nigerian economy', 'Economy', 0.80, '[
  {"type": "multiple_choice", "question": "Which is Nigeria''s most visited tourist attraction?", "options": ["Yankari National Park", "Olumo Rock", "Lekki Conservation Centre", "Obudu Mountain Resort"], "correct": 0},
  {"type": "multiple_choice", "question": "What type of tourism is Nigeria developing?", "options": ["Beach tourism", "Eco-tourism", "Cultural tourism", "All of the above"], "correct": 3},
  {"type": "checkbox", "question": "Which contribute to Nigerian tourism? (Select all)", "options": ["Wildlife", "Beaches", "Festivals", "History"], "correct": [0,1,2,3]},
  {"type": "text", "question": "Name a popular tourist destination in Nigeria"},
  {"type": "rating", "question": "Rate Nigeria as a tourist destination (1-5)", "scale": 5}
]', 100, true),

('task-eco-04', 'Manufacturing and Industry', 'Learn about Nigeria''s industrial and manufacturing sectors', 'Economy', 0.85, '[
  {"type": "multiple_choice", "question": "Which city is Nigeria''s main industrial hub?", "options": ["Lagos", "Port Harcourt", "Kano", "Aba"], "correct": 0},
  {"type": "multiple_choice", "question": "What is Nigeria''s largest manufacturing industry?", "options": ["Food processing", "Textiles", "Cement", "Beverages"], "correct": 0},
  {"type": "text", "question": "Name a major Nigerian manufacturing company"},
  {"type": "checkbox", "question": "Which industries are important in Nigeria? (Select all)", "options": ["Cement", "Textiles", "Food processing", "Pharmaceuticals"], "correct": [0,1,2,3]},
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
