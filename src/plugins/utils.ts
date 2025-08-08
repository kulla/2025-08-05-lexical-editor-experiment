import { $getRoot, $getSelection, $isRangeSelection } from 'lexical'

export function $getSelectedTopLevelNode() {
  const root = $getRoot()
  const selection = $getSelection()

  if (!$isRangeSelection(selection)) return root

  return selection.focus.getNode().getTopLevelElement() || root
}
