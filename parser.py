import click

template = [
    '<a href=', '>hello</a><div cla', 'ss=', '> <div> children ', '</div><div> ch2</div>', '</div>', ''
]

params = ['a', 'b', 'c', 'd', 'e', 'f','g']


class Param(object):
    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return f"${{{self.value}}}"


def normalizer(template, params):
    result = zip(template, params)
    res = []

    for x, y in result:
        res += x
        res += [Param(y[0])]

    return res


class StopParse(Exception):
    pass


class TextNode(object):
    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return f"'{reprl(self.value)}'"


class Tag(object):
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return reprl(self.value)


class Element(object):
    def __init__(self, name, attributes, children):
        self.name = name
        self.attributes = attributes
        self.children = children

    def __repr__(self):
        return f"<{self.name} {self.attributes}>{self.children}</{self.name}>"


def reprl(value):
    return "".join(str(v) for v in value)


class Attribute(object):
    def __init__(self, name, value):
        self.name = name
        self.value = value

    def __repr__(self):
        name = reprl(self.name)
        value = reprl(self.value)
        return f"{name}={value}"


def take_one(data):
    return data[0], data[1:]


def take_while(data, chars):
    idx = 0
    res = []
    size = len(data)

    while idx < size and data[idx] in chars:
        res.append(data[idx])
        idx += 1

    return res, data[idx:]


def take_until(data, chars):
    idx = 0
    res = []
    size = len(data)
    while idx < size and data[idx] not in chars:
        res.append(data[idx])
        idx += 1

    return res, data[idx:]


def parse_tag(data):
    _, data = take_while(data, [' '])
    name, data = take_until(data, [' ', '>'])

    return Tag(name), data


def parse_attribute(data):
    _, data = take_while(data, [' '])
    name, data = take_until(data, [' ', '='])
    _, data = take_while(data, [' ', '='])
    value, data = take_until(data, [' ', '>'])

    attr = Attribute(name, value)

    return attr, data


def parse_attributes(data):
    attributes = []

    while data:
        if data[0] == '>':
            break

        attribute, data = parse_attribute(data)
        attributes.append(attribute)

    return attributes, data


def parse_element(data):
    _, data = take_one(data)
    tag, data = parse_tag(data)

    _, data = take_while(data, [' '])

    # Tag already closed
    if data[0] != '>':
        attributes, data = parse_attributes(data)
        # skip spaces then closing tag
        _, data = take_while(data, [' '])
    else:
        attributes = []

    _, data = take_while(data, ['>'])

    # Parse Nodes
    nodes, data = parse_nodes(data)

    _, data = take_while(data, ['<', '/'])
    tag2, data = parse_tag(data)
    _, data = take_while(data, [' '])
    _, data = take_while(data, ['>'])

    elem = Element(
        tag,
        attributes,
        nodes
    )

    return elem, data


def parse_text_node(data):
    text, data = take_until(data, ['<'])
    return TextNode(text), data


def parse_node(data):
    if data[0] == '<':
        if data[1] == '/':
            raise StopParse()

        node, data = parse_element(data)
    else:
        node, data = parse_text_node(data)

    return node, data


def parse_nodes(data):
    nodes = []
    while data:
        try:
            node, data = parse_node(data)
            nodes.append(node)
        except StopParse:
            break

    return nodes, data


def parse_html(data):
    nodes, data = parse_nodes(data)
    return nodes


@click.command()
def main():
    result = normalizer(template, params)
    print(result)

    result = parse_html(result)
    print(result)

    for elem in result:
        print(str(elem))


if __name__ == '__main__':
    main()
