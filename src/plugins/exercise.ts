import * as R from 'ramda'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  ElementNode,
  type SerializedElementNode,
  type LexicalEditor,
  $createParagraphNode,
  $createTextNode,
  COMMAND_PRIORITY_HIGH,
  $getSelection,
  $isRangeSelection,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $setSelection,
  type RangeSelection,
  type TextNode,
} from 'lexical'
import { useCallback, useEffect } from 'react'
import { $getSelectedTopLevelNode } from './utils'

export function insertExercise(editor: LexicalEditor): void {
  editor.update(() => {
    const topLevelNode = $getSelectedTopLevelNode()

    topLevelNode.insertAfter($createExerciseNode())
  })
}

export class ExerciseNode extends ElementNode {
  static getType(): string {
    return 'exercise'
  }

  static clone(node: ExerciseNode): ExerciseNode {
    return new ExerciseNode(node.__key)
  }

  static importJSON(): ExerciseNode {
    return new ExerciseNode()
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'exercise',
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'exercise'
    return dom
  }

  updateDOM(): boolean {
    return false
  }

  canInsertAfter(): boolean {
    return true
  }

  canBeEmpty(): boolean {
    return false
  }

  static childrenCanBeElements(): boolean {
    return true
  }

  static getAllowedChildTypes(): Array<string> {
    return ['exercise', 'solution']
  }
}

export class TaskNode extends ElementNode {
  static getType(): string {
    return 'task'
  }

  static clone(node: TaskNode): TaskNode {
    return new TaskNode(node.__key)
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'task'
    return dom
  }

  updateDOM(): boolean {
    return false
  }

  static importJSON(): TaskNode {
    return new TaskNode()
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: 'task',
      version: 1,
    }
  }
}

export class SolutionNode extends ElementNode {
  static getType(): string {
    return 'solution'
  }

  static clone(node: SolutionNode): SolutionNode {
    return new SolutionNode(node.__key)
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'solution'
    return dom
  }

  updateDOM(): boolean {
    return false
  }

  static importJSON(): SolutionNode {
    return new SolutionNode()
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: 'solution',
      version: 1,
    }
  }
}

function $createExerciseNode(): ExerciseNode {
  const exercise = new ExerciseNode()
  exercise.append($createTaskNode())
  exercise.append($createSolutionNode())
  return exercise
}

function $createTaskNode(): TaskNode {
  const node = new TaskNode()
  node.append($createParagraphNodeWithText('Task content...'))
  return node
}

function $createSolutionNode(): SolutionNode {
  const node = new SolutionNode()
  node.append($createParagraphNodeWithText('Solution content...'))
  return node
}

function $createParagraphNodeWithText(text: string) {
  const paragraphNode = $createParagraphNode()
  paragraphNode.append($createTextNode(text))
  return paragraphNode
}

