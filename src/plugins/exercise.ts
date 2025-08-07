import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  ElementNode,
  type SerializedElementNode,
  type LexicalEditor,
  $getRoot,
  $createParagraphNode,
  LexicalNode,
} from 'lexical'
import { useEffect } from 'react'

export function insertExercise(editor: LexicalEditor): void {
  editor.update(() => {
    const container = new ExerciseNode()
    const task = new TaskNode()
    const solution = new SolutionNode()

    task.append($createParagraphNode())
    solution.append($createParagraphNode())

    container.append(task, solution)

    const root = $getRoot()
    root.append(container)
  })
}

export class ExerciseNode extends ElementNode {
  removeChild(child: LexicalNode): void {
    throw new Error('Method not implemented.')
  }
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

export function ExerciseNodeTransformations() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.registerNodeTransform(ExerciseNode, (node) => {
      console.log('ExerciseNodeTransformations', node)
      const children = node.getChildren()

      console.log('ExerciseNodeTransformations', children)

      if (
        children.length !== 2 ||
        children[0].getType() !== 'task' ||
        children[1].getType() !== 'solution'
      ) {
        const taskNode =
          children.find((child) => child.getType() === 'task') || new TaskNode()
        const solutionNode =
          children.find((child) => child.getType() === 'solution') ||
          new SolutionNode()

        for (const child of children) {
          child.remove()
        }

        node.append(taskNode)
        node.append(solutionNode)
      }
    })
  }, [editor])

  return null
}
