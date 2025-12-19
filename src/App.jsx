import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

import loginService from './services/login'
import blogService from './services/blogs'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs => setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      if (user.token) {
        blogService.setToken(user.token)
      }
    }
  }, [])

  const notify = (message) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      if (user.token) {
        blogService.setToken(user.token)
      }
      setUser(user)
      setUsername('')
      setPassword('')
      notify(`welcome ${user.name || user.username}`)
    } catch (error) {
      notify('wrong credentials')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const addBlog = async (event) => {
    event.preventDefault()
    try {
      const blogObject = {
        title: newTitle,
        author: newAuthor,
        url: newUrl
      }
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      setNewTitle('')
      setNewAuthor('')
      setNewUrl('')
      if (blogFormRef.current) {
        blogFormRef.current.toggleVisibility()
      }
      notify(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`)
    } catch (error) {
      notify('creating blog failed')
    }
  }

  const updateLikes = async (blog) => {
  const userId = blog.user && blog.user.id ? blog.user.id : null

  const updated = {
    ...blog,
    likes: blog.likes + 1,
    user: userId
  }

  const result = await blogService.update(blog.id, updated)

  // у стейті зберігаємо старий user-об'єкт (може бути null)
  setBlogs(blogs.map(b =>
    b.id === blog.id ? { ...result, user: blog.user } : b
  ))
}



  const removeBlog = async (blog) => {
    const ok = window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)
    if (!ok) return
    await blogService.remove(blog.id)
    setBlogs(blogs.filter(b => b.id !== blog.id))
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  if (user === null) {
    return (
      <div>
        <h2>log in to application</h2>
        <Notification message={notification} />
        {loginForm()}
      </div>
    )
  }
    if (!Array.isArray(blogs)) {
      console.log('blogs is NOT array:', blogs)
      return null
    }
    return (
    <div>
      <h2>blogs</h2>
      <Notification message={notification} />
      <p>
        {user.name || user.username} logged in
        <button onClick={handleLogout}>logout</button>
      </p>

      <Togglable buttonLabel="new blog" ref={blogFormRef}>
        <BlogForm
          onSubmit={addBlog}
          title={newTitle}
          author={newAuthor}
          url={newUrl}
          handleTitleChange={({ target }) => setNewTitle(target.value)}
          handleAuthorChange={({ target }) => setNewAuthor(target.value)}
          handleUrlChange={({ target }) => setNewUrl(target.value)}
        />
      </Togglable>

      {blogs
        .slice()
        .sort((a, b) => b.likes - a.likes)
        .map(blog => (
          <Blog
            key={blog.id}
            blog={blog}
            handleLike={() => updateLikes(blog)}
            handleRemove={() => removeBlog(blog)}
            user={user}
          />
        ))}
    </div>
  )
}

export default App
