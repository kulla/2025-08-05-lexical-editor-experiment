import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  ElementNode,
  type SerializedElementNode,
  type LexicalEditor,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  COMMAND_PRIORITY_HIGH,
  $getSelection,
  $isRangeSelection,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'
import { useCallback, useEffect } from 'react'

export function insertExercise(editor: LexicalEditor): void {
  editor.update(() => {
    const root = $getRoot()
    root.append($createExerciseNode())
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
      const children = node.getChildren()

      if (children.length === 0) {
        node.append($createParagraphNodeWithText('Task content...'))
      }
    })

    editor.registerNodeTransform(SolutionNode, (node) => {
      const children = node.getChildren()

      if (children.length === 0) {
        node.append($createParagraphNodeWithText('Solution content...'))
      }
    })

    editor.registerNodeTransform(ExerciseNode, (node) => {
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

  return null
}
