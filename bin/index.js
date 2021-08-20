#!/usr/bin/env node

import Hyperbeam from "hyperbeam";
import { createTar, extractTar } from "../lib/main.mjs";
import rw from "random-words";
import minimist from "minimist";

const args = minimist(process.argv.slice(2));
let key, beam;

if (args.i && args.o) {
  console.log(
    "Only use either input[-i] or output[-o], 'folderbeam help' for usage "
  );
}

key = args.w;

if (!args.w && args.o) {
  console.log("Key is required!");
} else if (!args.w) {
  key = rw({ exactly: 3, join: " " });
}

if (args.i) {
  beam = new Hyperbeam(key);
  console.log(`\n\t\t ${key} \t\t\n`);

  const stream = createTar(args.i);
  stream.on("end", () => {
    console.log("Folder Beaming Complete!");
    beam.end();
  });
  stream.pipe(beam);
} else {
  beam = new Hyperbeam(key);

  const stream = extractTar(args.o);

  beam.pipe(stream);

  beam.on("end", () => {
    console.log("Folder Beaming Complete!");
    beam.end();
  });
}
