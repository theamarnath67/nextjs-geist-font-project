import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'content')

export interface BlogPost {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  readTime: string
  author: string
  content: string
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  readTime: string
  author: string
}

export function getAllPosts(): BlogPostMeta[] {
  try {
    // Check if content directory exists
    if (!fs.existsSync(contentDirectory)) {
      console.warn('Content directory does not exist')
      return []
    }

    const fileNames = fs.readdirSync(contentDirectory)
    const allPostsData = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(contentDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data } = matter(fileContents)

        return {
          slug,
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString(),
          category: data.category || 'Uncategorized',
          excerpt: data.excerpt || '',
          readTime: data.readTime || '5 min read',
          author: data.author || 'Anonymous'
        }
      })

    // Sort posts by date (newest first)
    return allPostsData.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  } catch (error) {
    console.error('Error reading blog posts:', error)
    return []
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`)
    
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      category: data.category || 'Uncategorized',
      excerpt: data.excerpt || '',
      readTime: data.readTime || '5 min read',
      author: data.author || 'Anonymous',
      content
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export function getPostsByCategory(category: string): BlogPostMeta[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => 
    post.category.toLowerCase() === category.toLowerCase()
  )
}

export function getCategories(): string[] {
  const allPosts = getAllPosts()
  const categories = allPosts.map(post => post.category)
  return Array.from(new Set(categories))
}

export function getFeaturedPosts(limit: number = 3): BlogPostMeta[] {
  const allPosts = getAllPosts()
  return allPosts.slice(0, limit)
}
