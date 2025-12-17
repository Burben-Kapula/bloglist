
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import Blog from './Blog'

const blog = {
  title: 'Component testing is fun',
  author: 'Tester',
  url: 'http://example.com',
  likes: 5,
  user: { name: 'Root' },
}

describe('<Blog />', () => {
  test('renders title and author', () => {
    render(<Blog blog={blog} />)

    const element = screen.getByText('Component testing is fun Tester')
    expect(element).toBeInTheDocument()
  })

  test('by default does not show url and likes, shows them after clicking view', async () => {
    render(<Blog blog={blog} />)

    // до кліку url/likes нема
    expect(screen.queryByText('http://example.com')).toBeNull()
    expect(screen.queryByText('likes 5')).toBeNull()

    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    // після кліку є
    expect(screen.getByText('http://example.com')).toBeInTheDocument()
    expect(screen.getByText('likes 5')).toBeInTheDocument()
  })

  test('clicking like button twice calls event handler twice', async () => {
    const mockHandler = vi.fn()

    render(<Blog blog={blog} handleLike={mockHandler} />)

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockHandler.mock.calls).toHaveLength(2)
  })
})
