import './App.css'

import { useEffect, useState } from 'react'

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

export default function App() {
  const [editorState, setEditorState] = useState<unknown>(null)

  const initialConfig: InitialConfigType = {
    namespace: 'MyEditor',
    onError(error) {
      console.error('Editor error:', error)
    },
  }

  return (
    <main className="prose p-10">
      <h1>Lexical text editor:</h1>
      <section className="mb-4 relative border border-gray-300 rounded-lg p-4">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-placeholder={'Enter some text...'}
                placeholder={
                  <div className="editor-placeholder p-4">
                    Enter some text...
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <MyOnChangePlugin onChange={setEditorState} />
        </LexicalComposer>
      </section>
      <h2>Editor state:</h2>
      <pre className="p-4 rounded-lg">
        {editorState ? JSON.stringify(editorState, null, 2) : 'No state yet'}
      </pre>
    </main>
  )
}

function MyOnChangePlugin({
  onChange,
}: { onChange: (editorState: unknown) => void }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState)
    })
  }, [editor, onChange])
  return null
}