export function ExerciseNodeTransformations() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.registerNodeTransform(TaskNode, (node) => {
      const parent = node.getParent()

      if (parent == null) return
      if (parent.getType() === 'exercise') return

      const nextSibling = node.getNextSibling()
      const solutionNode =
        nextSibling?.getType() === 'solution'
          ? nextSibling
          : $createSolutionNode()

      const taskNode = new ExerciseNode()

      node.insertBefore(taskNode)
      taskNode.append(node)
      taskNode.append(solutionNode)
    })
  }, [editor])

  useEffect(() => {
    editor.registerNodeTransform(ExerciseNode, (node) => {
      const parent = node.getParent()
      const topLevelNode = node.getTopLevelElement()

      if (
        parent !== null &&
        topLevelNode !== null &&
        parent.getType() !== 'root'
      ) {
        topLevelNode.insertAfter(node)
      }
    })
  }, [editor])

  useEffect(() => {
    return editor.registerNodeTransform(TaskNode, (node) => {
      const children = node.getChildren()

      if (children.length === 0) {
        node.append($createParagraphNodeWithText('Task content...'))
      }
    })
  }, [editor])

  useEffect(() => {
    return editor.registerNodeTransform(SolutionNode, (node) => {
      const children = node.getChildren()

      if (children.length === 0) {
        node.append($createParagraphNodeWithText('Solution content...'))
      }
    })
  }, [editor])

  useEffect(() => {
    return editor.registerNodeTransform(ExerciseNode, (node) => {
      const children = node.getChildren()

      if (
        children.length !== 2 ||
        children[0].getType() !== 'task' ||
        children[1].getType() !== 'solution'
      ) {
        const taskNode =
          children.find((child) => child.getType() === 'task') ||
          $createTaskNode()
        const solutionNode =
          children.find((child) => child.getType() === 'solution') ||
          $createSolutionNode()

        for (const child of children) {
          child.remove()
        }

        node.append(taskNode)
        node.append(solutionNode)
      }
    })
  }, [editor])

  const createPreventListener = useCallback(
    (isBackwards: boolean) => (event: KeyboardEvent) => {
      const selection = $getSelection()

      if (!$isRangeSelection(selection)) return false

      const { anchor } = selection
      const anchorNode = anchor.getNode()
      const parent = anchorNode.getParent()

      if (parent === null) return false

      if (
        isBackwards &&
        (parent.getPreviousSibling() !== null || anchor.offset !== 0)
      ) {
        return false
      }

      if (
        !isBackwards &&
        (parent.getNextSibling() !== null ||
          anchor.offset !== anchorNode.getTextContentSize())
      ) {
        return false
      }

      if (
        parent.getParent()?.getType() === 'solution' ||
        parent.getParent()?.getType() === 'task'
      ) {
        // Prevent deletion in TaskNode or SolutionNode
        event.preventDefault()
        return true
      }

      return false
    },
    [],
  )

  useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      createPreventListener(true),
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor, createPreventListener])

  useEffect(() => {
    return editor.registerCommand(
      KEY_DELETE_COMMAND,
      createPreventListener(false),
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor, createPreventListener])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        const anchorPath = getPath(selection.anchor.getNode())
        const focusPath = getPath(selection.focus.getNode())

        const { commonElements, restFocus, restAnchor } = commonAncestors(
          anchorPath,
          focusPath,
        )

        const commonAncestor = R.last(commonElements)

        const newSelection = selection.clone()

        if (commonAncestor != null && commonAncestor instanceof ExerciseNode) {
          $setSelectionToNode(newSelection, commonAncestor, 'anchor')
          $setSelectionToNode(newSelection, commonAncestor, 'focus')
        }

        const restAnchorFirst = R.head(restAnchor)

        if (
          restAnchorFirst != null &&
          restAnchorFirst instanceof ExerciseNode
        ) {
          $setSelectionToNode(newSelection, restAnchorFirst, 'anchor')
        }

        const restFocusFirst = R.head(restFocus)

        if (restFocusFirst != null && restFocusFirst instanceof ExerciseNode) {
          $setSelectionToNode(newSelection, restFocusFirst, 'focus')
        }

        if (!selection.is(newSelection)) {
          $setSelection(newSelection)
          return true
        }

        return false
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor])

  return null
}

function $setSelectionToNode(
  selection: RangeSelection,
  node: ElementNode,
  attribute: 'anchor' | 'focus',
) {
  const { key, index } = getParentKeyAndIndex(node)

  if (key === null || index === null) {
    return
  }

  if (attribute === 'anchor') {
    selection.anchor.set(key, index, 'element')
  } else {
    selection.focus.set(key, index + 1, 'element')
  }
}

function getParentKeyAndIndex(
  node: ElementNode,
): { key: string; index: number } | { key: null; index: null } {
  const parent = node.getParent()
  if (parent === null) {
    return { key: null, index: null }
  }
  const nodeIndex = parent.getChildren().indexOf(node)
  return { key: parent.getKey(), index: nodeIndex }
}

function commonAncestors(
  anchorNodes: Array<ElementNode | TextNode>,
  focusNodes: Array<ElementNode | TextNode>,
) {
  const commonElements: Array<ElementNode | TextNode> = []

  for (let i = 0; i < Math.min(anchorNodes.length, focusNodes.length); i++) {
    if (anchorNodes[i].is(focusNodes[i])) {
      commonElements.push(anchorNodes[i])
    } else {
      break
    }
  }

  return {
    commonElements,
    restAnchor: anchorNodes.slice(commonElements.length),
    restFocus: focusNodes.slice(commonElements.length),
  }
}

function getPath(node: ElementNode | TextNode | null) {
  const path: Array<ElementNode | TextNode> = []
  let currentNode: ElementNode | TextNode | null = node

  while (currentNode !== null) {
    path.push(currentNode)
    currentNode = currentNode.getParent()
  }

  return R.reverse(path)
}
