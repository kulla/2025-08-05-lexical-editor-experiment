import './App.css'

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import {
  type InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TreeView } from '@lexical/react/LexicalTreeView'
import {
  ExerciseNode,
  ExerciseNodeTransformations,
  SolutionNode,
  TaskNode,
} from './plugins/exercise'
import ToolbarPlugin from './plugins/ToolbarPlugin'

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

  return (
    <TreeView
      editor={editor}
      treeTypeButtonClassName="btn btn-soft btn-primary mr-2"
      timeTravelButtonClassName="btn btn-soft btn-primary"
      timeTravelPanelButtonClassName="btn btn-soft btn-primary mr-4"
      timeTravelPanelSliderClassName="range range-primary mr-4"
    />
  )
}
