# Question Schema Design

## Current Limitations
- Plain text answers only
- No code block support
- No image/video support
- No markdown rendering
- Manual JSON editing required

## Enhanced Question Schema

```json
{
  "id": "unique-id",
  "title": "Question Title",
  "question": "Question text (supports markdown)",
  "answer": {
    "summary": "Brief answer summary",
    "content": "Detailed answer with markdown",
    "codeExamples": [
      {
        "language": "javascript",
        "title": "Example 1",
        "code": "console.log('hello')",
        "explanation": "This code does..."
      }
    ],
    "images": [
      {
        "src": "/images/diagram.png",
        "alt": "Diagram description",
        "caption": "Optional caption"
      }
    ],
    "videos": [
      {
        "src": "https://youtube.com/watch?v=xxx",
        "type": "youtube",
        "title": "Video title"
      }
    ],
    "resources": [
      {
        "title": "Documentation",
        "url": "https://example.com",
        "type": "link"
      }
    ]
  },
  "tags": ["tag1", "tag2"],
  "sublevel": "Topic Name",
  "years": 2,
  "difficulty": "junior|mid|senior",
  "lastUpdated": "2024-01-01"
}
```

## Features
- **Markdown Support**: Question and answer content support markdown
- **Code Examples**: Structured code blocks with language highlighting
- **Images**: Support for diagrams and screenshots
- **Videos**: YouTube and other video platforms
- **Resources**: Links to documentation and further reading
- **Versioning**: Track when questions were last updated
- **Extensible**: Easy to add new content types

## Migration Path
- Old schema still supported for backward compatibility
- Gradual migration to new schema
- Validation script to check schema compliance
