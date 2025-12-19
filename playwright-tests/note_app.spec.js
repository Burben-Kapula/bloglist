import { test, expect } from '@playwright/test'

// адреси підлаштуй, якщо в тебе інші порти
const FRONT_URL = 'http://localhost:5173'
const API_URL = 'http://localhost:3003'

// допоміжна ф‑я: скинути БД і створити користувача
const resetDbAndCreateUser = async (request) => {
  await request.post(`${API_URL}/api/testing/reset`)
  await request.post(`${API_URL}/api/users`, {
    data: {
      username: 'testuser',
      name: 'Test User',
      password: 'sekret',
    },
  })
}

test.beforeEach(async ({ request, page }) => {
  await resetDbAndCreateUser(request)
  await page.goto(`${FRONT_URL}/login`)
})

// 1. сторінка логіну відкривається
test('login page can be opened', async ({ page }) => {
  await expect(page.getByText('log in to application')).toBeVisible()
})

// 2. успішний логін
test('user can log in with correct credentials', async ({ page }) => {
  await page.getByLabel('username').fill('testuser')
  await page.getByLabel('password').fill('sekret')
  await page.getByRole('button', { name: 'login' }).click()

  await expect(page.getByText('Test User logged in')).toBeVisible()
})

// 3. невдалий логін
test('login fails with wrong password', async ({ page }) => {
  await page.getByLabel('username').fill('testuser')
  await page.getByLabel('password').fill('wrong')
  await page.getByRole('button', { name: 'login' }).click()

  await expect(page.getByText('wrong credentials')).toBeVisible()
  await expect(page.getByText('Test User logged in')).not.toBeVisible()
})

// допоміжна ф‑я: залогінитись через UI
const login = async (page) => {
  await page.getByPlaceholder('username').fill('testuser')
  await page.getByPlaceholder('password').fill('sekret')
  await page.getByRole('button', { name: 'login' }).click()
  await expect(page.getByText('Test User logged in')).toBeVisible()
}

// 4. створення блогу
test('logged in user can create a blog', async ({ page }) => {
  await login(page)

  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByPlaceholder('title').fill('Playwright blog')
  await page.getByPlaceholder('author').fill('PW Author')
  await page.getByPlaceholder('url').fill('http://example.com/pw')
  await page.getByRole('button', { name: 'create' }).click()

  await expect(page.getByText('Playwright blog PW Author')).toBeVisible()
})

// 5. лайк блогу
test('user can like a blog', async ({ page }) => {
  await login(page)

  // створюємо блог
  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByPlaceholder('title').fill('Likable blog')
  await page.getByPlaceholder('author').fill('Liker')
  await page.getByPlaceholder('url').fill('http://example.com/like')
  await page.getByRole('button', { name: 'create' }).click()

  const blog = page.getByText('Likable blog Liker')
  await blog.getByRole('button', { name: 'view' }).click()

  const likesText = blog.getByText('likes 0')
  await expect(likesText).toBeVisible()

  await blog.getByRole('button', { name: 'like' }).click()
  await expect(blog.getByText('likes 1')).toBeVisible()
})

// 6. власник може видалити свій блог
test('user who created a blog can delete it', async ({ page }) => {
  await login(page)

  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByPlaceholder('title').fill('Removable blog')
  await page.getByPlaceholder('author').fill('Owner')
  await page.getByPlaceholder('url').fill('http://example.com/remove')
  await page.getByRole('button', { name: 'create' }).click()

  const blog = page.getByText('Removable blog Owner')
  await blog.getByRole('button', { name: 'view' }).click()
  await blog.getByRole('button', { name: 'remove' }).click()

  // у Playwright confirm за замовчуванням приймається, якщо не перехоплювати
  await expect(page.getByText('Removable blog Owner')).not.toBeVisible()
})

// 7. блоги відсортовані за лайками
test('blogs are ordered by likes', async ({ page }) => {
  await login(page)

  const createBlog = async (title) => {
    await page.getByRole('button', { name: 'new blog' }).click()
    await page.getByPlaceholder('title').fill(title)
    await page.getByPlaceholder('author').fill('Author')
    await page.getByPlaceholder('url').fill('http://example.com/' + title)
    await page.getByRole('button', { name: 'create' }).click()
  }

  await createBlog('First blog')
  await createBlog('Second blog')
  await createBlog('Third blog')

  const blogs = page.locator('.blog') // додай className="blog" контейнеру в Blog.jsx

  // відкриваємо всі
  const count = await blogs.count()
  for (let i = 0; i < count; i++) {
    await blogs.nth(i).getByRole('button', { name: 'view' }).click()
  }

  // Second blog: 2 лайки
  const second = blogs.filter({ hasText: 'Second blog' })
  await second.getByRole('button', { name: 'like' }).click()
  await second.getByRole('button', { name: 'like' }).click()

  // First blog: 1 лайк
  const first = blogs.filter({ hasText: 'First blog' })
  await first.getByRole('button', { name: 'like' }).click()

  // перевірка порядку
  const titles = await blogs.allTextContents()
  // очікуємо, що Second blog буде вище за First blog
  expect(titles.indexOf('Second blog Author')).toBeLessThan(
    titles.indexOf('First blog Author'),
  )
})
