/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import UndoIcon from './icons/arrow-counterclockwise.svg'
import RedoIcon from './icons/arrow-clockwise.svg'
import BoldIcon from './icons/type-bold.svg'
import ItalicIcon from './icons/type-italic.svg'
import UnderlineIcon from './icons/type-underline.svg'

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import {mergeRegister} from '@lexical/utils'
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import {useCallback, useEffect, useRef, useState} from 'react'
import {insertExercise} from './exercise'
import {$getSelectedTopLevelNode} from './utils'

function Divider() {
  return <div className="toolbar-divider" />
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, $updateToolbar])

  return (
    <div className="toolbar" ref={toolbarRef}>
      <div>
        <button
          disabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined)
          }}
          className="toolbar-item spaced"
          aria-label="Undo"
          type="button"
        >
          <UndoIcon />
        </button>
        <button
          disabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined)
          }}
          className="toolbar-item"
          aria-label="Redo"
          type="button"
        >
          <RedoIcon />
        </button>
        <Divider />
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
          }}
          className={`toolbar-item spaced ${isBold ? 'active' : ''}`}
          aria-label="Format Bold"
          type="button"
        >
          <BoldIcon />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
          }}
          className={`toolbar-item spaced ${isItalic ? 'active' : ''}`}
          aria-label="Format Italics"
          type="button"
        >
          <ItalicIcon />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          }}
          className={`toolbar-item spaced ${isUnderline ? 'active' : ''}`}
          aria-label="Format Underline"
          type="button"
        >
          <UnderlineIcon />
        </button>
      </div>
      <div>
        <button
          onClick={() => insertExercise(editor)}
          className="toolbar-item spaced active"
          aria-label="Add exercise"
          type="button"
        >
          Add Exercise
        </button>
        <button
          onClick={() => {
            editor.update(() => {
              const topLevel = $getSelectedTopLevelNode()

              topLevel.insertAfter(
                $createParagraphNode().append(
                  $createTextNode('Paragraph Node...'),
                ),
              )
            })
          }}
          className="toolbar-item spaced active"
          aria-label="Add Paragraph"
          type="button"
        >
          Add Paragraph
        </button>
      </div></div>
  )
}
