import './App.css'

import {useEffect, useState} from 'react'

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin'
import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer'
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin'
import {ContentEditable} from '@lexical/react/LexicalContentEditable'
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin'
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import ToolbarPlugin from './plugins/ToolbarPlugin'
import {
  ExerciseNode,
  ExerciseNodeTransformations,
  SolutionNode,
  TaskNode,
} from './plugins/exercise'
import {TreeView} from '@lexical/react/LexicalTreeView'

export default function App() {
  const initialConfig: InitialConfigType = {
    namespace: 'MyEditor',
    nodes: [ExerciseNode, SolutionNode, TaskNode],
    onError(error) {
      console.error('Editor error:', error)
    },
  }

  return (
    <main className="prose p-10">
      <h1>Lexical text editor:</h1>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="mb-4 relative border border-gray-300 rounded-lg p-4">
          <ToolbarPlugin />
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
          <ExerciseNodeTransformations />
        </div>
        <DebugPanel />
      </LexicalComposer>
    </main>
  )
}

function DebugPanel() {
  const [editor] = useLexicalComposerContext()

  return <TreeView editor={editor} treeTypeButtonClassName='button' />
}
