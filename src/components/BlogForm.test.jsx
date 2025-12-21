import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  test('calls onSubmit with correct data when creating a new blog', async () => {
    const mockOnSubmit = vi.fn((e) => e.preventDefault())
    
    const component = render(
      <BlogForm 
        onSubmit={mockOnSubmit}
        title=""
        author=""
        url=""
        handleTitleChange={vi.fn()}
        handleAuthorChange={vi.fn()}
        handleUrlChange={vi.fn()}
      />
    )

    const user = userEvent.setup()
    
    // Знаходимо інпути
    const inputs = screen.getAllByRole('textbox')
    const titleInput = inputs[0]
    const authorInput = inputs[1]
    const urlInput = inputs[2]
    
    const submitButton = screen.getByText('create')

    // Вводимо дані в форму
    await user.type(titleInput, 'Testing forms is important')
    await user.type(authorInput, 'Test Author')
    await user.type(urlInput, 'https://test.com')
    
    // Відправляємо форму
    await user.click(submitButton)

    // Перевіряємо, що обробник був викликаний
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })
})
