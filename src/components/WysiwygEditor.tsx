import React, { useEffect, useMemo, useRef } from 'react'
import { marked } from 'marked'
import TurndownService from 'turndown'

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const lastHtmlRef = useRef<string>('')
  const lastMarkdownRef = useRef<string>('')

  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    })

    service.addRule('underline', {
      filter: ['u'],
      replacement: (content) => `<u>${content}</u>`,
    })

    service.addRule('strikethrough', {
      filter: ['del', 's'],
      replacement: (content) => `~~${content}~~`,
    })

    return service
  }, [])

  const toolbar = useMemo(
    () => [
      { label: 'B', command: 'bold', title: 'Bold' },
      { label: 'I', command: 'italic', title: 'Italic' },
      { label: 'U', command: 'underline', title: 'Underline' },
      { label: 'H2', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
      { label: 'H3', command: 'formatBlock', value: 'h3', title: 'Heading 3' },
      { label: '-', command: 'insertUnorderedList', title: 'Bulleted list' },
      { label: '1.', command: 'insertOrderedList', title: 'Numbered list' },
      { label: '"', command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    ],
    [],
  )

  useEffect(() => {
    if (!editorRef.current) return
    if (value === lastMarkdownRef.current) return

    const html = marked.parse(value || '', { breaks: true }) as string
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html
      lastHtmlRef.current = html
      lastMarkdownRef.current = value
    }
  }, [value])

  const syncValue = () => {
    const html = editorRef.current?.innerHTML ?? ''
    if (html === lastHtmlRef.current) return
    lastHtmlRef.current = html
    const markdown = turndownService.turndown(html)
    lastMarkdownRef.current = markdown
    onChange(markdown)
  }

  const applyCommand = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    syncValue()
  }

  const insertLink = () => {
    const url = window.prompt('Enter URL')
    if (url) {
      applyCommand('createLink', url)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {toolbar.map((item) => (
          <button
            key={`${item.command}-${item.label}`}
            type="button"
            className="btn btn-sm btn-outline"
            title={item.title}
            onClick={() => applyCommand(item.command, item.value)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-outline"
          title="Insert link"
          onClick={insertLink}
        >
          Link
        </button>
      </div>

      <div
        ref={editorRef}
        className="editor-content w-full rounded-lg border border-base-content/20 bg-base-200 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-primary/40"
        contentEditable
        data-placeholder={placeholder}
        onInput={syncValue}
        suppressContentEditableWarning
      />
    </div>
  )
}

export default WysiwygEditor
