// Transient UI consumes Back before the app changes screen or exits.
const actions: Array<() => void> = []

export function registerBackAction(action: () => void) {
  actions.push(action)
  return () => {
    const index = actions.indexOf(action)
    if (index !== -1) actions.splice(index, 1)
  }
}

export function consumeBackAction() {
  const action = actions[actions.length - 1]
  if (!action) return false
  action()
  return true
}
