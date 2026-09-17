import React, { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import TurndownService from 'turndown'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import LinkIcon from '@mui/icons-material/Link'

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface ToolbarItem {
  key: string
  command: string
  value?: string
  title: string
  icon?: React.ElementType
  label?: string
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const lastHtmlRef = useRef<string>('')
  const lastMarkdownRef = useRef<string>('')
  const savedRangeRef = useRef<Range | null>(null)

  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

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

  const toolbar = useMemo<ToolbarItem[]>(
    () => [
      { key: 'bold', command: 'bold', title: 'Bold', icon: FormatBoldIcon },
      { key: 'italic', command: 'italic', title: 'Italic', icon: FormatItalicIcon },
      { key: 'underline', command: 'underline', title: 'Underline', icon: FormatUnderlinedIcon },
      { key: 'h2', command: 'formatBlock', value: 'h2', title: 'Heading 2', label: 'H2' },
      { key: 'h3', command: 'formatBlock', value: 'h3', title: 'Heading 3', label: 'H3' },
      { key: 'ul', command: 'insertUnorderedList', title: 'Bulleted list', icon: FormatListBulletedIcon },
      { key: 'ol', command: 'insertOrderedList', title: 'Numbered list', icon: FormatListNumberedIcon },
      { key: 'quote', command: 'formatBlock', value: 'blockquote', title: 'Quote', icon: FormatQuoteIcon },
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

  const applyCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    syncValue()
  }

  const openLinkDialog = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    }
    setLinkUrl('')
    setLinkDialogOpen(true)
  }

  const confirmLink = () => {
    const url = linkUrl.trim()
    setLinkDialogOpen(false)
    if (!url) return
    editorRef.current?.focus()
    const selection = window.getSelection()
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges()
      selection.addRange(savedRangeRef.current)
    }
    applyCommand('createLink', url)
    savedRangeRef.current = null
  }

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 0.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
          {toolbar.map((item) => {
            const Icon = item.icon
            return (
              <Tooltip key={item.key} title={item.title}>
                <IconButton
                  size="small"
                  onClick={() => applyCommand(item.command, item.value)}
                  sx={item.label ? { fontSize: 13, fontWeight: 700, width: 32, height: 32 } : undefined}
                >
                  {Icon ? <Icon fontSize="small" /> : item.label}
                </IconButton>
              </Tooltip>
            )
          })}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Insert link">
            <IconButton size="small" onClick={openLinkDialog}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Box
        ref={editorRef}
        className="editor-content"
        contentEditable
        data-placeholder={placeholder}
        onInput={syncValue}
        suppressContentEditableWarning
        sx={{
          width: '100%',
          minHeight: 160,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 2,
          py: 1.5,
          fontSize: 14,
          lineHeight: 1.6,
          '&:focus': { outline: 'none', borderColor: 'primary.main' },
        }}
      />

      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Insert link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="URL"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                confirmLink()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmLink}>
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WysiwygEditor
