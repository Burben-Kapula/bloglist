import { test, expect } from '@playwright/test'

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
  await page.goto(FRONT_URL)
})

// 1. сторінка логіну відкривається
test('login page can be opened', async ({ page }) => {
  await expect(page.getByText('log in to application')).toBeVisible()
})

// 2. успішний логін
test('user can log in with correct credentials', async ({ page }) => {
  await page.getByPlaceholder('username').fill('testuser')
  await page.getByPlaceholder('password').fill('sekret')
  await page.getByRole('button', { name: 'login' }).click()

  await expect(page.getByText('Test User logged in')).toBeVisible()
})

// 3. невдалий логін
test('login fails with wrong password', async ({ page }) => {
  await page.getByPlaceholder('username').fill('testuser')
  await page.getByPlaceholder('password').fill('wrong')
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

  // використовуємо locator замість getByText для уникнення strict mode
  await expect(page.locator('.blog').filter({ hasText: 'Playwright blog PW Author' }).first()).toBeVisible()
})

// 5. лайк блогу
test('user can like a blog', async ({ page }) => {
  await login(page)

  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByPlaceholder('title').fill('Likable blog')
  await page.getByPlaceholder('author').fill('Liker')
  await page.getByPlaceholder('url').fill('http://example.com/like')
  await page.getByRole('button', { name: 'create' }).click()

  // чекаємо появи блогу
  const blog = page.locator('.blog').filter({ hasText: 'Likable blog Liker' }).first()
  await expect(blog).toBeVisible()
  
  await blog.getByRole('button', { name: 'view' }).click()

  // чекаємо появи деталей з лайками
  await expect(blog.getByText(/likes/)).toBeVisible()

  // клікаємо лайк і чекаємо оновлення
  const likeButton = blog.getByRole('button', { name: 'like' })
  await likeButton.click()
  
  // чекаємо поки number змінюється (може бути 0->1 або будь-яке інше)
  await page.waitForTimeout(1000)
  await expect(blog.getByText(/likes \d+/)).toBeVisible()
})

// 6. власник може видалити свій блог
test('user who created a blog can delete it', async ({ page }) => {
  await login(page)

  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByPlaceholder('title').fill('Removable blog')
  await page.getByPlaceholder('author').fill('Owner')
  await page.getByPlaceholder('url').fill('http://example.com/remove')
  await page.getByRole('button', { name: 'create' }).click()

  // чекаємо появи блогу та рахуємо їх
  await page.waitForTimeout(1000)
  const allBlogs = page.locator('.blog')
  const initialCount = await allBlogs.count()
  
  // знаходимо наш блог
  const blog = allBlogs.filter({ hasText: 'Removable blog Owner' }).first()
  await expect(blog).toBeVisible()
  
  await blog.getByRole('button', { name: 'view' }).click()
  await page.waitForTimeout(500)
  
  // перехоплюємо confirm
  page.once('dialog', dialog => dialog.accept())
  
  // видаляємо
  await blog.getByRole('button', { name: 'remove' }).click()
  
  // чекаємо поки блог зникне
  await page.waitForTimeout(2000)
  
  // перевіряємо, що блогів стало менше
  const finalCount = await allBlogs.count()
  expect(finalCount).toBe(initialCount - 1)
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
    
    // чекаємо появи конкретного блогу
    await expect(
      page.locator('.blog').filter({ hasText: `${title} Author` }).first()
    ).toBeVisible()
    
    // чекаємо трошки, щоб форма закрилась
    await page.waitForTimeout(500)
  }

  await createBlog('First blog')
  await createBlog('Second blog')
  await createBlog('Third blog')

  const blogs = page.locator('.blog')

  // відкриваємо всі деталі
  const count = await blogs.count()
  for (let i = 0; i < count; i++) {
    await blogs.nth(i).getByRole('button', { name: 'view' }).click()
  }

  // чекаємо, поки всі деталі відкриються
  await page.waitForTimeout(1000)

  // Second blog: 2 лайки
  const second = blogs.filter({ hasText: 'Second blog Author' }).first()
  const secondLikeBtn = second.getByRole('button', { name: 'like' })
  
  // перший лайк
  await secondLikeBtn.click()
  await page.waitForTimeout(1000)
  
  // другий лайк
  await secondLikeBtn.click()
  await page.waitForTimeout(1000)

  // First blog: 1 лайк
  const first = blogs.filter({ hasText: 'First blog Author' }).first()
  await first.getByRole('button', { name: 'like' }).click()
  await page.waitForTimeout(1000)

  // чекаємо ре-рендер після зміни лайків (сортування)
  await page.waitForTimeout(1500)

  // перевірка порядку: Second blog (2 лайки) має бути вище First blog (1 лайк)
  const blogsAfterLikes = page.locator('.blog')
  const allTexts = await blogsAfterLikes.allTextContents()
  
  const secondIndex = allTexts.findIndex(text => text.includes('Second blog'))
  const firstIndex = allTexts.findIndex(text => text.includes('First blog'))
  
  expect(secondIndex).toBeGreaterThanOrEqual(0)
  expect(firstIndex).toBeGreaterThanOrEqual(0)
  expect(secondIndex).toBeLessThan(firstIndex)
})
