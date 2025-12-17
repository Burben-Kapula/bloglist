import PropTypes from 'prop-types'
import Togglable from './Togglable'
const BlogForm = ({
  onSubmit,
  title,
  author,
  url,
  handleTitleChange,
  handleAuthorChange,
  handleUrlChange
}) => {
  return (
  <Togglable buttonLabel="new blog">
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
  )
}

BlogForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  handleTitleChange: PropTypes.func.isRequired,
  handleAuthorChange: PropTypes.func.isRequired,
  handleUrlChange: PropTypes.func.isRequired,
}

export default BlogForm
