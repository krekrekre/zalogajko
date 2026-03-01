-- Fix broken Unsplash image (404) for Mušaka porodična
update public.recipes
set image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80'
where image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f2b26?w=800&q=80';
