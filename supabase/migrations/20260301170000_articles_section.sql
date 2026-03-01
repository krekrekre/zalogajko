-- Add section (blog | saveti) to articles so admin can choose where the article appears.
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'blog'
    CHECK (section IN ('blog', 'saveti'));

-- Allow same slug on different sections: unique on (section, slug)
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_section_slug ON articles(section, slug);

CREATE INDEX IF NOT EXISTS idx_articles_section ON articles(section);
