export function take_one(data) {
    return [data[0], data.slice(1)];
}

export function collapse(list) {
  return list.reduce((acc, val) => {
    let last_elem = acc[acc.length-1]

    if (typeof last_elem == 'string' && typeof val == 'string') {
      acc[acc.length-1] = last_elem + val
    } else {
      acc.push(val)
    }

    return acc
  }, [])
}

export function take_while(data, chars) {
    let idx = 0
    let res = []
    let size = data.length

    while (idx < size && chars.indexOf(data[idx]) >= 0) {
        res.push(data[idx]);
        idx += 1;
    }

    return [res, data.slice(idx)];
}


export function take_until(data, chars) {
    let idx = 0
    let res = []
    let size = data.length

    while (idx < size && chars.indexOf(data[idx]) < 0) {
        res.push(data[idx]);
        idx += 1;
    }

    return [res, data.slice(idx)];
}

export function take_until_quoted(data, quoted_char) {
  let idx = 0
  let res = []
  let size = data.length

  while (idx < size && data[idx] != quoted_char) {
    let cur_char = data[idx]
    res.push(cur_char)
    if (cur_char == '\\') {
      res.push(data[idx+1])
      idx += 2
    } else {
      idx += 1
    }
  }

  return [res, data.slice(idx)]
}

export function take_until_cb(data, cb) {
    let idx = 0
    let res = []
    let size = data.length

    while (idx < size && cb(data[idx])) {
        res.push(data[idx]);
        idx += 1;
    }

    return [res, data.slice(idx)];
}
