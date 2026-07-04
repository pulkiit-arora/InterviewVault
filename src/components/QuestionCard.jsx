import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { formatQuestionForDisplay } from '../utils/questionHelpers'

export default React.memo(function QuestionCard({ q }) {
  const [isOpen, setIsOpen] = useState(false)
  const normalized = formatQuestionForDisplay(q)
  const isNewSchema = typeof q.answer === 'object'

  return (
    <article className="card">
      <h3>{q.title}</h3>
      <div className="meta">id: {q.id} • years: {q.years}</div>
      {q.tags && q.tags.length > 0 && (
        <div className="tags" aria-hidden>
          {q.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
      
      <div className="question-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="code-block"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="inline-code" {...props}>{children}</code>
              )
            }
          }}
        >
          {q.question}
        </ReactMarkdown>
      </div>

      <details onToggle={(e) => setIsOpen(e.target.open)}>
        <summary>Answer</summary>
        {isOpen && (
          <div className="answer-content">
            {isNewSchema ? (
              <>
              {normalized.answer.summary && (
                <p className="answer-summary">{normalized.answer.summary}</p>
              )}
              
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="code-block"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="inline-code" {...props}>{children}</code>
                    )
                  }
                }}
              >
                {normalized.answer.content}
              </ReactMarkdown>

              {normalized.answer.codeExamples && normalized.answer.codeExamples.length > 0 && (
                <div className="code-examples">
                  <h4>Code Examples</h4>
                  {normalized.answer.codeExamples.map((example, idx) => (
                    <div key={idx} className="code-example">
                      {example.title && <h5>{example.title}</h5>}
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={example.language}
                        PreTag="div"
                        className="code-block"
                      >
                        {example.code}
                      </SyntaxHighlighter>
                      {example.explanation && (
                        <p className="code-explanation">{example.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {normalized.answer.images && normalized.answer.images.length > 0 && (
                <div className="answer-images">
                  <h4>Images</h4>
                  {normalized.answer.images.map((img, idx) => (
                    <figure key={idx}>
                      <img src={img.src} alt={img.alt} />
                      {img.caption && <figcaption>{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}

              {normalized.answer.videos && normalized.answer.videos.length > 0 && (
                <div className="answer-videos">
                  <h4>Videos</h4>
                  {normalized.answer.videos.map((video, idx) => (
                    <div key={idx} className="video-wrapper">
                      {video.type === 'youtube' ? (
                        <iframe
                          width="560"
                          height="315"
                          src={video.src.replace('watch?v=', 'embed/')}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video controls width="100%">
                          <source src={video.src} />
                        </video>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {normalized.answer.resources && normalized.answer.resources.length > 0 && (
                <div className="answer-resources">
                  <h4>Resources</h4>
                  <ul>
                    {normalized.answer.resources.map((resource, idx) => (
                      <li key={idx}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <pre className="legacy-answer">{q.answer}</pre>
          )}
          </div>
        )}
      </details>
    </article>
  )
})
