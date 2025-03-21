export const paramCounts = {
  a: 7,
  c: 6,
  h: 1,
  l: 2,
  m: 2,
  r: 4,
  q: 4,
  s: 4,
  t: 2,
  v: 1,
  z: 0
};

export const checkValues = (command, values) => {
  const c = command.toLowerCase();
  return paramCounts.hasOwnProperty(c)
    ? values.length === paramCounts[c] || values.length % paramCounts[c] === 0
    : false;
};

export const parse = path => {
  const re = /([MmLlSsQqLlHhVvCcSsQqTtAaZz])([^MmLlSsQqLlHhVvCcSsQqTtAaZz]*)/g;
  const num = /-?[0-9]*\.?\d+/g;
  const results = [];
  path.replace(re, (match, command, params) => {
    const values = params.match(num) || [];
    if (checkValues(command, values)) {
      results.push({ command, values });
    } else {
      console.log(
        `
⚠️  Command ${command} passed with invalid params length ${
          values.length
        } instead of ${paramCounts[command]}, ignored.
`
      );
    }
  });
  return results;
};

export const stringify = path => {
  return path.reduce((acc, next) => {
    return `${acc}${next["command"]}${next["values"].join(" ")}`;
  }, "");
};
