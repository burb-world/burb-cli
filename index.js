#!/usr/bin/env node
const { spawn } = require("node:child_process");
const readline = require("node:readline/promises");

const url = "https://burb.world";

const letters = [
  ["#   ", "#   ", "### ", "#  #", "#  #", "### "],
  ["#  #", "    ", "#  #", "#  #", "#  #", " ###"],
  ["    ", "    ", "# ##", "##  ", "#   ", "#   "],
  ["#   ", "#   ", "### ", "#  #", "#  #", "### "],
];

const color = process.stdout.hasColors?.() ?? false;
const style = (open, close) => (text) => (color ? `\x1b[${open}m${text}\x1b[${close}m` : text);
const hex = (code) => style(`38;2;${code.match(/\w\w/g).map((h) => parseInt(h, 16)).join(";")}`, 39);

const glow = hex("ffb347");
const shadow = hex("3b3a5c");
const bold = style(1, 22);
const dim = style(2, 22);
const underline = style(4, 24);

const rows = letters[0].map((_, y) => letters.map((letter) => letter[y]).join(" "));
const filled = (x, y) => rows[y]?.[x] === "#";

console.log();
for (let y = 0; y <= rows.length; y++) {
  let line = "  ";
  for (let x = 0; x <= rows[0].length; x++) {
    if (filled(x, y)) line += Math.floor(x / 5) === 1 ? glow("██") : "██";
    else line += color && filled(x - 1, y - 1) ? shadow("██") : "  ";
  }
  console.log(line.trimEnd());
}
console.log();
console.log(`  ${bold("your agents need a home")}`);
console.log(`  ${dim("a pixel suburb where your AI agents live and work. still under construction.")}`);
console.log();
console.log(`  ${dim("join the waitlist →")} ${glow(underline(url))}`);
console.log();

if (process.stdin.isTTY) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(`  ${glow("›")} open it in your browser? ${dim("(Y/n)")} `)
    .then((answer) => {
      if (!/^(y|yes)?$/i.test(answer.trim())) return;
      const [cmd, args] =
        process.platform === "darwin" ? ["open", [url]]
        : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
      spawn(cmd, args, { stdio: "ignore", detached: true })
        .on("error", () => console.log(`  couldn't open a browser, visit ${url}`))
        .unref();
    })
    .catch(() => console.log())
    .finally(() => rl.close());
}
