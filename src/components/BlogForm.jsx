// src/components/BlogForm.jsx
import PropTypes from 'prop-types'

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
    <form onSubmit={onSubmit}>
      <div>
        title
        <input
          value={title}
          onChange={handleTitleChange}
        />
      </div>
      <div>
        author
        <input
          value={author}
          onChange={handleAuthorChange}
        />
      </div>
      <div>
        url
        <input
          value={url}
          onChange={handleUrlChange}
        />
      </div>
      <button type="submit">create</button>
    </form>
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
