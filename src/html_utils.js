export function get_node_range(start, end) {
  let nodes = []
  let current = start;

  while(current.nextSibling != null && current.nextSibling != end) {
    nodes.push(current.nextSibling);
    current = current.nextSibling;
  }

  return nodes
}


export function remove_nodes(nodes) {
  for (let node of nodes) {
    if (node.parentElement) {
      node.parentElement.removeChild(node)
    }
  }
}
